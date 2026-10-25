export const PHONE_PRIMARY_SOURCE_ID = 'phone:primary' as const;

export interface NativePhoneRecordingBridge {
  startRecording(options: {sourceIds: string[]}): Promise<unknown>;
  stopRecording(): Promise<unknown>;
  getRecordingState(): Promise<unknown>;
  exportRecording(options?: {activityId?: string}): Promise<unknown>;
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
