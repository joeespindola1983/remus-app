import {NativeEventEmitter, NativeModules} from 'react-native';
import {
  PHONE_PRIMARY_SOURCE_ID,
  NativePhoneRecordingBridge,
  PhoneHardwareProfile,
  PhoneRecordingExportOptions,
  PhoneRecordingExportResult,
  PhoneRecordingManifest,
  PhoneRecordingProjection,
  PhoneRecordingStartOptions,
  PhoneRecordingStartResult,
  PhoneRecordingState,
  PhoneRecordingStopOptions,
} from './phoneRecordingContracts';
import {
  InvalidRecordingResponseError,
  RecordingBridgeError,
  RecordingCommandConflictError,
  RecordingTimeoutError,
  RecordingUnavailableError,
} from './phoneRecordingErrors';

export interface PhoneRecordingAdapterOptions {
  defaultTimeoutMs?: number;
  emitter?: NativeEventEmitter;
}

const DEFAULT_COMMAND_TIMEOUT_MS = 5000;

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function normalizeStartResult(raw: unknown): PhoneRecordingStartResult {
  if (!isObject(raw)) {
    throw new InvalidRecordingResponseError(
      'Native startRecording response must be an object',
    );
  }

  const {activityId, activityCorrelationId, artifactDirectory, directoryPath, recordingIdsBySource} = raw;

  if (typeof activityId !== 'string' || activityId.trim().length === 0) {
    throw new InvalidRecordingResponseError(
      'startRecording response must contain a non-empty activityId',
    );
  }

  if (typeof activityCorrelationId !== 'string' || activityCorrelationId.trim().length === 0) {
    throw new InvalidRecordingResponseError(
      'startRecording response must contain a non-empty activityCorrelationId',
    );
  }

  const resolvedDirectory =
    typeof artifactDirectory === 'string' && artifactDirectory.trim().length > 0
      ? artifactDirectory
      : typeof directoryPath === 'string' && directoryPath.trim().length > 0
      ? directoryPath
      : undefined;

  if (!resolvedDirectory) {
    throw new InvalidRecordingResponseError(
      'startRecording response must contain artifactDirectory or directoryPath',
    );
  }

  if (
    !isObject(recordingIdsBySource) ||
    Object.keys(recordingIdsBySource).length === 0 ||
    Object.values(recordingIdsBySource).some(v => typeof v !== 'string' || v.trim().length === 0)
  ) {
    throw new InvalidRecordingResponseError(
      'startRecording response must contain non-empty recordingIdsBySource with string IDs',
    );
  }

  return {
    activityId,
    activityCorrelationId,
    artifactDirectory: resolvedDirectory,
    recordingIdsBySource: recordingIdsBySource as Record<string, string>,
  };
}

function normalizeStateResult(raw: unknown): PhoneRecordingState {
  if (!isObject(raw)) {
    throw new InvalidRecordingResponseError(
      'Native getRecordingState response must be an object',
    );
  }

  const {
    isRecording,
    activityId,
    artifactDirectory,
    directoryPath,
    startedAtEpochMilliseconds,
    sampleCounts,
    hasWriteFailure,
  } = raw;

  if (typeof isRecording !== 'boolean') {
    throw new InvalidRecordingResponseError(
      'getRecordingState response must contain a boolean isRecording property',
    );
  }

  const resolvedDirectory =
    typeof artifactDirectory === 'string' && artifactDirectory.trim().length > 0
      ? artifactDirectory
      : typeof directoryPath === 'string' && directoryPath.trim().length > 0
      ? directoryPath
      : undefined;

  return {
    isRecording,
    activityId:
      typeof activityId === 'string' && activityId.trim().length > 0
        ? activityId
        : undefined,
    artifactDirectory: resolvedDirectory,
    startedAtEpochMilliseconds:
      typeof startedAtEpochMilliseconds === 'number' && Number.isFinite(startedAtEpochMilliseconds)
        ? startedAtEpochMilliseconds
        : undefined,
    sampleCounts: isObject(sampleCounts) ? (sampleCounts as Record<string, number>) : undefined,
    hasWriteFailure: typeof hasWriteFailure === 'boolean' ? hasWriteFailure : undefined,
  };
}

