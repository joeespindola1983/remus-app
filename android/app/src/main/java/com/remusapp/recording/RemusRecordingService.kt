package com.remusapp.recording

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat

class RemusRecordingService : Service() {

  companion object {
    private const val TAG = "RemusRecordingService"
    const val CHANNEL_ID = "remus_recording_channel"
    const val NOTIFICATION_ID = 1001
    const val ACTION_START = "com.remusapp.recording.START_RECORDING_SERVICE"
    const val ACTION_STOP = "com.remusapp.recording.STOP_RECORDING_SERVICE"

    fun startService(context: Context) {
      val intent = Intent(context, RemusRecordingService::class.java).apply {
        action = ACTION_START
      }
      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
      } catch (e: Exception) {
        Log.e(TAG, "Failed to start RemusRecordingService", e)
      }
    }

    fun stopService(context: Context) {
      val intent = Intent(context, RemusRecordingService::class.java).apply {
        action = ACTION_STOP
      }
      try {
        context.startService(intent)
      } catch (e: Exception) {
        Log.e(TAG, "Failed to stop RemusRecordingService", e)
      }
    }
  }

  private var wakeLock: PowerManager.WakeLock? = null

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      releaseWakeLock()
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
      return START_NOT_STICKY
    }

    acquireWakeLock()
    val notification = createNotification()
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        startForeground(
          NOTIFICATION_ID,
          notification,
          ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
        )
      } else {
        startForeground(NOTIFICATION_ID, notification)
      }
    } catch (_: Exception) {
      startForeground(NOTIFICATION_ID, notification)
    }

    return START_STICKY
  }

  override fun onDestroy() {
    releaseWakeLock()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun acquireWakeLock() {
    if (wakeLock == null) {
      try {
        val pm = getSystemService(Context.POWER_SERVICE) as? PowerManager
        wakeLock = pm?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Remus:RecordingWakeLock")?.apply {
          acquire(4 * 3600 * 1000L) // 4 hours maximum timeout
        }
      } catch (e: Exception) {
        Log.w(TAG, "Failed to acquire wake lock", e)
      }
    }
  }

  private fun releaseWakeLock() {
    wakeLock?.let {
      if (it.isHeld) {
        try {
          it.release()
        } catch (_: Exception) {}
      }
    }
    wakeLock = null
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Remus Recording",
        NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Notificação ativa durante gravação de atividade física"
        setShowBadge(false)
      }
      val manager = getSystemService(NotificationManager::class.java)
      manager?.createNotificationChannel(channel)
    }
  }

  private fun createNotification(): Notification {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
      flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
    }
    val pendingIntent = launchIntent?.let {
      val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
      PendingIntent.getActivity(this, 0, it, flags)
    }

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Remus — Gravação Ativa")
      .setContentText("Capturando dados de GPS e movimento em segundo plano")
      .setSmallIcon(android.R.drawable.ic_media_play)
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .apply {
        pendingIntent?.let { setContentIntent(it) }
      }
      .build()
  }
}
