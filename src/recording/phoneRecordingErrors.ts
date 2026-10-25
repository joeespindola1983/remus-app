export class RecordingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecordingError';
  }
}

export class RecordingUnavailableError extends RecordingError {
  constructor(message = 'Native recording bridge is unavailable') {
    super(message);
    this.name = 'RecordingUnavailableError';
  }
}

export class RecordingCommandConflictError extends RecordingError {
  constructor(message: string) {
    super(message);
    this.name = 'RecordingCommandConflictError';
  }
}

export class RecordingTimeoutError extends RecordingError {
  readonly command: 'start' | 'stop' | 'export' | 'state';
  readonly timeoutMs: number;

  constructor(command: 'start' | 'stop' | 'export' | 'state', timeoutMs: number) {
    super(`Recording command '${command}' timed out after ${timeoutMs}ms; state is indeterminate`);
    this.name = 'RecordingTimeoutError';
    this.command = command;
    this.timeoutMs = timeoutMs;
  }
}

export class InvalidRecordingResponseError extends RecordingError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRecordingResponseError';
  }
}

export class RecordingBridgeError extends RecordingError {
  readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'RecordingBridgeError';
    this.originalError = originalError;
  }
}