function normalizeManifestResult(
  raw: unknown,
  fallbackDirectory?: string,
): PhoneRecordingManifest {
  if (!isObject(raw)) {
    throw new InvalidRecordingResponseError(
      'Native stopRecording response must be an object',
    );
  }

  const {
    schemaVersion,
    producer,
    activityId,
    activityCorrelationId,
    status,
    startedAtEpochMilliseconds,
    endedAtEpochMilliseconds,
    artifactDirectory,
    directoryPath,
    recordingIdsBySource,
    sampleCounts,
    failureMessage,
  } = raw;

  if (typeof activityId !== 'string' || activityId.trim().length === 0) {
    throw new InvalidRecordingResponseError(
      'stopRecording response must contain a non-empty activityId',
    );
  }

  if (status !== 'recording' && status !== 'finalized' && status !== 'interrupted') {
    throw new InvalidRecordingResponseError(
      `stopRecording response has invalid status: ${String(status)}`,
    );
  }

  if (typeof startedAtEpochMilliseconds !== 'number' || !Number.isFinite(startedAtEpochMilliseconds)) {
    throw new InvalidRecordingResponseError(
      'stopRecording response must contain a finite startedAtEpochMilliseconds number',
    );
  }

  const resolvedDirectory =
    typeof artifactDirectory === 'string' && artifactDirectory.trim().length > 0
      ? artifactDirectory
      : typeof directoryPath === 'string' && directoryPath.trim().length > 0
      ? directoryPath
      : fallbackDirectory;

  if (!resolvedDirectory) {
    throw new InvalidRecordingResponseError(
      'stopRecording response must have an artifactDirectory or directoryPath',
    );
  }

  return {
    schemaVersion: typeof schemaVersion === 'string' ? schemaVersion : undefined,
    producer: typeof producer === 'string' ? producer : undefined,
    activityId,
    activityCorrelationId:
      typeof activityCorrelationId === 'string' ? activityCorrelationId : undefined,
    status,
    startedAtEpochMilliseconds,
    endedAtEpochMilliseconds:
      typeof endedAtEpochMilliseconds === 'number' && Number.isFinite(endedAtEpochMilliseconds)
        ? endedAtEpochMilliseconds
        : undefined,
    artifactDirectory: resolvedDirectory,
    recordingIdsBySource: isObject(recordingIdsBySource)
      ? (recordingIdsBySource as Record<string, string>)
      : undefined,
    sampleCounts: isObject(sampleCounts)
      ? (sampleCounts as Record<string, number>)
      : undefined,
    failureMessage: typeof failureMessage === 'string' ? failureMessage : undefined,
  };
}

function normalizeExportResult(raw: unknown): PhoneRecordingExportResult {
  if (!isObject(raw)) {
    throw new InvalidRecordingResponseError(
      'Native exportRecording response must be an object',
    );
  }

  const {zipPath, shared} = raw;

  if (typeof zipPath !== 'string' || zipPath.trim().length === 0) {
    throw new InvalidRecordingResponseError(
      'exportRecording response must contain a non-empty zipPath',
    );
  }

  if (typeof shared !== 'boolean') {
    throw new InvalidRecordingResponseError(
      'exportRecording response must contain a boolean shared property',
    );
  }

  return {
    zipPath,
    shared,
  };
}

export class PhoneRecordingAdapter {
  private readonly bridge?: NativePhoneRecordingBridge;
  private readonly emitter?: NativeEventEmitter;
  private readonly defaultTimeoutMs: number;

  private inFlightCommand: 'start' | 'stop' | 'export' | 'state' | null = null;
  private confirmedSession?: {activityId: string; artifactDirectory: string};
  private unknownState: boolean = false;

  constructor(
    bridge: NativePhoneRecordingBridge | undefined = NativeModules.RemusRecordingBridge,
    options: PhoneRecordingAdapterOptions = {},
  ) {
    this.bridge = bridge;
    this.emitter =
      options.emitter ??
      (bridge && typeof bridge.addListener === 'function'
        ? new NativeEventEmitter(bridge as never)
        : undefined);
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
  }

  hasUnknownState(): boolean {
    return this.unknownState;
  }

  getConfirmedSession(): {activityId: string; artifactDirectory: string} | undefined {
    return this.confirmedSession ? {...this.confirmedSession} : undefined;
  }

