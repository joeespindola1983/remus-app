package com.remusapp.recording

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedOutputStream
import java.io.BufferedWriter
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.FileWriter
import java.io.RandomAccessFile
import java.security.MessageDigest
import java.util.UUID
import java.util.concurrent.Executors
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

class RemusEvidenceStore private constructor() {
  companion object {
    val instance = RemusEvidenceStore()
    private const val MIN_FREE_STORAGE_BYTES = 512L * 1024L * 1024L
  }

  private val executor = Executors.newSingleThreadExecutor()
  private val streamFiles = mapOf(
    "phoneMotion" to "phone-motion.ndjson",
    "phoneLocation" to "phone-location.ndjson",
    "lifecycle" to "lifecycle.ndjson"
  )

  @Volatile var isRecording: Boolean = false
    private set

  var currentActivityId: String? = null
    private set

  var currentDirectory: File? = null
    private set

  private var currentCorrelationId: String? = null
  private var currentRecordingIdsBySource = mutableMapOf<String, String>()
  private var startedAtEpochMs: Long = 0
  private val writers = mutableMapOf<String, BufferedWriter>()
  private val fosMap = mutableMapOf<String, FileOutputStream>()
  private val sampleCounts = mutableMapOf<String, Long>()
  private var appendCountSinceSync: Int = 0

  @Volatile var failureDescription: String? = null
    private set

  fun recordFailure(reason: String) {
    if (failureDescription == null) {
      failureDescription = reason
    }
  }

  fun currentSampleCounts(): Map<String, Long> = synchronized(this) { sampleCounts.toMap() }

  fun elapsedSeconds(nowMs: Long = System.currentTimeMillis()): Double {
    if (startedAtEpochMs == 0L) return 0.0
    return ((nowMs - startedAtEpochMs) / 1000.0).coerceAtLeast(0.0)
  }

  fun snapshot(): Map<String, Any?> = synchronized(this) {
    val map = mutableMapOf<String, Any?>(
      "isRecording" to isRecording,
      "activityId" to currentActivityId,
      "startedAtEpochMilliseconds" to (if (startedAtEpochMs > 0) startedAtEpochMs else null),
      "artifactDirectory" to currentDirectory?.absolutePath,
      "directoryPath" to currentDirectory?.absolutePath,
      "sampleCounts" to sampleCounts.toMap(),
      "hasWriteFailure" to (failureDescription != null)
    )
    if (failureDescription != null) {
      map["failureMessage"] = failureDescription
    }
    map
  }

  fun resetForTesting() {
    synchronized(this) {
      isRecording = false
      currentActivityId = null
      currentDirectory = null
      currentCorrelationId = null
      currentRecordingIdsBySource.clear()
      startedAtEpochMs = 0L
      writers.clear()
      fosMap.clear()
      sampleCounts.clear()
      appendCountSinceSync = 0
      failureDescription = null
    }
  }

  fun start(context: Context, sourceIds: List<String>): Map<String, Any> {
    synchronized(this) {
      if (isRecording) {
        stop(context)
      }

      val evidenceRoot = File(context.filesDir, "recordings")
      if (!evidenceRoot.exists()) {
        evidenceRoot.mkdirs()
      }

      if (evidenceRoot.usableSpace < MIN_FREE_STORAGE_BYTES) {
        throw IllegalStateException("At least 512 MB of free storage is required to start recording.")
      }

      val activityId = "activity:" + UUID.randomUUID().toString().lowercase()
      val correlationId = "correlation:" + UUID.randomUUID().toString().lowercase()
      val now = System.currentTimeMillis()

      val activityDir = File(evidenceRoot, activityId.replace(":", "-"))
      if (!activityDir.exists()) {
        activityDir.mkdirs()
      }

      val recordingIds = mutableMapOf<String, String>()
      for (sourceId in sourceIds) {
        recordingIds[sourceId] = "recording:" + UUID.randomUUID().toString().lowercase()
      }
      if (!recordingIds.containsKey("phone:primary")) {
        recordingIds["phone:primary"] = "recording:" + UUID.randomUUID().toString().lowercase()
      }

      currentActivityId = activityId
      currentCorrelationId = correlationId
      currentDirectory = activityDir
      currentRecordingIdsBySource = recordingIds
      startedAtEpochMs = now
      sampleCounts.clear()
      writers.clear()
      fosMap.clear()
      appendCountSinceSync = 0
      failureDescription = null

      for ((stream, filename) in streamFiles) {
        val file = File(activityDir, filename)
        val fos = FileOutputStream(file, false)
        fosMap[stream] = fos
        writers[stream] = BufferedWriter(FileWriter(fos.fd))
        sampleCounts[stream] = 0L
      }

      isRecording = true

      // Write initial lifecycle event
      appendLifecycleEvent("recording_started", now)
      writeManifest("recording", null, null)

      return mapOf(
        "activityId" to activityId,
        "activityCorrelationId" to correlationId,
        "recordingIdsBySource" to recordingIds,
        "directoryPath" to activityDir.absolutePath,
        "artifactDirectory" to activityDir.absolutePath
      )
    }
  }

