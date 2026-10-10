package expo.modules.viatom

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothDevice
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.Observer
import com.jeremyliao.liveeventbus.LiveEventBus
import com.jeremyliao.liveeventbus.utils.AppUtils
import com.lepu.blepro.constants.Ble
import com.lepu.blepro.event.EventMsgConst
import com.lepu.blepro.event.InterfaceEvent
import com.lepu.blepro.ext.BleServiceHelper
import com.lepu.blepro.ext.oxy.DeviceInfo
import com.lepu.blepro.ext.oxy.OxyFile
import com.lepu.blepro.ext.oxy.OxyFile.EachData
import com.lepu.blepro.ext.oxy.RtParam
import com.lepu.blepro.ext.oxy2.PpgFile
import com.lepu.blepro.ext.oxy2.RtPpg
import com.lepu.blepro.ext.oxy.RtWave
import com.lepu.blepro.objs.Bluetooth
import expo.modules.kotlin.events.EventEmitter
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.roundToInt

class ViatomModule : Module() {

    private var emitter: EventEmitter? = null
    private var subscribed = false
    private var serviceInitialized = false
    private val megaBp = MegaBpNative()
    private val waveHandler = Handler(Looper.getMainLooper())
    @Volatile private var wavePolling = false
    @Volatile private var wavePacketsSeen = 0
    @Volatile private var nextPollAt = 0L
    @Volatile private var pollCount = 0L

    // ---- continuous PPG capture, written as rotating chunk files ----
    private val chunkLock = Any()
    private var ppgDir: java.io.File? = null
    private var ppgPrefix = "PPG_Raw"
    private var ppgChunkMs = 600_000L
    private var chunkFile: java.io.File? = null      // the open "<name>.csv.part" file
    private var chunkStartTs = 0L
    private var chunkSampleIdx = 0L

    // Asks the ring for one packet (~125 samples = 1 s) every second, on a fixed clock
    private val waveTask = object : Runnable {
        override fun run() {
            if (!wavePolling) return
            val model = connectedModel
            if (model == null) { stopPpgCapture(); return }
            try {
                BleServiceHelper.BleServiceHelper.oxyGetRtWave(model)
            } catch (e: Exception) {
                ev("oxyGetRtWave failed: ${e.message}")
            }
            pollCount++
            if (pollCount % 300L == 0L) ev("heartbeat: polls=$pollCount")   // every ~5 minutes
            nextPollAt += 1000L
            val now = SystemClock.uptimeMillis()
            if (nextPollAt < now) nextPollAt = now + 1000L   // we fell behind: do not fire a burst
            waveHandler.postAtTime(this, nextPollAt)
        }
    }

    private fun openChunkLocked(dir: java.io.File, ts: Long) {
        val stamp = java.text.SimpleDateFormat("yyyyMMddHHmmss", java.util.Locale.US)
            .format(java.util.Date(ts))
        val part = java.io.File(dir, "${ppgPrefix}_$stamp.csv.part")
        try {
            part.writeText("timestamp_ms,sample_index,time_s,ppg_value\n")
            chunkFile = part
            chunkStartTs = ts
            chunkSampleIdx = 0L
        } catch (e: Exception) {
            Log.w("ViatomPPG", "could not create chunk file", e)
            chunkFile = null
        }
    }

    // Finishes the open chunk (".csv.part" -> ".csv"). Call while holding chunkLock.
    // Returns the payload for the "onPpgChunkReady" event, or null if nothing to report.
    private fun closeChunkLocked(): Map<String, Any?>? {
        val part = chunkFile ?: return null
        chunkFile = null
        val rows = chunkSampleIdx
        chunkSampleIdx = 0L
        if (rows == 0L) { part.delete(); return null }
        val done = java.io.File(part.parentFile, part.name.removeSuffix(".part"))
        return if (part.renameTo(done)) {
            ev("chunk ready ${done.name} rows=$rows")
            mapOf(
                "path" to done.absolutePath,
                "name" to done.name,
                "dir" to done.parent,
                "rows" to rows.toInt(),
                "startTs" to chunkStartTs.toDouble()
            )
        } else {
            Log.w("ViatomPPG", "could not finalize ${part.name}")
            null
        }
    }

