export const PHONE_PRIMARY_SOURCE_ID = 'phone:primary' as const;

export interface PhoneHardwareProfile {
  hasGps?: boolean;
  hasAccelerometer?: boolean;
  hasGyroscope?: boolean;
  hasMagnetometer?: boolean;
  hasBarometer?: boolean;
}

export interface PhoneRecordingProjection {
  elapsedSeconds: number;
  motionSampleCount: number;
  locationSampleCount: number;
  distanceMeters?: number;
  groundSpeedMetersPerSecond?: number;
  horizontalAccuracyMeters?: number;
  accelerationIncludingGravityG?: number;
  speedAccuracyMetersPerSecond?: number;
  courseAccuracyDegrees?: number;
  courseDegrees?: number;
  locationFreshnessMs?: number;
}

export interface NativePhoneRecordingBridge {
  startRecording(options: {sourceIds: string[]}): Promise<unknown>;
  stopRecording(): Promise<unknown>;
  getRecordingState(): Promise<unknown>;
  exportRecording(options?: {activityId?: string}): Promise<unknown>;
  prepareExport?(options?: {activityId?: string}): Promise<{zipPath: string; byteLength: number}>;
  listRecordings?(): Promise<unknown[]>;
  finalizeRecording?(options: {activityId: string}): Promise<unknown>;
  deleteRecording?(activityId: string): Promise<boolean>;
  requestLocationPermission?(): Promise<string>;
  getLocationPermissionStatus?(): Promise<string>;
  getBatteryLevel?(): Promise<number | null>;
  getPhoneHardwareProfile?(): Promise<PhoneHardwareProfile>;
  getCurrentLocationAccuracy?(): Promise<number | null>;
  recordSourceLifecycleEvent?(options: {
    sourceId: string;
    event: string;
    reason?: string;
    elapsedSeconds: number;
  }): Promise<boolean>;
  addListener?(eventName: string): void;
  removeListeners?(count: number): void;
}

export interface PhoneRecordingStartOptions {
  sourceIds?: string[];
  timeoutMs?: number;
}

export interface PhoneRecordingStopOptions {
  timeoutMs?: number;
}

export interface PhoneRecordingExportOptions {
  activityId?: string;
  timeoutMs?: number;
}

export interface PhoneRecordingStartResult {
  activityId: string;
  activityCorrelationId: string;
  artifactDirectory: string;
  recordingIdsBySource: Record<string, string>;
}

export interface PhoneRecordingState {
  isRecording: boolean;
  activityId?: string;
  artifactDirectory?: string;
  startedAtEpochMilliseconds?: number;
  sampleCounts?: Record<string, number>;
  hasWriteFailure?: boolean;
}

export type PhoneRecordingStatus = 'recording' | 'finalized' | 'interrupted';

export interface PhoneRecordingManifest {
  schemaVersion?: string;
  producer?: string;
  activityId: string;
  activityCorrelationId?: string;
  status: PhoneRecordingStatus;
  startedAtEpochMilliseconds: number;
  endedAtEpochMilliseconds?: number;
  artifactDirectory: string;
  recordingIdsBySource?: Record<string, string>;
  sampleCounts?: Record<string, number>;
  failureMessage?: string;
}

export interface PhoneRecordingExportResult {
  zipPath: string;
  shared: boolean;
}
