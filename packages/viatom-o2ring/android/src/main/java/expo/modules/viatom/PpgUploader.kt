package expo.modules.viatom

import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * Uploads finished PPG chunk files from its own worker thread, independent of JavaScript.
 *
 * - A file counts as delivered when the server answers HTTP 2xx or 409 ("already there").
 *   Then the file is deleted. Anything else (error, timeout, no network) keeps the file.
 * - After a failure the worker retries with a growing delay (up to maxBackoffMs).
 *   poke() (a new chunk is ready) makes it try again right away.
 * - Only files named PPG_Raw*.csv are sent, so half-written ".csv.part" files are never touched.
 */
class PpgUploader(
    private val log: (String) -> Unit,
    private val connectTimeoutMs: Int = 15_000,
    private val readTimeoutMs: Int = 60_000,
    private val overallTimeoutMs: Long = 180_000,
    private val initialBackoffMs: Long = 15_000,
    private val maxBackoffMs: Long = 300_000,
    private val idleScanMs: Long = 300_000
) {
    data class Config(val uploadUrl: String, val authHeader: String?, val patientId: String)

    private val lock = Object()
    private var pending = false
    @Volatile private var running = false
    @Volatile private var config: Config? = null
    @Volatile private var dir: File? = null
    private val watchdog = Executors.newSingleThreadScheduledExecutor { r ->
        Thread(r, "ppg-upload-watchdog").apply { isDaemon = true }
    }

    fun configure(config: Config) {
        this.config = config
    }

    /** Starts the worker for this folder, or just wakes it if it is already running. */
    @Synchronized
    fun start(dir: File) {
        this.dir = dir
        if (!running) {
            running = true
            Thread({ loop() }, "ppg-uploader").apply { isDaemon = true }.start()
        }
        poke()
    }

    fun poke() {
        synchronized(lock) {
            pending = true
            lock.notifyAll()
        }
    }

    @Synchronized
    fun stop() {
        running = false
        poke()
    }

    private fun loop() {
        var backoff = initialBackoffMs
        while (running) {
            var failed = false
            val d = dir
            val cfg = config
            if (d != null && cfg != null) {
                val files = d.listFiles { f -> f.isFile && f.name.startsWith("PPG_Raw") && f.name.endsWith(".csv") }
                    ?.sortedBy { it.name } ?: emptyList()
                for (f in files) {
                    if (!running) return
                    val code = try {
                        post(cfg, f)
                    } catch (e: Exception) {
                        log("upload error ${f.name}: ${e.javaClass.simpleName}: ${e.message}")
                        -1
                    }
                    if (code in 200..299 || code == 409) {
                        f.delete()
                        log("uploaded ${f.name} (HTTP $code)")
                        backoff = initialBackoffMs
                    } else {
                        log("upload failed ${f.name} (HTTP $code), retry in ${backoff / 1000.0}s")
                        failed = true
                        break
                    }
                }
            }
            synchronized(lock) {
                if (!running) return
                if (!pending) lock.wait(if (failed) backoff else idleScanMs)
                pending = false
            }
            if (failed) backoff = minOf(backoff * 2, maxBackoffMs)
        }
    }

    private fun post(cfg: Config, file: File): Int {
        val boundary = "----ppg" + java.lang.Long.toHexString(System.nanoTime())
        val nl = "\r\n"
        val head = StringBuilder()
            .append("--").append(boundary).append(nl)
            .append("Content-Disposition: form-data; name=\"patient_id\"").append(nl).append(nl)
            .append(cfg.patientId).append(nl)
            .append("--").append(boundary).append(nl)
            .append("Content-Disposition: form-data; name=\"silent\"").append(nl).append(nl)
            .append("1").append(nl)
            .append("--").append(boundary).append(nl)
            .append("Content-Disposition: form-data; name=\"csv\"; filename=\"").append(file.name).append("\"").append(nl)
            .append("Content-Type: text/csv").append(nl).append(nl)
            .toString().toByteArray(Charsets.UTF_8)
        val tail = (nl + "--" + boundary + "--" + nl).toByteArray(Charsets.UTF_8)

        val conn = URL(cfg.uploadUrl).openConnection() as HttpURLConnection
        // HttpURLConnection has no write timeout, so cut the whole request off after overallTimeoutMs
        val killer = watchdog.schedule({ try { conn.disconnect() } catch (_: Exception) {} }, overallTimeoutMs, TimeUnit.MILLISECONDS)
        try {
            conn.requestMethod = "POST"
            conn.doOutput = true
            conn.connectTimeout = connectTimeoutMs
            conn.readTimeout = readTimeoutMs
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            conn.setRequestProperty("Accept", "application/json")
            if (!cfg.authHeader.isNullOrBlank()) conn.setRequestProperty("Authorization", cfg.authHeader)
            conn.setFixedLengthStreamingMode(head.size.toLong() + file.length() + tail.size)
            conn.outputStream.use { out ->
                out.write(head)
                file.inputStream().use { it.copyTo(out, 16 * 1024) }
                out.write(tail)
            }
            val code = conn.responseCode
            (if (code >= 400) conn.errorStream else conn.inputStream)?.use { it.readBytes() }
            return code
        } finally {
            killer.cancel(false)
            conn.disconnect()
        }
    }
}
