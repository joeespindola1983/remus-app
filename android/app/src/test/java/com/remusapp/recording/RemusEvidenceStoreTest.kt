package com.remusapp.recording

import org.json.JSONObject
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File
import java.util.zip.ZipFile

class RemusEvidenceStoreTest {

  @get:Rule
  val tempFolder = TemporaryFolder()

  @Before
  fun setUp() {
    RemusEvidenceStore.instance.resetForTesting()
  }

  @After
  fun tearDown() {
    RemusEvidenceStore.instance.resetForTesting()
  }

  @Test
  fun testFinalizeRecordingRepairsInterruptedSessionOnRealStorePath() {
    val store = RemusEvidenceStore.instance
    val evidenceDir = tempFolder.newFolder("evidence")
    val activityDir = File(evidenceDir, "activity-test-repair-1")
    activityDir.mkdirs()

    val manifestFile = File(activityDir, "manifest.json")
    val initialManifest = JSONObject().apply {
      put("schemaVersion", "1.1.0")
      put("activityId", "activity:test:repair:1")
      put("activityCorrelationId", "correlation:test:1")
      put("status", "interrupted")
      put("startedAtEpochMilliseconds", 1000L)
      put("recordingIdsBySource", JSONObject().put("phone:primary", "recording:phone:1"))
    }
    manifestFile.writeText(initialManifest.toString(2))

    // Stream with 3 valid samples and an unterminated/corrupted trailing line
    val motionFile = File(activityDir, "phone-motion.ndjson")
    motionFile.writeText(
      "{\"receivedAtEpochMilliseconds\":1100}\n" +
      "{\"receivedAtEpochMilliseconds\":1200}\n" +
      "{\"receivedAtEpochMilliseconds\":1300}\n" +
      "{\"receivedAtEpochMilliseconds\":1400" // Corrupted tail without newline
    )

    // Call the REAL store implementation to repair the session
    val summary = store.finalizeActivityDirectory(activityDir)

    assertEquals("activity:test:repair:1", summary["activityId"])
    assertEquals("finalized", summary["status"])
    assertEquals(1000L, summary["startedAtEpochMilliseconds"])
    assertEquals(1300L, summary["endedAtEpochMilliseconds"])

    @Suppress("UNCHECKED_CAST")
    val counts = summary["sampleCounts"] as Map<String, Long>
    assertEquals(3L, counts["phoneMotion"])

    // Verify the file was sanitized on disk
    val sanitizedLines = motionFile.readLines().filter { it.isNotBlank() }
    assertEquals(3, sanitizedLines.size)

    // Verify manifest was updated with valid SHA-256 and parts
    val updatedManifest = JSONObject(manifestFile.readText())
    assertEquals("finalized", updatedManifest.getString("status"))
    assertEquals(1300L, updatedManifest.getLong("endedAtEpochMilliseconds"))
    val parts = updatedManifest.getJSONArray("parts")
    assertTrue("Parts must contain phoneMotion entry", parts.length() > 0)
    val motionPart = parts.getJSONObject(0)
    assertEquals("phoneMotion", motionPart.getString("stream"))
    assertNotNull(motionPart.getString("sha256"))
    assertTrue("SHA-256 must be a 64-char hex string", motionPart.getString("sha256").length == 64)
  }

  @Test
  fun testExportActivityDirectoryProducesValidZipAtomically() {
    val store = RemusEvidenceStore.instance
    val activityDir = tempFolder.newFolder("activity-test-export")
    val exportsDir = tempFolder.newFolder("exports")

    val file1 = File(activityDir, "manifest.json")
    file1.writeText("{\"status\":\"finalized\"}")
    val file2 = File(activityDir, "phone-motion.ndjson")
    file2.writeText("{\"ts\":100}\n{\"ts\":200}\n")

    val zipFile = store.exportActivityDirectory(activityDir, exportsDir)

    assertTrue("Exported ZIP should exist", zipFile.exists())
    assertEquals("activity-test-export.zip", zipFile.name)

    val partialFile = File(exportsDir, "activity-test-export.zip.partial")
    assertFalse("Partial file must not remain after export", partialFile.exists())

    // Validate ZIP integrity with ZipFile
    ZipFile(zipFile).use { zip ->
      assertEquals("ZIP must contain 2 entries", 2, zip.size())
      val manifestEntry = zip.getEntry("activity-test-export/manifest.json")
      assertNotNull("Manifest entry must be present", manifestEntry)
      val motionEntry = zip.getEntry("activity-test-export/phone-motion.ndjson")
      assertNotNull("Motion entry must be present", motionEntry)

      val manifestContent = zip.getInputStream(manifestEntry).bufferedReader().readText()
      assertEquals("{\"status\":\"finalized\"}", manifestContent)
    }
  }

  @Test
  fun testRecordedFailureProducesInterruptedStatusNeverFinalized() {
    val store = RemusEvidenceStore.instance
    val activityDir = tempFolder.newFolder("activity-test-failure")

    // Record explicit failure
    store.recordFailure("DISK_WRITE_FAILED: Simulated I/O error on append")

    val summary = store.finalizeActivityDirectory(activityDir, forceStatus = null)
    // When a failure is recorded, final status must be "interrupted", never "finalized"
    assertEquals("interrupted", summary["status"])
    assertNotNull("Failure message must be preserved", summary["failureMessage"])
    assertEquals("DISK_WRITE_FAILED: Simulated I/O error on append", summary["failureMessage"])
  }

  @Test
  fun testSnapshotAndElapsedSecondsAndFinalizeRecording() {
    val store = RemusEvidenceStore.instance
    val root = tempFolder.newFolder("storage-root")

    // Before start: idle snapshot
    val idleSnapshot = store.snapshot()
    assertFalse(idleSnapshot["isRecording"] as Boolean)
    assertNull(idleSnapshot["activityId"])

    val initialCounts = store.currentSampleCounts()
    assertTrue(initialCounts.isEmpty())
    assertEquals(0.0, store.elapsedSeconds(System.currentTimeMillis()), 0.001)

    // Create a mock context directory structure
    val recordingsDir = File(root, "recordings")
    recordingsDir.mkdirs()
    val activityDir = File(recordingsDir, "activity-test-finalize")
    activityDir.mkdirs()
    val manifestFile = File(activityDir, "manifest.json")
    manifestFile.writeText("{\"activityId\":\"activity:test:finalize\",\"startedAtEpochMilliseconds\":5000}")

    val summary = store.finalizeActivityDirectory(activityDir)
    assertEquals("activity:test:finalize", summary["activityId"])
    assertEquals("finalized", summary["status"])
  }

  @Test
  fun testExportActivityDirectoryWithoutExplicitActivityId() {
    val store = RemusEvidenceStore.instance
    val activityDir = tempFolder.newFolder("activity-test-no-id")
    val exportsDir = tempFolder.newFolder("exports-no-id")

    val file1 = File(activityDir, "manifest.json")
    file1.writeText("{\"status\":\"finalized\",\"activityId\":\"activity:test:no:id\"}")

    val zipFile = store.exportActivityDirectory(activityDir, exportsDir)
    assertTrue("Exported ZIP should exist", zipFile.exists())
    assertEquals("activity-test-no-id.zip", zipFile.name)
  }
}
