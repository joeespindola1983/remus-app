export const iosSyntheticFixtures = {
  startResult: {
    activityId: 'activity:ios:001',
    activityCorrelationId: 'corr:ios:001',
    artifactDirectory:
      '/var/mobile/Containers/Data/Application/ABC-123/Documents/recordings/activity-ios-001',
    recordingIdsBySource: {
      'phone:primary': 'rec:ios:phone:001',
    },
  },
  activeState: {
    isRecording: true,
    activityId: 'activity:ios:001',
    artifactDirectory:
      '/var/mobile/Containers/Data/Application/ABC-123/Documents/recordings/activity-ios-001',
    startedAtEpochMilliseconds: 1729864800000,
    sampleCounts: {
      phoneMotion: 120,
      phoneLocation: 30,
    },
    hasWriteFailure: false,
  },
  idleState: {
    isRecording: false,
  },
  finalizedManifest: {
    schemaVersion: '1.0.0',
    producer: 'remus-recorder-ios',
    activityId: 'activity:ios:001',
    activityCorrelationId: 'corr:ios:001',
    status: 'finalized' as const,
    startedAtEpochMilliseconds: 1729864800000,
    endedAtEpochMilliseconds: 1729865400000,
    artifactDirectory:
      '/var/mobile/Containers/Data/Application/ABC-123/Documents/recordings/activity-ios-001',
    recordingIdsBySource: {
      'phone:primary': 'rec:ios:phone:001',
    },
    sampleCounts: {
      phoneMotion: 120,
      phoneLocation: 30,
    },
  },
  interruptedManifest: {
    schemaVersion: '1.0.0',
    producer: 'remus-recorder-ios',
    activityId: 'activity:ios:001',
    activityCorrelationId: 'corr:ios:001',
    status: 'interrupted' as const,
    startedAtEpochMilliseconds: 1729864800000,
    endedAtEpochMilliseconds: 1729865100000,
    artifactDirectory:
      '/var/mobile/Containers/Data/Application/ABC-123/Documents/recordings/activity-ios-001',
    recordingIdsBySource: {
      'phone:primary': 'rec:ios:phone:001',
    },
    sampleCounts: {
      phoneMotion: 60,
    },
    failureMessage: 'disk_space_exhausted',
  },
  exportResult: {
    zipPath:
      '/var/mobile/Containers/Data/Application/ABC-123/Documents/RemusExport/activity-ios-001.zip',
    shared: true,
  },
};

export const androidSyntheticFixtures = {
  // Divergent native contract: returns directoryPath instead of artifactDirectory
  startResult: {
    activityId: 'activity:android:001',
    activityCorrelationId: 'corr:android:001',
    directoryPath:
      '/data/user/0/com.espindola.remus.recorder/files/recordings/activity-android-001',
    recordingIdsBySource: {
      'phone:primary': 'rec:android:phone:001',
    },
  },
  activeState: {
    isRecording: true,
    activityId: 'activity:android:001',
    artifactDirectory:
      '/data/user/0/com.espindola.remus.recorder/files/recordings/activity-android-001',
  },
  idleState: {
    isRecording: false,
    activityId: null,
    artifactDirectory: null,
  },
  // Android manifest can contain directoryPath or omit it if relying on session directory
  finalizedManifest: {
    schemaVersion: '1.0.0',
    producer: 'remus-recorder-android',
    activityId: 'activity:android:001',
    activityCorrelationId: 'corr:android:001',
    status: 'finalized' as const,
    startedAtEpochMilliseconds: 1729864800000,
    endedAtEpochMilliseconds: 1729865400000,
    directoryPath:
      '/data/user/0/com.espindola.remus.recorder/files/recordings/activity-android-001',
    recordingIdsBySource: {
      'phone:primary': 'rec:android:phone:001',
    },
    sampleCounts: {
      phoneMotion: 115,
      phoneLocation: 28,
    },
  },
  interruptedManifest: {
    schemaVersion: '1.0.0',
    producer: 'remus-recorder-android',
    activityId: 'activity:android:001',
    activityCorrelationId: 'corr:android:001',
    status: 'interrupted' as const,
    startedAtEpochMilliseconds: 1729864800000,
    endedAtEpochMilliseconds: 1729865000000,
    directoryPath:
      '/data/user/0/com.espindola.remus.recorder/files/recordings/activity-android-001',
    recordingIdsBySource: {
      'phone:primary': 'rec:android:phone:001',
    },
    sampleCounts: {
      phoneMotion: 50,
    },
    failureMessage: 'process_killed_low_memory',
  },
  exportResult: {
    zipPath:
      '/data/user/0/com.espindola.remus.recorder/files/RemusExport/activity-android-001.zip',
    shared: true,
  },
};
