/** Provider-independent telemetry boundary. Safe to exercise in unit tests. */
export type RemusEventName = 'remus_app_started';

export interface TelemetrySink {
  logEvent(name: RemusEventName): Promise<void> | void;
  recordError(error: Error): Promise<void> | void;
}

function normalizeError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  return new Error(String(value));
}

export function createTelemetry(sink: TelemetrySink) {
  return {
    /** One event per JavaScript runtime startup, not per foreground transition. */
    async trackAppStarted(): Promise<boolean> {
      try {
        await sink.logEvent('remus_app_started');
        return true;
      } catch {
        // Analytics is non-essential; never interrupt the user.
        return false;
      }
    },
    /** Record a recoverable error without propagating SDK failures. */
    async recordNonFatal(value: unknown): Promise<boolean> {
      try {
        await sink.recordError(normalizeError(value));
        return true;
      } catch {
        return false;
      }
    },
  };
}