  fun appendPhoneMotion(payload: Map<String, Any?>) {
    append("phoneMotion", "phone:primary", payload)
  }

  fun appendPhoneLocation(payload: Map<String, Any?>) {
    append("phoneLocation", "phone:primary", payload)
  }

  fun appendLifecycleEvent(event: String, timestamp: Long = System.currentTimeMillis()) {
    if (!isRecording) return
    val json = JSONObject()
      .put("schemaVersion", "1.0.0")
      .put("activityId", currentActivityId)
      .put("type", event)
      .put("timestampEpochMilliseconds", timestamp)
    if (event == "recording_started") {
      json.put("activityCorrelationId", currentCorrelationId)
    }
    val writer = writers["lifecycle"] ?: return
    try {
      writer.write(json.toString())
      writer.newLine()
      sampleCounts["lifecycle"] = (sampleCounts["lifecycle"] ?: 0L) + 1L
    } catch (e: Exception) {
      recordFailure("LIFECYCLE_WRITE_ERROR: ${e.message}")
    }
  }

  fun appendSourceLifecycleEvent(
    sourceId: String,
    event: String,
    reason: String?,
    elapsedSeconds: Double,
    timestamp: Long = System.currentTimeMillis()
  ) {
    if (!isRecording) return
    val json = JSONObject()
      .put("schemaVersion", "1.0.0")
      .put("activityId", currentActivityId)
      .put("type", event)
      .put("sourceId", sourceId)
      .put("elapsedSeconds", elapsedSeconds)
      .put("timestampEpochMilliseconds", timestamp)
    currentRecordingIdsBySource[sourceId]?.let { json.put("recordingId", it) }
    reason?.let { json.put("reason", it) }

    val writer = writers["lifecycle"] ?: return
    try {
      writer.write(json.toString())
      writer.newLine()
      sampleCounts["lifecycle"] = (sampleCounts["lifecycle"] ?: 0L) + 1L
    } catch (e: Exception) {
      recordFailure("SOURCE_LIFECYCLE_WRITE_ERROR: ${e.message}")
    }
  }

  private fun wrapValue(v: Any?): Any {
    return when (v) {
      null -> JSONObject.NULL
      is Map<*, *> -> {
        val obj = JSONObject()
        for ((mk, mv) in v) {
          obj.put(mk.toString(), wrapValue(mv))
        }
        obj
      }
      is List<*> -> {
        val arr = JSONArray()
        for (item in v) {
          arr.put(wrapValue(item))
        }
        arr
      }
      else -> v
    }
  }

  private fun append(stream: String, sourceId: String?, payload: Map<String, Any?>) {
    synchronized(this) {
      if (!isRecording) return
      if (sourceId != null && currentRecordingIdsBySource[sourceId] == null) return
    }

    val json = JSONObject()
    json.put("schemaVersion", "1.0.0")
    json.put("activityId", currentActivityId)
    if (sourceId != null) {
      json.put("sourceId", sourceId)
      json.put("recordingId", currentRecordingIdsBySource[sourceId])
    }
    for ((k, v) in payload) {
      json.put(k, wrapValue(v))
    }
    val line = json.toString()

    executor.execute {
      val writer = writers[stream] ?: return@execute
      try {
        writer.write(line)
        writer.newLine()
        sampleCounts[stream] = (sampleCounts[stream] ?: 0L) + 1L
        appendCountSinceSync++

        if (appendCountSinceSync >= 500) {
          syncInternal()
        }
      } catch (e: Exception) {
        recordFailure("APPEND_ERROR: ${e.message}")
      }
    }
  }

  private fun syncInternal() {
    try {
      for (writer in writers.values) {
        writer.flush()
      }
      for (fos in fosMap.values) {
        fos.fd.sync()
      }
      appendCountSinceSync = 0
    } catch (e: Exception) {
      recordFailure("SYNC_ERROR: ${e.message}")
    }
  }

