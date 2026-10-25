import CryptoKit
import Foundation

final class RemusEvidenceStore {
  static let shared = RemusEvidenceStore()

  enum StoreError: LocalizedError {
    case alreadyRecording
    case notRecording
    case invalidSourceIds
    case insufficientStorage

    var errorDescription: String? {
      switch self {
      case .alreadyRecording: return "A recording is already active."
      case .notRecording: return "No recording is active."
      case .invalidSourceIds: return "At least one source is required."
      case .insufficientStorage: return "At least 512 MB of free storage is required to start recording."
      }
    }
  }

  private struct ActiveRecording {
    let activityId: String
    let activityCorrelationId: String
    var recordingIdsBySource: [String: String]
    let directory: URL
    let startedAtEpochMilliseconds: Int64
    var handles: [String: FileHandle]
    var sampleCounts: [String: Int]
    var appendCountSinceSync: Int
    var failureDescription: String?
  }

  private let queue = DispatchQueue(label: "com.espindola.remus.evidence-store", qos: .userInitiated)
  private let fileManager = FileManager.default
  private var active: ActiveRecording?
  private(set) var latestActivityId: String?

  private let streamFiles: [String: String] = [
    "phoneMotion": "phone-motion.ndjson",
    "phoneLocation": "phone-location.ndjson",
    "lifecycle": "lifecycle.ndjson",
  ]

  private init() {
    recoverInterruptedRecordings()
  }

