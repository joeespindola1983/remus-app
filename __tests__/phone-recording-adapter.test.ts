import {
  PhoneRecordingAdapter,
} from '../src/recording/phoneRecordingAdapter';
import {
  PHONE_PRIMARY_SOURCE_ID,
  NativePhoneRecordingBridge,
} from '../src/recording/phoneRecordingContracts';
import {
  RecordingUnavailableError,
  RecordingCommandConflictError,
  RecordingTimeoutError,
  InvalidRecordingResponseError,
  RecordingBridgeError,
} from '../src/recording/phoneRecordingErrors';
import {
  iosSyntheticFixtures,
  androidSyntheticFixtures,
} from '../src/recording/fixtures/phoneRecordingFixtures';

describe('PhoneRecordingAdapter (TDD 014A)', () => {
  const createMockBridge = (
    overrides: Partial<NativePhoneRecordingBridge> = {},
  ): NativePhoneRecordingBridge => ({
    startRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.startResult),
    stopRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.finalizedManifest),
    getRecordingState: jest.fn().mockResolvedValue(iosSyntheticFixtures.idleState),
    exportRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.exportResult),
    ...overrides,
  });

  describe('Native bridge availability', () => {
    it('throws RecordingUnavailableError when bridge is not provided', async () => {
      const adapter = new PhoneRecordingAdapter(undefined);

      await expect(adapter.start()).rejects.toThrow(RecordingUnavailableError);
      await expect(adapter.stop()).rejects.toThrow(RecordingUnavailableError);
      await expect(adapter.getState()).rejects.toThrow(RecordingUnavailableError);
      await expect(adapter.exportRecording()).rejects.toThrow(RecordingUnavailableError);
    });
  });

  describe('iOS native bridge integration', () => {
    it('starts, verifies state, stops, and exports a phone-only recording session', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.startResult),
        getRecordingState: jest.fn().mockResolvedValue(iosSyntheticFixtures.activeState),
        stopRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.finalizedManifest),
        exportRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.exportResult),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      // 1. Start recording
      const startResult = await adapter.start();
      expect(bridge.startRecording).toHaveBeenCalledWith({
        sourceIds: [PHONE_PRIMARY_SOURCE_ID],
      });
      expect(startResult).toEqual({
        activityId: 'activity:ios:001',
        activityCorrelationId: 'corr:ios:001',
        artifactDirectory:
          '/var/mobile/Containers/Data/Application/ABC-123/Documents/recordings/activity-ios-001',
        recordingIdsBySource: {
          'phone:primary': 'rec:ios:phone:001',
        },
      });

      // 2. Query state while active
      const state = await adapter.getState();
      expect(state.isRecording).toBe(true);
      expect(state.activityId).toBe('activity:ios:001');
      expect(state.artifactDirectory).toBe(
        '/var/mobile/Containers/Data/Application/ABC-123/Documents/recordings/activity-ios-001',
      );
      expect(state.sampleCounts).toEqual({
        phoneMotion: 120,
        phoneLocation: 30,
      });

      // 3. Stop recording
      const manifest = await adapter.stop();
      expect(bridge.stopRecording).toHaveBeenCalledTimes(1);
      expect(manifest.status).toBe('finalized');
      expect(manifest.activityId).toBe('activity:ios:001');
      expect(manifest.artifactDirectory).toBe(
        '/var/mobile/Containers/Data/Application/ABC-123/Documents/recordings/activity-ios-001',
      );
      expect(manifest.startedAtEpochMilliseconds).toBe(1729864800000);
      expect(manifest.endedAtEpochMilliseconds).toBe(1729865400000);

      // 4. Export recording
      const exported = await adapter.exportRecording({activityId: 'activity:ios:001'});
      expect(bridge.exportRecording).toHaveBeenCalledWith({activityId: 'activity:ios:001'});
      expect(exported.zipPath).toContain('activity-ios-001.zip');
      expect(exported.shared).toBe(true);
    });

    it('preserves interrupted status and failure reason in manifest', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.startResult),
        stopRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.interruptedManifest),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await adapter.start();
      const manifest = await adapter.stop();

      expect(manifest.status).toBe('interrupted');
      expect(manifest.failureMessage).toBe('disk_space_exhausted');
    });
  });

  describe('Android native bridge integration and alias normalization', () => {
    it('normalizes directoryPath to artifactDirectory and preserves returned IDs', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue(androidSyntheticFixtures.startResult),
        getRecordingState: jest.fn().mockResolvedValue(androidSyntheticFixtures.activeState),
        stopRecording: jest.fn().mockResolvedValue(androidSyntheticFixtures.finalizedManifest),
        exportRecording: jest.fn().mockResolvedValue(androidSyntheticFixtures.exportResult),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      // 1. Start: Android returns directoryPath -> must be normalized to artifactDirectory
      const startResult = await adapter.start();
      expect(startResult.artifactDirectory).toBe(
        '/data/user/0/com.espindola.remus.recorder/files/recordings/activity-android-001',
      );
      expect(startResult.activityId).toBe('activity:android:001');
      expect(startResult.activityCorrelationId).toBe('corr:android:001');
      expect(startResult.recordingIdsBySource).toEqual({
        'phone:primary': 'rec:android:phone:001',
      });

      // 2. Stop: Android manifest returns directoryPath -> normalized to artifactDirectory
      const manifest = await adapter.stop();
      expect(manifest.artifactDirectory).toBe(
        '/data/user/0/com.espindola.remus.recorder/files/recordings/activity-android-001',
      );
      expect(manifest.producer).toBe('remus-recorder-android');
      expect(manifest.status).toBe('finalized');

      // 3. Export
      const exportResult = await adapter.exportRecording();
      expect(exportResult.zipPath).toBe(
        '/data/user/0/com.espindola.remus.recorder/files/RemusExport/activity-android-001.zip',
      );
      expect(exportResult.shared).toBe(true);
    });

    it('safely handles Android idle state with null values', async () => {
      const bridge = createMockBridge({
        getRecordingState: jest.fn().mockResolvedValue(androidSyntheticFixtures.idleState),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      const state = await adapter.getState();
      expect(state.isRecording).toBe(false);
      expect(state.activityId).toBeUndefined();
      expect(state.artifactDirectory).toBeUndefined();
    });
  });

  describe('Validation of invalid native responses', () => {
    it('rejects startRecording when bridge returns null or non-object', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue(null),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await expect(adapter.start()).rejects.toThrow(InvalidRecordingResponseError);
    });

    it('rejects startRecording when activityId is missing or empty', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue({
          activityId: '',
          activityCorrelationId: 'corr:1',
          artifactDirectory: '/tmp/dir',
          recordingIdsBySource: {'phone:primary': 'rec:1'},
        }),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await expect(adapter.start()).rejects.toThrow(InvalidRecordingResponseError);
    });

    it('rejects startRecording when neither artifactDirectory nor directoryPath is provided', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue({
          activityId: 'activity:1',
          activityCorrelationId: 'corr:1',
          recordingIdsBySource: {'phone:primary': 'rec:1'},
        }),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await expect(adapter.start()).rejects.toThrow(InvalidRecordingResponseError);
    });

    it('rejects startRecording when recordingIdsBySource is missing or empty', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue({
          activityId: 'activity:1',
          activityCorrelationId: 'corr:1',
          artifactDirectory: '/tmp/dir',
          recordingIdsBySource: {},
        }),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await expect(adapter.start()).rejects.toThrow(InvalidRecordingResponseError);
    });

    it('rejects stopRecording when status is invalid', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.startResult),
        stopRecording: jest.fn().mockResolvedValue({
          activityId: 'activity:ios:001',
          status: 'partially_done', // invalid status
          startedAtEpochMilliseconds: 1729864800000,
          artifactDirectory: '/tmp/dir',
        }),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await adapter.start();
      await expect(adapter.stop()).rejects.toThrow(InvalidRecordingResponseError);
    });

    it('rejects stopRecording when startedAtEpochMilliseconds is not a finite number', async () => {
      const bridge = createMockBridge({
        startRecording: jest.fn().mockResolvedValue(iosSyntheticFixtures.startResult),
        stopRecording: jest.fn().mockResolvedValue({
          activityId: 'activity:ios:001',
          status: 'finalized',
          startedAtEpochMilliseconds: 'invalid-date',
          artifactDirectory: '/tmp/dir',
        }),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await adapter.start();
      await expect(adapter.stop()).rejects.toThrow(InvalidRecordingResponseError);
    });

    it('rejects exportRecording when response is malformed', async () => {
      const bridge = createMockBridge({
        exportRecording: jest.fn().mockResolvedValue({zipPath: ''}),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await expect(adapter.exportRecording()).rejects.toThrow(InvalidRecordingResponseError);
    });
  });

  describe('Repeated commands and conflict prevention', () => {
    it('rejects duplicate start() when a recording is already active', async () => {
      const bridge = createMockBridge();
      const adapter = new PhoneRecordingAdapter(bridge);

      await adapter.start();
      await expect(adapter.start()).rejects.toThrow(RecordingCommandConflictError);
    });

    it('rejects start() when another start() is already in flight', async () => {
      let resolveStart: (value: unknown) => void;
      const bridge = createMockBridge({
        startRecording: jest.fn().mockImplementation(
          () =>
            new Promise(resolve => {
              resolveStart = resolve;
            }),
        ),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      const promise1 = adapter.start();
      await expect(adapter.start()).rejects.toThrow(RecordingCommandConflictError);

      resolveStart!(iosSyntheticFixtures.startResult);
      await promise1;
    });

    it('rejects stop() when no recording is active', async () => {
      const bridge = createMockBridge();
      const adapter = new PhoneRecordingAdapter(bridge);

      await expect(adapter.stop()).rejects.toThrow(RecordingCommandConflictError);
    });

    it('rejects stop() when another stop() is already in flight', async () => {
      let resolveStop: (value: unknown) => void;
      const bridge = createMockBridge({
        stopRecording: jest.fn().mockImplementation(
          () =>
            new Promise(resolve => {
              resolveStop = resolve;
            }),
        ),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await adapter.start();
      const promise1 = adapter.stop();
      await expect(adapter.stop()).rejects.toThrow(RecordingCommandConflictError);

      resolveStop!(iosSyntheticFixtures.finalizedManifest);
      await promise1;
    });

    it('rejects stop() when start() is still in flight', async () => {
      let resolveStart: (value: unknown) => void;
      const bridge = createMockBridge({
        startRecording: jest.fn().mockImplementation(
          () =>
            new Promise(resolve => {
              resolveStart = resolve;
            }),
        ),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      const startPromise = adapter.start();
      await expect(adapter.stop()).rejects.toThrow(RecordingCommandConflictError);

      resolveStart!(iosSyntheticFixtures.startResult);
      await startPromise;
    });

    it('rejects exportRecording() when start() is still in flight', async () => {
      let resolveStart: (value: unknown) => void;
      const bridge = createMockBridge({
        startRecording: jest.fn().mockImplementation(
          () =>
            new Promise(resolve => {
              resolveStart = resolve;
            }),
        ),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      const startPromise = adapter.start();
      await expect(adapter.exportRecording()).rejects.toThrow(RecordingCommandConflictError);

      resolveStart!(iosSyntheticFixtures.startResult);
      await startPromise;
    });
  });

  describe('Command timeout, unknown state and state reconciliation', () => {
    it('throws RecordingTimeoutError when start hangs, setting indeterminate state without declaring finalization', async () => {
      jest.useFakeTimers();
      const bridge = createMockBridge({
        startRecording: jest.fn().mockImplementation(() => new Promise(() => {})),
      });
      const adapter = new PhoneRecordingAdapter(bridge, {defaultTimeoutMs: 2000});

      const startPromise = adapter.start();
      jest.advanceTimersByTime(2001);

      await expect(startPromise).rejects.toThrow(RecordingTimeoutError);
      expect(adapter.hasUnknownState()).toBe(true);

      // Crucial: timeout must NEVER declare finalization on timer
      expect(adapter.getConfirmedSession()).toBeUndefined();
      jest.useRealTimers();
    });

    it('reconciles state through getRecordingState after a timeout occurs', async () => {
      jest.useFakeTimers();
      const bridge = createMockBridge({
        startRecording: jest.fn().mockImplementation(() => new Promise(() => {})),
        getRecordingState: jest.fn().mockResolvedValue(iosSyntheticFixtures.activeState),
      });
      const adapter = new PhoneRecordingAdapter(bridge, {defaultTimeoutMs: 1000});

      const startPromise = adapter.start();
      jest.advanceTimersByTime(1001);
      await expect(startPromise).rejects.toThrow(RecordingTimeoutError);
      expect(adapter.hasUnknownState()).toBe(true);

      jest.useRealTimers();

      // State reconciliation via native query
      const reconciled = await adapter.reconcileState();
      expect(reconciled.isRecording).toBe(true);
      expect(reconciled.activityId).toBe('activity:ios:001');
      expect(adapter.hasUnknownState()).toBe(false);
      expect(adapter.getConfirmedSession()?.activityId).toBe('activity:ios:001');
    });

    it('reconciles state to idle if native indicates recording is not active', async () => {
      jest.useFakeTimers();
      const bridge = createMockBridge({
        stopRecording: jest.fn().mockImplementation(() => new Promise(() => {})),
        getRecordingState: jest.fn().mockResolvedValue(iosSyntheticFixtures.idleState),
      });
      const adapter = new PhoneRecordingAdapter(bridge, {defaultTimeoutMs: 1000});

      await adapter.start();
      const stopPromise = adapter.stop();
      jest.advanceTimersByTime(1001);
      await expect(stopPromise).rejects.toThrow(RecordingTimeoutError);
      expect(adapter.hasUnknownState()).toBe(true);

      jest.useRealTimers();

      const reconciled = await adapter.reconcileState();
      expect(reconciled.isRecording).toBe(false);
      expect(adapter.hasUnknownState()).toBe(false);
      expect(adapter.getConfirmedSession()).toBeUndefined();
    });
  });

  describe('Native bridge error handling', () => {
    it('wraps native bridge rejection in RecordingBridgeError and resets in-flight status', async () => {
      const nativeError = new Error('PERMISSION_DENIED_LOCATION');
      const bridge = createMockBridge({
        startRecording: jest.fn().mockRejectedValue(nativeError),
      });
      const adapter = new PhoneRecordingAdapter(bridge);

      await expect(adapter.start()).rejects.toThrow(RecordingBridgeError);

      // In-flight status must be cleared so subsequent calls can proceed
      bridge.startRecording = jest.fn().mockResolvedValue(iosSyntheticFixtures.startResult);
      await expect(adapter.start()).resolves.toBeDefined();
    });
  });
});