    // Stops polling and closes the current chunk. Does NOT stop the foreground service,
    // so a history sync or a reconnect does not lose the "keep running" status.
    private fun stopPpgCapture() {
        if (wavePolling) ev("capture stopping")
        wavePolling = false
        waveHandler.removeCallbacksAndMessages(null)
        val ev = synchronized(chunkLock) { closeChunkLocked() }
        if (ev != null) emitter?.emit("onPpgChunkReady", ev)
    }

    private fun startKeepAlive() {
        val ctx = appContext.reactContext ?: return
        try {
            ContextCompat.startForegroundService(
                ctx, android.content.Intent(ctx, PpgKeepAliveService::class.java)
            )
            ev("keep-alive service start requested")
        } catch (e: Exception) {
            // e.g. Android 12+ refuses to start a foreground service while the app is in the background
            ev("could not start keep-alive service: ${e.message}")
        }
    }

    private fun stopKeepAlive() {
        val ctx = appContext.reactContext ?: return
        try {
            ctx.stopService(android.content.Intent(ctx, PpgKeepAliveService::class.java))
        } catch (e: Exception) {
            Log.w("ViatomPPG", "could not stop keep-alive service", e)
        }
    }

    // Writes to logcat AND to <external app files>/ppg_events.log (readable with adb pull, even on release builds)
    private fun ev(msg: String) {
        Log.d("ViatomPPG", msg)
        PpgEventLog.log(appContext.reactContext, msg)
    }

    // Remember any scanned devices by MAC
    private val foundDevices = mutableMapOf<String, Bluetooth>()

    private var connectedModel: Int? = null
    private var connectedMac: String? = null

    // Keep references so observers can be removed cleanly
    private val liveObservers = mutableListOf<LiveObserver<*>>()