  fun stop(context: Context): Map<String, Any> {
    synchronized(this) {
      if (!isRecording) {
        return emptyMap()
      }

      isRecording = false
      val endedAt = System.currentTimeMillis()

      val future = executor.submit(java.util.concurrent.Callable<Map<String, Any>> {
        appendLifecycleEvent("recording_stopped", endedAt)
        syncInternal()

        // Close all writers
        for (writer in writers.values) {
          try {
            writer.close()
          } catch (e: Exception) {
            recordFailure("CLOSE_WRITER_ERROR: ${e.message}")
          }
        }
        writers.clear()
        fosMap.clear()

        val dir = currentDirectory ?: File(context.filesDir, "recordings")
        val parts = mutableListOf<Map<String, Any>>()

        for ((stream, filename) in streamFiles) {
          val file = File(dir, filename)
          if (file.exists()) {
            val sha = computeSha256(file)
            parts.add(mapOf(
              "stream" to stream,
              "filename" to filename,
              "sampleCount" to (sampleCounts[stream] ?: 0L),
              "byteLength" to file.length(),
              "sha256" to sha
            ))
          }
        }

        val status = if (failureDescription == null) "finalized" else "interrupted"
        writeManifest(status, endedAt, parts)

        val result = mutableMapOf<String, Any>(
          "schemaVersion" to "1.1.0",
          "producer" to "remus-app-android",
          "activityId" to (currentActivityId ?: ""),
          "activityCorrelationId" to (currentCorrelationId ?: ""),
          "recordingIdsBySource" to currentRecordingIdsBySource.toMap(),
          "startedAtEpochMilliseconds" to startedAtEpochMs,
          "endedAtEpochMilliseconds" to endedAt,
          "status" to status,
          "sampleCounts" to sampleCounts.toMap(),
          "parts" to parts,
          "directoryPath" to dir.absolutePath,
          "artifactDirectory" to dir.absolutePath
        )
        if (failureDescription != null) {
          result["failureMessage"] = failureDescription!!
        }

        result
      })

      return future.get()
    }
  }

  private fun writeManifest(status: String, endedAt: Long?, parts: List<Map<String, Any>>?) {
    val dir = currentDirectory ?: return
    try {
      val manifest = JSONObject()
      manifest.put("schemaVersion", "1.1.0")
      manifest.put("producer", "remus-app-android")
      manifest.put("activityId", currentActivityId)
      manifest.put("activityCorrelationId", currentCorrelationId)

      val recObj = JSONObject()
      for ((k, v) in currentRecordingIdsBySource) {
        recObj.put(k, v)
      }
      manifest.put("recordingIdsBySource", recObj)
      manifest.put("startedAtEpochMilliseconds", startedAtEpochMs)
      manifest.put("status", if (failureDescription != null) "interrupted" else status)

      val countsObj = JSONObject()
      for ((k, v) in sampleCounts) {
        countsObj.put(k, v)
      }
      manifest.put("sampleCounts", countsObj)

      if (endedAt != null) {
        manifest.put("endedAtEpochMilliseconds", endedAt)
      }

      if (parts != null) {
        val partsArr = JSONArray()
        for (part in parts) {
          val pObj = JSONObject()
          for ((pk, pv) in part) {
            pObj.put(pk, pv)
          }
          partsArr.put(pObj)
        }
        manifest.put("parts", partsArr)
      }

      if (failureDescription != null) {
        manifest.put("failureMessage", failureDescription)
      }

      // Atomic write via temp file
      val manifestFile = File(dir, "manifest.json")
      val tmpFile = File(dir, "manifest.json.tmp")
      tmpFile.writeText(manifest.toString(2))
      if (!tmpFile.renameTo(manifestFile)) {
        manifestFile.delete()
        tmpFile.renameTo(manifestFile)
      }
    } catch (e: Exception) {
      recordFailure("WRITE_MANIFEST_ERROR: ${e.message}")
    }
  }

  fun exportActivity(context: Context, activityId: String? = null): File {
    val targetId = activityId ?: currentActivityId ?: run {
      val latest = listRecordings(context).firstOrNull()
      latest?.get("activityId") as? String ?: throw IllegalStateException("No activity to export")
    }
    val evidenceRoot = File(context.filesDir, "recordings")
    val activityDir = File(evidenceRoot, targetId.replace(":", "-"))
    if (!activityDir.exists()) {
      throw IllegalStateException("Activity directory not found: ${activityDir.absolutePath}")
    }

    val exportsDir = File(context.filesDir, "exports")
    if (!exportsDir.exists()) {
      exportsDir.mkdirs()
    }

    return exportActivityDirectory(activityDir, exportsDir)
  }

