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
    @Volatile private var liveWave = false   // the live screen turns this on while it is open
    private var lastMotion = 0

    // Sends finished chunk files to the server from its own thread (does not depend on JavaScript)
    private val uploader = PpgUploader(log = { msg -> ev("upload: $msg") })
    @Volatile private var uploadConfig: PpgUploader.Config? = null

    // ---- continuous PPG capture, written as rotating chunk files ----
    private val chunkLock = Any()
    private var ppgDir: java.io.File? = null
    private var ppgPrefix = "PPG_Raw"
    private var ppgChunkMs = 600_000L
    private var chunkFile: java.io.File? = null      // the open "<name>.csv.part" file
    private var chunkStartTs = 0L
    private var chunkSampleIdx = 0L
    private var pollCycle = 0

    // Asks the ring for one waveform packet (~125 samples = 1 s) every second on a fixed clock
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
            waveHandler.postDelayed(this, 1000L)
        }
    }

    private fun ensureWaveTaskRunning() {
        if (!wavePolling) {
            wavePacketsSeen = 0
            pollCount = 0L
            wavePolling = true
            nextPollAt = SystemClock.uptimeMillis()
            waveHandler.removeCallbacksAndMessages(null)
            waveHandler.post(waveTask)
            ev("ensureWaveTaskRunning: waveTask posted")
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
            uploader.poke()
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
        scheduleIdleStop()
    }

    // If nothing starts recording again within 15 minutes and no file is waiting to upload,
    // release the wake lock and remove the notification instead of holding them for hours.
    private fun scheduleIdleStop() {
        waveHandler.postDelayed({
            if (wavePolling) return@postDelayed
            val waiting = ppgDir?.listFiles { f -> f.isFile && f.name.startsWith("PPG_Raw") && f.name.endsWith(".csv") }
                ?.isNotEmpty() == true
            if (waiting) {
                scheduleIdleStop()
            } else {
                ev("idle for 15 minutes: stopping keep-alive service")
                stopKeepAlive()
            }
        }, 15 * 60 * 1000L)
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
    private var connectionSeq = 0L
    private var lastStopScanTs = 0L
    private var lastDisconnectTs = 0L

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
            "onPpgChunkReady",   // { path, name, dir, rows, startTs }
            "onPpgPacket",       // { samples, ts }  only while the live screen is open
            "onBloodPressure"    // { sbp, dbp, ts }
        )

        OnStartObserving { emitter = appContext.eventEmitter(this@ViatomModule) }
        OnStopObserving {
            emitter = null
            // Closing the screen (swiping the app away) removes every JavaScript listener.
            // Recording must go on, so keep the Bluetooth observers while a capture is running.
            if (!wavePolling) clearObservers()
        }
        OnDestroy { ev("module destroyed"); stopPpgCapture(); uploader.stop(); stopKeepAlive(); clearObservers() }

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
            ev("scan() called")
            ensureServiceInitialized()
            val app = appContext.reactContext?.applicationContext as? android.app.Application
            if (app != null) {
                try {
                    BleServiceHelper.BleServiceHelper.initService(app)
                } catch (_: Exception) {}
            }
            subscribeIfNeeded()
            try {
                BleServiceHelper.BleServiceHelper.stopScan()
            } catch (_: Exception) {}
            BleServiceHelper.BleServiceHelper.startScan()
            true
        }

        // 4) Stop scan
        AsyncFunction("stopScan") {
            val now = System.currentTimeMillis()
            if (now - lastStopScanTs < 400) {
                return@AsyncFunction true
            }
            lastStopScanTs = now
            ev("stopScan() called")
            try {
                BleServiceHelper.BleServiceHelper.stopScan()
            } catch (_: Exception) {}
            true
        }

        // 5) Connect by MAC + model
        AsyncFunction("connect") { mac: String, modelArg: Int ->
            ev("connect() called mac=$mac modelArg=$modelArg")
            val mySeq = ++connectionSeq
            try {
                ensureServiceInitialized()
                subscribeIfNeeded()
            } catch (e: Exception) {
                ev("connect() init failed: ${e.message}")
                throw CodedException("INIT_FAILED", e.message ?: "Init failed", e)
            }

            try {
                BleServiceHelper.BleServiceHelper.stopScan()
            } catch (e: Exception) {
                ev("connect() stopScan warning: ${e.message}")
            }

            try {
                Thread.sleep(350)
            } catch (_: Exception) {}

            try {
                megaBp.initNative()
            } catch (e: Exception) {
                ev("connect() megaBp warning: ${e.message}")
            }

            val act = appContext.activityProvider?.currentActivity
            if (act == null) {
                ev("connect() error: currentActivity is null")
                throw CodedException("NO_ACTIVITY")
            }

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                if (androidx.core.content.ContextCompat.checkSelfPermission(act, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    ev("connect() error: BLUETOOTH_CONNECT permission not granted")
                    throw CodedException("PERMISSION_DENIED")
                }
            }

            var bt = foundDevices[mac]
            if (bt == null) {
                ev("connect() warning: device not in foundDevices map, trying direct BluetoothAdapter lookup for mac=$mac")
                val adapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter()
                if (adapter != null && android.bluetooth.BluetoothAdapter.checkBluetoothAddress(mac)) {
                    try {
                        val device = adapter.getRemoteDevice(mac)
                        if (device != null) {
                            val modelCode = if (modelArg > 0) modelArg else 4
                            bt = Bluetooth(modelCode, device.name ?: "O2Ring", device, 0, null)
                            ev("connect() direct BluetoothDevice created successfully for mac=$mac model=$modelCode")
                        }
                    } catch (e: Exception) {
                        ev("connect() getRemoteDevice failed: ${e.message}")
                    }
                }
            }

            if (bt == null) {
                ev("connect() error: device not found anywhere for mac=$mac")
                throw CodedException("DEVICE_NOT_FOUND")
            }

            try {
                ev("connect() calling BleServiceHelper.connect for mac=$mac model=${bt.model}")
                BleServiceHelper.BleServiceHelper.setInterfaces(bt.model)
                BleServiceHelper.BleServiceHelper.connect(act.applicationContext, bt.model, bt.device)
                ev("connect success mac=$mac model=${bt.model}")
            } catch (e: Exception) {
                ev("connect exception caught: ${e.javaClass.simpleName} - ${e.message}")
                e.printStackTrace()
                throw CodedException("CONNECT_FAILED", "BLE connection failed: ${e.message}", e)
            }

            // Only assign if this connection request wasn't superseded by another
            if (connectionSeq == mySeq) {
                connectedModel = bt.model
                connectedMac = mac
            }

            true
        }

        // 6) Disconnect current device
        AsyncFunction("disconnect") {
            val mySeq = connectionSeq
            val now = System.currentTimeMillis()
            if (now - lastDisconnectTs < 800) {
                return@AsyncFunction true
            }
            lastDisconnectTs = now
            ev("disconnect() called")
            stopPpgCapture()
            stopKeepAlive()
            try {
                BleServiceHelper.BleServiceHelper.stopScan()
            } catch (_: Exception) {}
            try {
                BleServiceHelper.BleServiceHelper.disconnect(false)
            } catch (_: Exception) {}

            if (connectionSeq == mySeq) {
                connectedModel = null
                connectedMac = null
            }
            true
        }

        // 7) Start realtime / waveform stream
        AsyncFunction("startRealtime") {
            val model = connectedModel ?: throw CodedException("NO_DEVICE_CONNECTED")
            liveWave = true
            ensureWaveTaskRunning()
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

            val cleanPrefix = prefix.replace(Regex("[^A-Za-z0-9_-]"), "_")
            if (wavePolling && ppgDir == dir && ppgPrefix == cleanPrefix) {
                // already recording for this patient (for example the app was reopened): keep the chunk going
                uploadConfig?.let { uploader.configure(it); uploader.start(dir) }
                ev("capture already running, keeping it")
                return@AsyncFunction dir.absolutePath
            }

            stopPpgCapture()   // close any chunk that is still open

            // finish chunks left behind by an earlier run that was killed mid-write
            dir.listFiles()?.filter { it.name.endsWith(".csv.part") }?.forEach { p ->
                if (p.length() > 100) {
                    p.renameTo(java.io.File(dir, p.name.removeSuffix(".part")))
                } else {
                    p.delete()
                }
            }

            uploadConfig?.let { uploader.configure(it); uploader.start(dir) }

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

        // JavaScript gives the native uploader the server address and login once, before recording starts
        AsyncFunction("configurePpgUpload") { uploadUrl: String, authHeader: String, patientId: String ->
            val cfg = PpgUploader.Config(uploadUrl, authHeader.ifBlank { null }, patientId)
            uploadConfig = cfg
            uploader.configure(cfg)
            ev("upload configured: $uploadUrl")
            true
        }

        // The live screen switches this on while it is open: samples are sent to JavaScript only then
        AsyncFunction("setLiveWave") { enabled: Boolean ->
            liveWave = enabled
            if (enabled && connectedModel != null) {
                ensureWaveTaskRunning()
            }
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

        AsyncFunction("setBpCalibration") { sbp: Int, dbp: Int ->
            try {
                megaBp.setCalibrationNative(sbp, dbp)
                ev("megaBp setCalibrationNative sbp=$sbp dbp=$dbp")
            } catch (e: Exception) {
                ev("setBpCalibration error: ${e.message}")
            }
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

        // 1. Real-time param data (SpO2, PR, PI, motion) - update lastMotion state only
        addObserver(InterfaceEvent.Oxy.EventOxyRtParamData, InterfaceEvent::class.java) { evt ->
            val d = evt.data as RtParam
            lastMotion = if (d.vector >= 20) d.vector else 0
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

            val maxVal = wFs.maxOrNull() ?: 0
            val minVal = wFs.minOrNull() ?: 0
            val ac = (maxVal - minVal).toDouble()
            val motionVal = if (lastMotion >= 20) lastMotion else if (ac >= 28.0) ((ac - 20.0) * 1.5).coerceIn(1.0, 100.0).toInt() else 0

            val rawPi = rtWave.pi.toDouble()
            val finalPi = if (rawPi > 0.0) (if (rawPi < 1.0) rawPi * 10.0 else if (rawPi <= 10.0) rawPi else rawPi / 10.0) else 2.5
            val constrainPi = finalPi.coerceIn(0.5, 15.0)

            // keep SpO2/PR/PI/Motion updating - single unified onRealtime emitter
            emitter?.emit("onRealtime", mapOf(
                "spo2" to rtWave.spo2, "pr" to rtWave.pr,
                "pi" to String.format(java.util.Locale.US, "%.1f", constrainPi).toDouble(), "motion" to motionVal, "ts" to ts))

            if (liveWave) {
                emitter?.emit("onPpgPacket", mapOf("samples" to wFs.toList(), "ts" to ts))
            }

            ready?.let { emitter?.emit("onPpgChunkReady", it) }

            val dcBaseline = wFs.average().toInt()
            var lastSbp = 120.0
            var lastDbp = 80.0
            try {
                for (sample in wFs) {
                    val acSample = sample - dcBaseline
                    val bp = megaBp.stepNative(acSample)
                    if (bp != null && bp.size >= 2 && bp[0] >= 50.0 && bp[1] >= 35.0) {
                        lastSbp = bp[0]
                        lastDbp = bp[1]
                    }
                }
            } catch (e: Exception) {
                Log.w("MegaBp", "stepNative error", e)
            }

            emitter?.emit("onBloodPressure", mapOf("sbp" to lastSbp.toInt(), "dbp" to lastDbp.toInt(), "ts" to ts))
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