    override fun definition() = ModuleDefinition {
        Name("Viatom")

        Events(
            "onDeviceFound",     // { mac, name, model }
            "onConnected",       // { mac, model }
            "onDisconnected",    // { mac?, model?, reason? }
            "onRealtime",        // { spo2, pr, pi, motion, ts }
            "onRtPpg",           // { ir, red, motion, size, ts }
            "onInfo",            // { battery, state, files }
            "onHistoryFile",     // { csv, startTime }
            "onPpgFile",         // { sampleInts, sampleRate, sampleTime, sn }
            "onReadProgress",    // { progress }
            "onError",            // { code, message }
            "onWaveformReceived",
            "onPpgChunkReady"    // { path, name, dir, rows, startTs }
        )

        OnStartObserving { emitter = appContext.eventEmitter(this@ViatomModule) }
        OnStopObserving {
            emitter = null
            clearObservers()
        }
        OnDestroy { ev("module destroyed"); stopPpgCapture(); stopKeepAlive(); clearObservers() }

        // ------------- BASIC FUNCTIONS EXPOSED TO JS -------------

        // 1) Ask for Android permissions
        AsyncFunction("requestPermissions") {
            val act: Activity =
                appContext.activityProvider?.currentActivity ?: throw CodedException("NO_ACTIVITY")

            val missing =
                requiredPermissions().filter {
                    ContextCompat.checkSelfPermission(act, it) != PackageManager.PERMISSION_GRANTED
                }

            if (missing.isEmpty()) {
                true
            } else {
                ActivityCompat.requestPermissions(act, missing.toTypedArray(), 1234)
                false
            }
        }

        // 2) Initialize listeners
        AsyncFunction("initialize") {
            ensureServiceInitialized()
            subscribeIfNeeded()
            true
        }

        // 3) Start scanning for Lepu devices
        AsyncFunction("scan") {
            ensureServiceInitialized()
            subscribeIfNeeded()
            foundDevices.clear()
            BleServiceHelper.BleServiceHelper.startScan()
            true
        }

        // 4) Stop scan
        AsyncFunction("stopScan") {
            BleServiceHelper.BleServiceHelper.stopScan()
            true
        }

        // 5) Connect by MAC + model
        AsyncFunction("connect") { mac: String, _: Int ->
            ensureServiceInitialized()
            subscribeIfNeeded()

            val act = appContext.activityProvider?.currentActivity ?: throw CodedException("NO_ACTIVITY")
            val bt = foundDevices[mac] ?: throw CodedException("DEVICE_NOT_FOUND")

            BleServiceHelper.BleServiceHelper.setInterfaces(bt.model)
            BleServiceHelper.BleServiceHelper.connect(act.applicationContext, bt.model, bt.device)
            ev("connect() mac=$mac model=${bt.model}")

            connectedModel = bt.model
            connectedMac = mac

            true
        }

        // 6) Disconnect current device
        AsyncFunction("disconnect") {
            stopPpgCapture()
            stopKeepAlive()
            val model = connectedModel
            if (model != null) {
                BleServiceHelper.BleServiceHelper.disconnect(model, false)
            } else {
                BleServiceHelper.BleServiceHelper.disconnect(false)
            }
            true
        }

        // 7) Start realtime param stream
        AsyncFunction("startRealtime") {
            val model = connectedModel ?: throw CodedException("NO_DEVICE_CONNECTED")
            if (!wavePolling) {
                BleServiceHelper.BleServiceHelper.oxyGetRtParam(model)
            }
            true
        }

        AsyncFunction("stopRealtime") {
            true
        }

        // 8) Fetch device info
        AsyncFunction("getInfo") {
            val model = connectedModel ?: throw CodedException("NO_DEVICE_CONNECTED")

            requestInfo(model)
            true
        }

        // 9) Read history file by name
        AsyncFunction("readHistoryFile") { filename: String ->
            val model = connectedModel ?: throw CodedException("NO_DEVICE_CONNECTED")

            BleServiceHelper.BleServiceHelper.oxyReadFile(model, filename)
            true
        }

        Function("initBpAlgorithm") {
            megaBp.initNative()
        }

        Function("stopBpAlgorithm") {
            megaBp.terminateNative()
        }

        // Starts continuous PPG capture. Chunk files are written to
        // <app files>/ppg/<patientId>/<prefix>_<yyyyMMddHHmmss>.csv  (one every chunkSeconds).
        // Returns the folder path.
        AsyncFunction("startPpgCapture") { patientId: String, prefix: String, chunkSeconds: Int ->
            val model = connectedModel ?: throw CodedException("NO_DEVICE_CONNECTED")
            val base = appContext.reactContext?.filesDir ?: throw CodedException("NO_STORAGE")
            val safeId = patientId.replace(Regex("[^A-Za-z0-9+_ -]"), "_").ifBlank { "unknown" }
            val dir = java.io.File(java.io.File(base, "ppg"), safeId)
            dir.mkdirs()

            stopPpgCapture()   // close any chunk that is still open

            // finish chunks left behind by an earlier run that was killed mid-write
            dir.listFiles()?.filter { it.name.endsWith(".csv.part") }?.forEach { p ->
                if (p.length() > 100) {
                    p.renameTo(java.io.File(dir, p.name.removeSuffix(".part")))
                } else {
                    p.delete()
                }
            }

            synchronized(chunkLock) {
                ppgDir = dir
                ppgPrefix = prefix.replace(Regex("[^A-Za-z0-9_-]"), "_")
                ppgChunkMs = chunkSeconds.coerceAtLeast(30) * 1000L
            }

            wavePacketsSeen = 0
            pollCount = 0L
            wavePolling = true
            nextPollAt = SystemClock.uptimeMillis()
            waveHandler.removeCallbacksAndMessages(null)
            waveHandler.post(waveTask)
            startKeepAlive()
            ev("capture started model=$model chunk=${chunkSeconds}s dir=${dir.absolutePath}")
            dir.absolutePath
        }

        // Stops polling and closes the open chunk (it is announced via onPpgChunkReady)
        AsyncFunction("stopPpgCapture") {
            stopPpgCapture()
            true
        }

        // Lets the JavaScript side write into the same event log
        AsyncFunction("logEvent") { message: String ->
            ev("JS: $message")
            true
        }

        // Also removes the foreground-service notification
        AsyncFunction("stopPpgService") {
            stopPpgCapture()
            stopKeepAlive()
            true
        }
    }