  fun exportActivityDirectory(activityDir: File, exportsDir: File): File {
    val zipName = "${activityDir.name}.zip"
    val finalZip = File(exportsDir, zipName)
    val partialZip = File(exportsDir, "$zipName.partial")

    if (partialZip.exists()) {
      partialZip.delete()
    }

    ZipOutputStream(BufferedOutputStream(FileOutputStream(partialZip))).use { zos ->
      activityDir.walkTopDown().filter { it.isFile }.forEach { file ->
        val relativePath = "${activityDir.name}/${file.relativeTo(activityDir).path}"
        val entry = ZipEntry(relativePath)
        zos.putNextEntry(entry)
        file.inputStream().use { input ->
          input.copyTo(zos)
        }
        zos.closeEntry()
      }
      zos.finish()
    }

    if (finalZip.exists()) {
      finalZip.delete()
    }

    if (!partialZip.renameTo(finalZip)) {
      throw IllegalStateException("Failed to finalize zip file atomically: $zipName")
    }

    return finalZip
  }

  fun listRecordings(context: Context): List<Map<String, Any>> {
    val evidenceRoot = File(context.filesDir, "recordings")
    if (!evidenceRoot.exists()) return emptyList()

    val dirs = evidenceRoot.listFiles { file -> file.isDirectory && file.name.startsWith("activity-") } ?: return emptyList()
    val workouts = mutableListOf<Map<String, Any>>()

    for (dir in dirs) {
      val manifestFile = File(dir, "manifest.json")
      if (!manifestFile.exists()) continue
      try {
        val json = JSONObject(manifestFile.readText())
        val actId = json.optString("activityId")
        val status = json.optString("status", "finalized")
        val startedAt = json.optLong("startedAtEpochMilliseconds", 0L)
        val endedAt = if (json.has("endedAtEpochMilliseconds")) json.getLong("endedAtEpochMilliseconds") else null
        val durationSeconds = if (endedAt != null) ((endedAt - startedAt) / 1000.0).coerceAtLeast(0.0) else 0.0

        workouts.add(mapOf(
          "activityId" to actId,
          "status" to status,
          "startedAtEpochMilliseconds" to startedAt,
          "endedAtEpochMilliseconds" to (endedAt ?: JSONObject.NULL),
          "durationSeconds" to durationSeconds,
          "directoryPath" to dir.absolutePath,
          "artifactDirectory" to dir.absolutePath
        ))
      } catch (_: Exception) {}
    }

    return workouts.sortedByDescending { it["startedAtEpochMilliseconds"] as? Long ?: 0L }
  }

  fun finalizeRecording(context: Context, activityId: String): Map<String, Any> {
    val evidenceRoot = File(context.filesDir, "recordings")
    val activityDir = File(evidenceRoot, activityId.replace(":", "-"))
    return finalizeActivityDirectory(activityDir)
  }

