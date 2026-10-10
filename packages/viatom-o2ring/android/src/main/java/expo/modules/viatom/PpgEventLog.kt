package expo.modules.viatom

import android.content.Context
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Tiny persistent event log so an overnight run can be read the next morning.
 * Location: <external app files>/ppg_events.log (pull it with adb). It holds no patient data.
 */
object PpgEventLog {
    private const val MAX_BYTES = 1_000_000L
    private val fmt = SimpleDateFormat("MM-dd HH:mm:ss", Locale.US)

    @Synchronized
    fun log(context: Context?, message: String) {
        val ctx = context ?: return
        try {
            val dir = ctx.getExternalFilesDir(null) ?: ctx.filesDir
            val f = File(dir, "ppg_events.log")
            if (f.exists() && f.length() > MAX_BYTES) {
                val old = File(dir, "ppg_events.old.log")
                old.delete()
                f.renameTo(old)
            }
            f.appendText("${fmt.format(Date())}  $message\n")
        } catch (_: Exception) {
            // logging must never break recording
        }
    }
}