    // --------------------------------
    // SUBSCRIBE TO GENERIC BLE EVENTS
    // --------------------------------
    private fun subscribeToBleEvents() {
        // New device found while scanning
        addObserver(EventMsgConst.Discovery.EventDeviceFound, Bluetooth::class.java) { bt ->
            val device: BluetoothDevice = bt.device
            val mac = device.address ?: return@addObserver
            foundDevices[mac] = bt

            emitter?.emit(
                "onDeviceFound",
                mapOf("mac" to mac, "name" to (device.name ?: "Unknown"), "model" to bt.model)
            )
        }

        // Service ready (SDK initialized)
        addObserver(EventMsgConst.Ble.EventServiceConnectedAndInterfaceInit, Boolean::class.java) { ok ->
            if (!ok) {
                emitter?.emit(
                    "onError",
                    mapOf(
                        "code" to "SERVICE_INIT_FAILED",
                        "message" to "Lepu BLE service failed to init"
                    )
                )
            }
        }

        // Device ready to receive commands
        addObserver("com.lepu.ble.device.ready", Any::class.java) {
            val model = connectedModel
            if (model != null) {
                requestInfo(model)
            }
        }
    }

    // ------------- SUBSCRIBE TO OXY (O2Ring) EVENTS -------------

    private fun subscribeToOxyEvents() {
        // 0. Sync device info event
        addObserver(InterfaceEvent.Oxy.EventOxySyncDeviceInfo, InterfaceEvent::class.java) { evt ->
            val model = evt.model
            val data = evt.data as? Array<*>
            Log.d("ViatomModule", "EventOxySyncDeviceInfo model=$model data=${data?.joinToString()}")

            if (model == connectedModel) {
                requestInfo(model)
            }
        }

        // 1. Real-time param data (SpO2, PR, PI, motion)
        addObserver(InterfaceEvent.Oxy.EventOxyRtParamData, InterfaceEvent::class.java) { evt ->
            val d = evt.data as RtParam
            emitter?.emit(
                "onRealtime",
                mapOf(
                    "spo2" to d.spo2,
                    "pr" to d.pr,
                    "pi" to d.pi,
                    "motion" to d.vector,
                    "ts" to System.currentTimeMillis()
                )
            )
        }

        // 2. Device info (battery, state, file list)
        addObserver(InterfaceEvent.Oxy.EventOxyInfo, InterfaceEvent::class.java) { evt ->
            val info = evt.data as DeviceInfo
            val list = info.fileList.split(",").map { it.trim() }.filter { it.isNotBlank() }

            val batteryPercent = parseBatteryValue(info.batteryValue)
            val payload =
                mutableMapOf<String, Any?>(
                    "state" to info.curState,
                    "files" to list,
                    "batteryState" to info.batteryState
                )
            if (batteryPercent != null) {
                payload["battery"] = batteryPercent
            }

            Log.d(
                "ViatomModule",
                "EventOxyInfo batteryValue=${info.batteryValue} batteryState=${info.batteryState} state=${info.curState} files=${list.size}"
            )

            emitter?.emit("onInfo", payload)

            val model = connectedModel
            if (model != null && !wavePolling) {
                BleServiceHelper.BleServiceHelper.oxyGetRtParam(model)
            }
        }

        // 3. Read file progress
        addObserver(InterfaceEvent.Oxy.EventOxyReadingFileProgress, InterfaceEvent::class.java) { evt ->
            val progress = evt.data as Int
            emitter?.emit("onReadProgress", mapOf("progress" to progress))
        }

        // 4. Read file complete
        addObserver(InterfaceEvent.Oxy.EventOxyReadFileComplete, InterfaceEvent::class.java) { evt ->
            val file = evt.data as OxyFile
            val csv = convertOxyFileToCsv(file)

            emitter?.emit("onHistoryFile", mapOf("csv" to csv, "startTime" to file.startTime))
        }

        // 5. Read file error
        addObserver(InterfaceEvent.Oxy.EventOxyReadFileError, InterfaceEvent::class.java) { evt ->
            val failed = evt.data as Boolean
            if (failed) {
                emitter?.emit(
                    "onError",
                    mapOf("code" to "READ_FILE_ERROR", "message" to "Failed to read history file")
                )
            }
        }

        // 6. Disconnect reason
        addObserver(EventMsgConst.Ble.EventBleDeviceDisconnectReason, Int::class.java) { reason ->
            emitter?.emit(
                "onDisconnected",
                mapOf("reason" to reason, "mac" to connectedMac, "model" to connectedModel)
            )
            ev("ring disconnected reason=$reason")
            stopPpgCapture()   // close the open chunk; the service keeps running for the reconnect
            connectedModel = null
            connectedMac = null
        }

        // 7. Real-time PPG listener using String key fallback if InterfaceEvent constant isn't bound directly
        addObserver("EventOxyRtPpgData", InterfaceEvent::class.java) { evt ->
            val ppg = evt.data as? RtPpg ?: return@addObserver

            emitter?.emit(
                "onRtPpg",
                mapOf(
                    "ir" to (ppg.irArray?.toList() ?: emptyList<Int>()),
                    "red" to (ppg.redArray?.toList() ?: emptyList<Int>()),
                    "motion" to (ppg.motionArray?.toList() ?: emptyList<Int>()),
                    "size" to ppg.size,
                    "ts" to System.currentTimeMillis()
                )
            )
        }

        // 8. Historical PPG file complete listener
        addObserver("EventOxyReadFilePpgComplete", InterfaceEvent::class.java) { evt ->
            val file = evt.data as? PpgFile ?: return@addObserver

            emitter?.emit(
                "onPpgFile",
                mapOf(
                    "sampleInts" to (file.sampleIntsData?.toList() ?: emptyList<Int>()),
                    "sampleRate" to file.sampleRate,
                    "sampleTime" to file.sampleTime,
                    "sn" to file.sn
                )
            )
        }
        // 9. Real-time waveform: one packet of ~125 samples (125 Hz) per request
        addObserver(InterfaceEvent.Oxy.EventOxyRtData, InterfaceEvent::class.java) { evt ->
            val rtWave = evt.data as? RtWave ?: return@addObserver
            val wFs = rtWave.wFs ?: return@addObserver
            if (wFs.isEmpty()) return@addObserver
            if (!wavePolling) return@addObserver

            // The first packet after starting is stale buffer data, so skip it
            if (wavePacketsSeen++ == 0) {
                Log.d("ViatomPPG", "skipping first (stale) packet")
                return@addObserver
            }

            val ts = System.currentTimeMillis()
            if (wFs.size != 125) ev("short packet: ${wFs.size} samples")
            var ready: Map<String, Any?>? = null

            synchronized(chunkLock) {
                val dir = ppgDir
                if (dir != null) {
                    if (chunkFile == null) openChunkLocked(dir, ts)
                    val f = chunkFile
                    if (f != null) {
                        val sb = StringBuilder()
                        for (sample in wFs) {
                            val timeS = String.format(java.util.Locale.US, "%.3f", chunkSampleIdx / 125.0)
                            sb.append(ts).append(',').append(chunkSampleIdx).append(',')
                                .append(timeS).append(',').append(sample).append('\n')
                            chunkSampleIdx++
                        }
                        try { f.appendText(sb.toString()) }
                        catch (e: Exception) { Log.w("ViatomPPG", "CSV write failed", e) }

                        // chunk is full: finish it; the next packet opens the next chunk with no gap
                        if (ts - chunkStartTs >= ppgChunkMs) ready = closeChunkLocked()
                    }
                }
            }

            // keep SpO2/PR updating while wave polling replaces param polling
            emitter?.emit("onRealtime", mapOf(
                "spo2" to rtWave.spo2, "pr" to rtWave.pr,
                "pi" to rtWave.pi, "motion" to 0, "ts" to ts))

            ready?.let { emitter?.emit("onPpgChunkReady", it) }
        }
    }