  fun finalizeActivityDirectory(activityDir: File, forceStatus: String? = "finalized"): Map<String, Any> {
    if (!activityDir.exists()) {
      throw IllegalArgumentException("Activity directory does not exist: ${activityDir.absolutePath}")
    }

    val manifestFile = File(activityDir, "manifest.json")
    val manifest = if (manifestFile.exists()) {
      try {
        JSONObject(manifestFile.readText())
      } catch (_: Exception) {
        JSONObject()
      }
    } else {
      JSONObject()
    }

    val startedAt = manifest.optLong("startedAtEpochMilliseconds", 0L)
    var maxTimestamp = startedAt
    val localSampleCounts = mutableMapOf<String, Long>()

    // Sanitize streams and repair corrupt/unterminated lines
    for ((stream, filename) in streamFiles) {
      val file = File(activityDir, filename)
      if (file.exists()) {
        val (count, streamMaxTs) = sanitizeAndInspectStream(file)
        localSampleCounts[stream] = count
        if (streamMaxTs > maxTimestamp) {
          maxTimestamp = streamMaxTs
        }
      } else {
        localSampleCounts[stream] = 0L
      }
    }

    val parts = mutableListOf<Map<String, Any>>()
    for ((stream, filename) in streamFiles) {
      val file = File(activityDir, filename)
      if (file.exists()) {
        parts.add(mapOf(
          "stream" to stream,
          "filename" to filename,
          "sampleCount" to (localSampleCounts[stream] ?: 0L),
          "byteLength" to file.length(),
          "sha256" to computeSha256(file)
        ))
      }
    }

    val finalStatus = if (failureDescription != null) "interrupted" else (forceStatus ?: manifest.optString("status", "finalized"))

    manifest.put("schemaVersion", "1.1.0")
    manifest.put("producer", "remus-app-android")
    manifest.put("status", finalStatus)
    manifest.put("endedAtEpochMilliseconds", maxTimestamp)

    val countsObj = JSONObject()
    for ((k, v) in localSampleCounts) {
      countsObj.put(k, v)
    }
    manifest.put("sampleCounts", countsObj)

    val partsArr = JSONArray()
    for (part in parts) {
      val pObj = JSONObject()
      for ((pk, pv) in part) {
        pObj.put(pk, pv)
      }
      partsArr.put(pObj)
    }
    manifest.put("parts", partsArr)

    if (failureDescription != null) {
      manifest.put("failureMessage", failureDescription)
    }

    val tmpFile = File(activityDir, "manifest.json.tmp")
    tmpFile.writeText(manifest.toString(2))
    if (!tmpFile.renameTo(manifestFile)) {
      manifestFile.delete()
      tmpFile.renameTo(manifestFile)
    }

    val result = mutableMapOf<String, Any>(
      "activityId" to manifest.optString("activityId", activityDir.name.replace("-", ":")),
      "status" to finalStatus,
      "startedAtEpochMilliseconds" to startedAt,
      "endedAtEpochMilliseconds" to maxTimestamp,
      "durationSeconds" to ((maxTimestamp - startedAt) / 1000.0).coerceAtLeast(0.0),
      "sampleCounts" to localSampleCounts.toMap(),
      "parts" to parts,
      "directoryPath" to activityDir.absolutePath,
      "artifactDirectory" to activityDir.absolutePath
    )
    if (failureDescription != null) {
      result["failureMessage"] = failureDescription!!
    }

    return result
  }

  private fun sanitizeAndInspectStream(file: File): Pair<Long, Long> {
    if (!file.exists() || file.length() == 0L) return Pair(0L, 0L)

    // Truncate unterminated trailing line if present
    RandomAccessFile(file, "rw").use { raf ->
      val length = raf.length()
      if (length > 0) {
        val readSize = Math.min(length, 4096L).toInt()
        val buffer = ByteArray(readSize)
        val offset = length - readSize
        raf.seek(offset)
        raf.readFully(buffer)

        if (buffer.last() != 0x0A.toByte()) {
          var lastNewline = -1
          for (i in buffer.indices.reversed()) {
            if (buffer[i] == 0x0A.toByte()) {
              lastNewline = i
              break
            }
          }
          if (lastNewline >= 0) {
            raf.setLength(offset + lastNewline + 1)
          } else if (offset == 0L) {
            raf.setLength(0L)
          }
        }
      }
    }

    var validLines = 0L
    var maxTs = 0L

    file.forEachLine { line ->
      if (line.isNotBlank()) {
        try {
          val json = JSONObject(line)
          validLines++
          val ts = json.optLong("receivedAtEpochMilliseconds", 0L)
          if (ts > maxTs) maxTs = ts
        } catch (_: Exception) {}
      }
    }

    return Pair(validLines, maxTs)
  }

  fun deleteRecording(context: Context, activityId: String): Boolean {
    val evidenceRoot = File(context.filesDir, "recordings")
    val activityDir = File(evidenceRoot, activityId.replace(":", "-"))
    if (!activityDir.exists()) return false

    activityDir.deleteRecursively()

    val exportsDir = File(context.filesDir, "exports")
    val zipFile = File(exportsDir, "${activityDir.name}.zip")
    if (zipFile.exists()) {
      zipFile.delete()
    }

    return true
  }

  private fun computeSha256(file: File): String {
    val digest = MessageDigest.getInstance("SHA-256")
    FileInputStream(file).use { fis ->
      val buffer = ByteArray(8192)
      var bytesRead = fis.read(buffer)
      while (bytesRead != -1) {
        digest.update(buffer, 0, bytesRead)
        bytesRead = fis.read(buffer)
      }
    }
    return digest.digest().joinToString("") { "%02x".format(it) }
  }
}