  private executeWithTimeout<T>(
    command: 'start' | 'stop' | 'export' | 'state',
    operation: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | undefined;

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            this.unknownState = true;
            this.inFlightCommand = null;
            reject(new RecordingTimeoutError(command, timeoutMs));
          }
        }, timeoutMs);
      }

      operation()
        .then(result => {
          if (!settled) {
            settled = true;
            if (timer) clearTimeout(timer);
            resolve(result);
          }
        })
        .catch(err => {
          if (!settled) {
            settled = true;
            if (timer) clearTimeout(timer);
            reject(err);
          }
        });
    });
  }

  async start(options: PhoneRecordingStartOptions = {}): Promise<PhoneRecordingStartResult> {
    if (!this.bridge) {
      throw new RecordingUnavailableError();
    }

    if (this.inFlightCommand !== null) {
      throw new RecordingCommandConflictError(
        `Cannot start recording: command '${this.inFlightCommand}' is in flight`,
      );
    }

    if (this.confirmedSession) {
      throw new RecordingCommandConflictError(
        'Cannot start recording: session is already active',
      );
    }

    this.inFlightCommand = 'start';
    const sourceIds = options.sourceIds ?? [PHONE_PRIMARY_SOURCE_ID];
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;

    try {
      const raw = await this.executeWithTimeout(
        'start',
        () => this.bridge!.startRecording({sourceIds}),
        timeoutMs,
      );

      const normalized = normalizeStartResult(raw);
      this.confirmedSession = {
        activityId: normalized.activityId,
        artifactDirectory: normalized.artifactDirectory,
      };
      this.unknownState = false;
      return normalized;
    } catch (err) {
      if (err instanceof RecordingTimeoutError || err instanceof InvalidRecordingResponseError) {
        throw err;
      }
      throw new RecordingBridgeError(
        err instanceof Error ? err.message : String(err),
        err,
      );
    } finally {
      this.inFlightCommand = null;
    }
  }

  async stop(options: PhoneRecordingStopOptions = {}): Promise<PhoneRecordingManifest> {
    if (!this.bridge) {
      throw new RecordingUnavailableError();
    }

    if (this.inFlightCommand !== null) {
      throw new RecordingCommandConflictError(
        `Cannot stop recording: command '${this.inFlightCommand}' is in flight`,
      );
    }

    if (!this.confirmedSession && !this.unknownState) {
      throw new RecordingCommandConflictError(
        'Cannot stop recording: no active session',
      );
    }

    this.inFlightCommand = 'stop';
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const fallbackDirectory = this.confirmedSession?.artifactDirectory;

    try {
      const raw = await this.executeWithTimeout(
        'stop',
        () => this.bridge!.stopRecording(),
        timeoutMs,
      );

      const manifest = normalizeManifestResult(raw, fallbackDirectory);
      this.confirmedSession = undefined;
      this.unknownState = false;
      return manifest;
    } catch (err) {
      if (err instanceof RecordingTimeoutError || err instanceof InvalidRecordingResponseError) {
        throw err;
      }
      throw new RecordingBridgeError(
        err instanceof Error ? err.message : String(err),
        err,
      );
    } finally {
      this.inFlightCommand = null;
    }
  }

  async getState(): Promise<PhoneRecordingState> {
    if (!this.bridge) {
      throw new RecordingUnavailableError();
    }

    try {
      const raw = await this.bridge.getRecordingState();
      const state = normalizeStateResult(raw);

      if (state.isRecording && state.activityId && state.artifactDirectory) {
        this.confirmedSession = {
          activityId: state.activityId,
          artifactDirectory: state.artifactDirectory,
        };
      } else if (!state.isRecording) {
        this.confirmedSession = undefined;
      }
      this.unknownState = false;

      return state;
    } catch (err) {
      if (err instanceof InvalidRecordingResponseError) {
        throw err;
      }
      throw new RecordingBridgeError(
        err instanceof Error ? err.message : String(err),
        err,
      );
    }
  }

  async reconcileState(): Promise<PhoneRecordingState> {
    return this.getState();
  }

  async exportRecording(
    options: PhoneRecordingExportOptions = {},
  ): Promise<PhoneRecordingExportResult> {
    if (!this.bridge) {
      throw new RecordingUnavailableError();
    }

    if (this.inFlightCommand !== null) {
      throw new RecordingCommandConflictError(
        `Cannot export recording: command '${this.inFlightCommand}' is in flight`,
      );
    }

    this.inFlightCommand = 'export';
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const activityId = options.activityId ?? this.confirmedSession?.activityId;

    try {
      const raw = await this.executeWithTimeout(
        'export',
        () => this.bridge!.exportRecording(activityId ? {activityId} : {}),
        timeoutMs,
      );

      return normalizeExportResult(raw);
    } catch (err) {
      if (err instanceof RecordingTimeoutError || err instanceof InvalidRecordingResponseError) {
        throw err;
      }
      throw new RecordingBridgeError(
        err instanceof Error ? err.message : String(err),
        err,
      );
    } finally {
      this.inFlightCommand = null;
    }
  }

  async getLocationPermissionStatus(): Promise<string> {
    if (!this.bridge) {
      throw new RecordingUnavailableError();
    }
    if (!this.bridge.getLocationPermissionStatus) {
      return 'undetermined';
    }
    return this.bridge.getLocationPermissionStatus();
  }

  async requestLocationPermission(): Promise<string> {
    if (!this.bridge) {
      throw new RecordingUnavailableError();
    }
    if (!this.bridge.requestLocationPermission) {
      return 'undetermined';
    }
    return this.bridge.requestLocationPermission();
  }

  async getBatteryLevel(): Promise<number | null> {
    if (!this.bridge?.getBatteryLevel) {
      return null;
    }
    return this.bridge.getBatteryLevel();
  }

  async getPhoneHardwareProfile(): Promise<PhoneHardwareProfile> {
    if (!this.bridge?.getPhoneHardwareProfile) {
      return {};
    }
    return this.bridge.getPhoneHardwareProfile();
  }

  onUpdate(listener: (projection: PhoneRecordingProjection) => void): () => void {
    if (!this.emitter) {
      return () => undefined;
    }
    const subscription = this.emitter.addListener(
      'onRecordingUpdate',
      payload => listener(payload as PhoneRecordingProjection),
    );
    return () => subscription.remove();
  }
}