    private fun convertOxyFileToCsv(file: OxyFile): String {
        val dataPoints: List<EachData> = file.data ?: emptyList()
        val recordingTime = file.recordingTime
        if (dataPoints.isEmpty() || recordingTime <= 0) {
            return "Time,Oxygen Level,Pulse Rate,Motion,O2 Reminder,PR Reminder"
        }

        val totalPoints = (recordingTime / 4).coerceAtLeast(1)
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", java.util.Locale.US)
        val sb = StringBuilder()
        sb.append("Time,Oxygen Level,Pulse Rate,Motion,O2 Reminder,PR Reminder\n")

        for (idx in 0 until totalPoints) {
            val targetSeconds = idx * 4
            val percent = if (totalPoints > 1) idx.toFloat() / (totalPoints - 1).toFloat() else 0f
            val rec = getDataAtPercent(percent, dataPoints)

            if ((rec.spo2 in 1..149) || (rec.pr in 1..349)) {
                val tsMillis = (file.startTime * 1000L) + targetSeconds * 1000L
                val timeStr = sdf.format(java.util.Date(tsMillis))
                sb.append(timeStr)
                    .append(',')
                    .append(rec.spo2)
                    .append(',')
                    .append(rec.pr)
                    .append(',')
                    .append(rec.vector)
                    .append(',')
                    .append(if (rec.isWarningSignSpo2) 1 else 0)
                    .append(',')
                    .append(if (rec.isWarningSignPr) 1 else 0)
                    .append('\n')
            }
        }

        return sb.toString().trimEnd()
    }