  func start(sourceIds: [String]) throws -> [String: Any] {
    try queue.sync {
      guard active == nil else { throw StoreError.alreadyRecording }
      let uniqueSourceIds = Array(Set(sourceIds)).sorted()
      guard !uniqueSourceIds.isEmpty else { throw StoreError.invalidSourceIds }

      let activityId = "activity:\(UUID().uuidString.lowercased())"
      let correlationId = "correlation:\(UUID().uuidString.lowercased())"
      let recordings = Dictionary(uniqueKeysWithValues: uniqueSourceIds.map { sourceId in
        (sourceId, "recording:\(UUID().uuidString.lowercased())")
      })
      let startedAt = epochMilliseconds()
      let root = try evidenceRoot()
      guard hasMinimumFreeStorage(at: root) else { throw StoreError.insufficientStorage }

      let dirName = activityId.replacingOccurrences(of: ":", with: "-")
      let directory = root.appendingPathComponent(dirName, isDirectory: true)
      try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)

      var handles: [String: FileHandle] = [:]
      for (stream, filename) in streamFiles {
        let url = directory.appendingPathComponent(filename)
        guard fileManager.createFile(atPath: url.path, contents: nil) else {
          throw CocoaError(.fileWriteUnknown)
        }
        handles[stream] = try FileHandle(forWritingTo: url)
      }

      active = ActiveRecording(
        activityId: activityId,
        activityCorrelationId: correlationId,
        recordingIdsBySource: recordings,
        directory: directory,
        startedAtEpochMilliseconds: startedAt,
        handles: handles,
        sampleCounts: Dictionary(uniqueKeysWithValues: streamFiles.keys.map { ($0, 0) }),
        appendCountSinceSync: 0,
        failureDescription: nil
      )
      latestActivityId = activityId

      try appendOnQueue(stream: "lifecycle", payload: [
        "type": "recording_started",
        "activityId": activityId,
        "activityCorrelationId": correlationId,
        "timestampEpochMilliseconds": startedAt,
      ])
      try writeManifestOnQueue(status: "recording", endedAt: nil, parts: nil)
      return startResult(active!)
    }
  }

  func appendPhoneMotion(_ payload: [String: Any]) {
    append(stream: "phoneMotion", sourceId: "phone:primary", payload: payload)
  }

  func appendPhoneLocation(_ payload: [String: Any]) {
    append(stream: "phoneLocation", sourceId: "phone:primary", payload: payload)
  }

  func appendSourceLifecycleEvent(
    sourceId: String,
    event: String,
    reason: String?,
    elapsedSeconds: Double
  ) {
    queue.async { [weak self] in
      guard let self, let recording = self.active else { return }
      var payload: [String: Any] = [
        "type": event,
        "sourceId": sourceId,
        "elapsedSeconds": elapsedSeconds,
        "timestampEpochMilliseconds": self.epochMilliseconds(),
      ]
      if let recordingId = recording.recordingIdsBySource[sourceId] {
        payload["recordingId"] = recordingId
      }
      if let reason { payload["reason"] = reason }
      do {
        try self.appendOnQueue(stream: "lifecycle", payload: payload)
      } catch {
        self.recordFailureOnQueue(error)
      }
    }
  }

  func stop() throws -> [String: Any] {
    try queue.sync {
      guard active != nil else { throw StoreError.notRecording }
      let endedAt = epochMilliseconds()
      try appendOnQueue(stream: "lifecycle", payload: [
        "type": "recording_stopped",
        "timestampEpochMilliseconds": endedAt,
      ])
      try synchronizeOnQueue()

      guard let recording = active else { throw StoreError.notRecording }
      for handle in recording.handles.values { try? handle.close() }
      let parts = try partManifests(directory: recording.directory, counts: recording.sampleCounts)
      let status = recording.failureDescription == nil ? "finalized" : "interrupted"
      try writeManifestOnQueue(status: status, endedAt: endedAt, parts: parts)

      var result: [String: Any] = [
        "schemaVersion": "1.0.0",
        "producer": "remus-app-ios",
        "activityId": recording.activityId,
        "activityCorrelationId": recording.activityCorrelationId,
        "recordingIdsBySource": recording.recordingIdsBySource,
        "artifactDirectory": recording.directory.path,
        "status": status,
        "startedAtEpochMilliseconds": recording.startedAtEpochMilliseconds,
        "endedAtEpochMilliseconds": endedAt,
        "sampleCounts": recording.sampleCounts,
        "parts": parts,
      ]
      if let failureDescription = recording.failureDescription {
        result["failureMessage"] = failureDescription
      }
      active = nil
      return result
    }
  }

  func snapshot() -> [String: Any] {
    queue.sync {
      guard let active else { return ["isRecording": false] }
      return [
        "isRecording": true,
        "activityId": active.activityId,
        "artifactDirectory": active.directory.path,
        "startedAtEpochMilliseconds": active.startedAtEpochMilliseconds,
        "sampleCounts": active.sampleCounts,
        "hasWriteFailure": active.failureDescription != nil,
      ]
    }
  }

  func exportActivity(activityId: String? = nil, forceRecreate: Bool = false) throws -> URL {
    let targetActivityId = activityId ?? latestActivityId
    guard let targetActivityId else {
      throw NSError(
        domain: "RemusEvidenceStore",
        code: 404,
        userInfo: [NSLocalizedDescriptionKey: "No activity found to export."]
      )
    }
    let root = try evidenceRoot()
    let dirName = targetActivityId.replacingOccurrences(of: ":", with: "-")
    let activityDir = root.appendingPathComponent(dirName, isDirectory: true)
    guard fileManager.fileExists(atPath: activityDir.path) else {
      throw NSError(
        domain: "RemusEvidenceStore",
        code: 404,
        userInfo: [NSLocalizedDescriptionKey: "Activity directory does not exist: \(dirName)"]
      )
    }

    let documentsURL = try fileManager.url(
      for: .documentDirectory,
      in: .userDomainMask,
      appropriateFor: nil,
      create: true
    )
    let exportDir = documentsURL.appendingPathComponent("RemusExport", isDirectory: true)
    try fileManager.createDirectory(at: exportDir, withIntermediateDirectories: true)
    let zipURL = exportDir.appendingPathComponent("\(dirName).zip")

    if !forceRecreate && fileManager.fileExists(atPath: zipURL.path) {
      if let attrs = try? fileManager.attributesOfItem(atPath: zipURL.path),
         let size = (attrs[.size] as? NSNumber)?.int64Value, size > 0 {
        return zipURL
      }
    }

    if fileManager.fileExists(atPath: zipURL.path) {
      try? fileManager.removeItem(at: zipURL)
    }

    var coordinatorError: NSError?
    var innerError: Error?
    var tempZipURL: URL?
    let coordinator = NSFileCoordinator()
    coordinator.coordinate(readingItemAt: activityDir, options: .forUploading, error: &coordinatorError) { zipUrl in
      do {
        try self.fileManager.copyItem(at: zipUrl, to: zipURL)
        tempZipURL = zipURL
      } catch {
        innerError = error
      }
    }

    if let coordinatorError { throw coordinatorError }
    if let innerError { throw innerError }

    guard let finalZipURL = tempZipURL, fileManager.fileExists(atPath: finalZipURL.path) else {
      throw NSError(
        domain: "RemusEvidenceStore",
        code: 500,
        userInfo: [NSLocalizedDescriptionKey: "Failed to generate zip archive"]
      )
    }

    return finalZipURL
  }

  func listRecordings() throws -> [[String: Any]] {
    try queue.sync {
      let directories = try fileManager.contentsOfDirectory(
        at: evidenceRoot(),
        includingPropertiesForKeys: [.isDirectoryKey],
        options: [.skipsHiddenFiles]
      )
      return directories.compactMap { directory in
        let manifestURL = directory.appendingPathComponent("manifest.json")
        guard let data = try? Data(contentsOf: manifestURL),
              let manifest = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let status = manifest["status"] as? String,
              status == "finalized" || status == "interrupted",
              let activityId = manifest["activityId"] as? String,
              let startedAt = manifest["startedAtEpochMilliseconds"] as? NSNumber else { return nil }
        let endedAt = manifest["endedAtEpochMilliseconds"] as? NSNumber
        let recordings = manifest["recordingIdsBySource"] as? [String: Any] ?? [:]
        return [
          "activityId": activityId,
          "status": status,
          "startedAtEpochMilliseconds": startedAt,
          "endedAtEpochMilliseconds": endedAt ?? NSNull(),
          "durationSeconds": endedAt.map { max(0, ($0.doubleValue - startedAt.doubleValue) / 1_000) } ?? 0,
          "sourceIds": Array(recordings.keys).sorted(),
          "sampleCounts": manifest["sampleCounts"] as? [String: Any] ?? [:],
        ]
      }.sorted {
        ($0["startedAtEpochMilliseconds"] as? NSNumber)?.int64Value ?? 0 >
          ($1["startedAtEpochMilliseconds"] as? NSNumber)?.int64Value ?? 0
      }
    }
  }

  func finalizeRecording(activityId: String) throws -> [String: Any] {
    try queue.sync {
      guard active?.activityId != activityId,
            activityId.hasPrefix("activity:"),
            !activityId.contains("/"),
            !activityId.contains("..") else {
        throw NSError(domain: "RemusEvidenceStore", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid activity ID"])
      }
      let dirName = activityId.replacingOccurrences(of: ":", with: "-")
      let activityDir = try evidenceRoot().appendingPathComponent(dirName, isDirectory: true)
      guard fileManager.fileExists(atPath: activityDir.path) else {
        throw NSError(domain: "RemusEvidenceStore", code: 404, userInfo: [NSLocalizedDescriptionKey: "Activity directory not found: \(dirName)"])
      }

      let manifestURL = activityDir.appendingPathComponent("manifest.json")
      guard let data = try? Data(contentsOf: manifestURL),
            var manifest = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else {
        throw NSError(domain: "RemusEvidenceStore", code: 500, userInfo: [NSLocalizedDescriptionKey: "Manifest not found or corrupt"])
      }

      let startedAt = (manifest["startedAtEpochMilliseconds"] as? NSNumber)?.int64Value ?? 0
      var maxTimestamp: Int64 = startedAt
      var sampleCounts: [String: Int] = [:]

      for (stream, filename) in streamFiles {
        let streamURL = activityDir.appendingPathComponent(filename)
        let (count, streamMaxTs) = sanitizeAndInspectStream(fileURL: streamURL)
        sampleCounts[stream] = count
        if let ts = streamMaxTs, ts > maxTimestamp {
          maxTimestamp = ts
        }
      }

      manifest["sampleCounts"] = sampleCounts
      manifest["status"] = "finalized"
      manifest["endedAtEpochMilliseconds"] = maxTimestamp

      let parts = try partManifests(directory: activityDir, counts: sampleCounts)
      manifest["parts"] = parts

      let updatedData = try JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys])
      try updatedData.write(to: manifestURL, options: [.atomic])

      let durationSeconds = max(0, Double(maxTimestamp - startedAt) / 1000.0)
      let recordingsMap = (manifest["recordingIdsBySource"] as? [String: Any]) ?? [:]
      return [
        "activityId": activityId,
        "status": "finalized",
        "startedAtEpochMilliseconds": startedAt,
        "endedAtEpochMilliseconds": maxTimestamp,
        "durationSeconds": durationSeconds,
        "sourceIds": Array(recordingsMap.keys).sorted(),
        "sampleCounts": sampleCounts,
      ]
    }
  }

  func deleteRecording(activityId: String) throws -> Bool {
    try queue.sync {
      guard active?.activityId != activityId,
            activityId.hasPrefix("activity:"),
            !activityId.contains("/"),
            !activityId.contains("..") else { return false }
      let dirName = activityId.replacingOccurrences(of: ":", with: "-")
      let directory = try evidenceRoot().appendingPathComponent(dirName, isDirectory: true)
      guard fileManager.fileExists(atPath: directory.path) else { return false }
      try fileManager.removeItem(at: directory)

      let documentsURL = try fileManager.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      let zipURL = documentsURL.appendingPathComponent("RemusExport/\(dirName).zip")
      if fileManager.fileExists(atPath: zipURL.path) { try? fileManager.removeItem(at: zipURL) }
      if latestActivityId == activityId { latestActivityId = nil }
      return true
    }
  }

  private func append(stream: String, sourceId: String, payload: [String: Any]) {
    queue.async { [weak self] in
      guard let self else { return }
      do {
        try self.appendOnQueue(stream: stream, sourceId: sourceId, payload: payload)
      } catch {
        self.recordFailureOnQueue(error)
      }
    }
  }

  private func recordFailureOnQueue(_ error: Error) {
    guard var recording = active, recording.failureDescription == nil else { return }
    recording.failureDescription = error.localizedDescription
    active = recording
  }

  private func appendOnQueue(
    stream: String,
    sourceId: String? = nil,
    payload: [String: Any]
  ) throws {
    guard var recording = active, let handle = recording.handles[stream] else { return }
    var envelope = payload
    envelope["schemaVersion"] = "1.0.0"
    envelope["activityId"] = recording.activityId
    if let sourceId {
      envelope["sourceId"] = sourceId
      if let recordingId = recording.recordingIdsBySource[sourceId] {
        envelope["recordingId"] = recordingId
      }
    }

    let data = try JSONSerialization.data(withJSONObject: envelope)
    handle.seekToEndOfFile()
    handle.write(data)
    handle.write(Data([0x0A]))

    recording.sampleCounts[stream, default: 0] += 1
    recording.appendCountSinceSync += 1
    active = recording

    if recording.appendCountSinceSync >= 500 {
      try synchronizeOnQueue()
    }
  }

  private func synchronizeOnQueue() throws {
    guard var recording = active else { return }
    for handle in recording.handles.values {
      try handle.synchronize()
    }
    recording.appendCountSinceSync = 0
    active = recording
  }

  private func writeManifestOnQueue(status: String, endedAt: Int64?, parts: [[String: Any]]?) throws {
    guard let recording = active else { return }
    var manifest: [String: Any] = [
      "schemaVersion": "1.0.0",
      "producer": "remus-app-ios",
      "activityId": recording.activityId,
      "activityCorrelationId": recording.activityCorrelationId,
      "status": status,
      "startedAtEpochMilliseconds": recording.startedAtEpochMilliseconds,
      "recordingIdsBySource": recording.recordingIdsBySource,
      "artifactDirectory": recording.directory.path,
      "sampleCounts": recording.sampleCounts,
    ]
    if let endedAt { manifest["endedAtEpochMilliseconds"] = endedAt }
    if let parts { manifest["parts"] = parts }
    if let failure = recording.failureDescription { manifest["failureMessage"] = failure }

    let manifestURL = recording.directory.appendingPathComponent("manifest.json")
    let data = try JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys])
    try data.write(to: manifestURL, options: [.atomic])
  }

  private func partManifests(directory: URL, counts: [String: Int]) throws -> [[String: Any]] {
    var parts: [[String: Any]] = []
    for (stream, filename) in streamFiles {
      let fileURL = directory.appendingPathComponent(filename)
      guard fileManager.fileExists(atPath: fileURL.path) else { continue }
      let attrs = try fileManager.attributesOfItem(atPath: fileURL.path)
      let byteLength = (attrs[.size] as? NSNumber)?.int64Value ?? 0
      let hash = try sha256(fileURL)
      parts.append([
        "stream": stream,
        "filename": filename,
        "byteLength": byteLength,
        "sha256": hash,
        "lineCount": counts[stream, default: 0],
      ])
    }
    return parts.sorted { ($0["stream"] as? String ?? "") < ($1["stream"] as? String ?? "") }
  }

  private func sha256(_ url: URL) throws -> String {
    let handle = try FileHandle(forReadingFrom: url)
    defer { try? handle.close() }
    var hasher = SHA256()
    while autoreleasepool(invoking: {
      let data = handle.readData(ofLength: 64 * 1024)
      if data.isEmpty { return false }
      hasher.update(data: data)
      return true
    }) {}
    return hasher.finalize().compactMap { String(format: "%02x", $0) }.joined()
  }

  private func evidenceRoot() throws -> URL {
    let documentsURL = try fileManager.url(
      for: .documentDirectory,
      in: .userDomainMask,
      appropriateFor: nil,
      create: true
    )
    let root = documentsURL.appendingPathComponent("recordings", isDirectory: true)
    if !fileManager.fileExists(atPath: root.path) {
      try fileManager.createDirectory(at: root, withIntermediateDirectories: true)
    }
    return root
  }

  private func hasMinimumFreeStorage(at url: URL) -> Bool {
    guard let values = try? url.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]),
          let capacity = values.volumeAvailableCapacityForImportantUsage else {
      return true
    }
    return capacity >= 512 * 1024 * 1024
  }

  private func epochMilliseconds() -> Int64 {
    Int64(Date().timeIntervalSince1970 * 1_000)
  }

  private func startResult(_ recording: ActiveRecording) -> [String: Any] {
    [
      "activityId": recording.activityId,
      "activityCorrelationId": recording.activityCorrelationId,
      "recordingIdsBySource": recording.recordingIdsBySource,
      "artifactDirectory": recording.directory.path,
    ]
  }

  private func recoverInterruptedRecordings() {
    guard let root = try? evidenceRoot(),
          let entries = try? fileManager.contentsOfDirectory(
            at: root,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
          ) else { return }

    for dir in entries where dir.lastPathComponent.hasPrefix("activity-") {
      let manifestURL = dir.appendingPathComponent("manifest.json")
      guard let data = try? Data(contentsOf: manifestURL),
            var manifest = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
            (manifest["status"] as? String) == "recording",
            let activityId = manifest["activityId"] as? String else { continue }

      _ = try? finalizeRecording(activityId: activityId)
    }
  }

  private func sanitizeAndInspectStream(fileURL: URL) -> (count: Int, maxTimestampMs: Int64?) {
    guard fileManager.fileExists(atPath: fileURL.path) else { return (0, nil) }
    guard let handle = try? FileHandle(forUpdating: fileURL) else { return (0, nil) }
    defer { try? handle.close() }

    guard let fileSize = (try? fileURL.resourceValues(forKeys: [.fileSizeKey]))?.fileSize, fileSize > 0 else {
      return (0, nil)
    }

    let tailReadSize = min(fileSize, 16384)
    let tailOffset = UInt64(fileSize - tailReadSize)
    try? handle.seek(toOffset: tailOffset)
    let tailData = handle.readDataToEndOfFile()

    var truncateOffset: UInt64? = nil
    if let lastByte = tailData.last, lastByte != 0x0A {
      if let lastNewlineIndex = tailData.lastIndex(of: 0x0A) {
        truncateOffset = tailOffset + UInt64(lastNewlineIndex) + 1
      } else if tailOffset == 0 {
        truncateOffset = 0
      }
    }

    if let offset = truncateOffset {
      try? handle.truncate(atOffset: offset)
      try? handle.synchronize()
    }

    try? handle.seek(toOffset: 0)
    var lineCount = 0
    var lastLineData = Data()
    var buffer = Data()

    while let chunk = try? handle.read(upToCount: 65536), !chunk.isEmpty {
      for byte in chunk {
        if byte == 0x0A {
          lineCount += 1
          lastLineData = buffer
          buffer.removeAll(keepingCapacity: true)
        } else {
          if buffer.count < 8192 {
            buffer.append(byte)
          }
        }
      }
    }

    var maxTs: Int64? = nil
    if !lastLineData.isEmpty,
       let json = (try? JSONSerialization.jsonObject(with: lastLineData)) as? [String: Any] {
      if let ts = (json["receivedAtEpochMilliseconds"] as? NSNumber)?.int64Value {
        maxTs = ts
      } else if let ts = (json["timestampEpochMilliseconds"] as? NSNumber)?.int64Value {
        maxTs = ts
      } else if let ts = (json["nativeTimestampEpochMilliseconds"] as? NSNumber)?.int64Value {
        maxTs = ts
      }
    }

    return (lineCount, maxTs)
  }
}