    private fun getDataAtPercent(percent: Float, dataPoints: List<EachData>): EachData {
        if (dataPoints.isEmpty()) throw IllegalArgumentException("No data points available")
        val clamped = percent.coerceIn(0f, 1f)
        val idx =
            ((dataPoints.size - 1) * clamped)
                .toDouble()
                .roundToInt()
                .coerceIn(0, dataPoints.size - 1)
        return dataPoints[idx]
    }

    private fun parseBatteryValue(raw: String?): Int? {
        if (raw == null) return null
        val trimmed = raw.trim()
        trimmed.toIntOrNull()?.let {
            return it
        }
        val digits = trimmed.filter { it.isDigit() || it == '-' }
        return digits.toIntOrNull()
    }

    private fun ensureServiceInitialized() {
        if (serviceInitialized) return

        val app =
            appContext.reactContext?.applicationContext as? android.app.Application
                ?: appContext.activityProvider?.currentActivity?.application
                ?: throw CodedException("NO_APPLICATION")

        AppUtils.init(app)
        BleServiceHelper.BleServiceHelper.initService(app)
        serviceInitialized = true
    }

    private fun subscribeIfNeeded() {
        if (subscribed) return
        subscribeToBleEvents()
        subscribeToOxyEvents()
        subscribed = true
    }

    private fun requiredPermissions(): Array<String> =
        arrayOf(
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

    private fun requestInfo(model: Int) {
        try {
            BleServiceHelper.BleServiceHelper.oxyGetInfo(model)
        } catch (e: Exception) {
            Log.w("ViatomModule", "oxyGetInfo failed, falling back to direct call", e)
            val iface = BleServiceHelper.BleServiceHelper.getInterface(model) ?: throw e
            iface.dobl()
        }
    }
    private fun handlePpgEvent(tag: String, evt: InterfaceEvent) {
        val d = evt.data
        Log.d("ViatomPPG", "$tag model=${evt.model} dataClass=${d?.javaClass?.name} data=$d")

        when (d) {
            is com.lepu.blepro.ext.oxy.RtPpg -> emitter?.emit(
                "onRtPpg",
                mapOf(
                    "ir" to (d.ir?.toList() ?: emptyList<Int>()),
                    "red" to (d.red?.toList() ?: emptyList<Int>()),
                    "motion" to (d.motion?.toList() ?: emptyList<Int>()),
                    "size" to d.size,
                    "ts" to System.currentTimeMillis()
                )
            )
            is RtPpg -> emitter?.emit(
                "onRtPpg",
                mapOf(
                    "ir" to (d.irArray?.toList() ?: emptyList<Int>()),
                    "red" to (d.redArray?.toList() ?: emptyList<Int>()),
                    "motion" to (d.motionArray?.toList() ?: emptyList<Int>()),
                    "size" to d.size,
                    "ts" to System.currentTimeMillis()
                )
            )
        }
    }
    private fun <T> addObserver(key: String, clazz: Class<T>, block: (T) -> Unit) {
        val observer = Observer<T> { block(it) }
        runOnMain {
            LiveEventBus.get(key, clazz).observeForever(observer)
            liveObservers.add(LiveObserver(key, clazz, observer))
        }
    }

    private fun clearObservers() {
        runOnMain {
            liveObservers.forEach { entry ->
                @Suppress("UNCHECKED_CAST") val obs = entry.observer as Observer<Any>
                LiveEventBus.get(entry.key, entry.clazz as Class<Any>).removeObserver(obs)
            }
            liveObservers.clear()
            subscribed = false
        }
    }

    private data class LiveObserver<T>(
        val key: String,
        val clazz: Class<T>,
        val observer: Observer<T>
    )

    private fun runOnMain(block: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            block()
        } else {
            Handler(Looper.getMainLooper()).post { block() }
        }
    }
}