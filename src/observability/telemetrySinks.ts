import {type RemusTelemetryEvent, type TelemetrySink} from './telemetry';

/** SDK-free adapter for development paths where collection is intentionally absent. */
export const noOpTelemetrySink: TelemetrySink = {
  logEvent: () => undefined,
  recordError: () => undefined,
};

/** Inspectable adapter for deterministic tests and the future QA diagnostics screen. */
export interface InMemoryTelemetrySink extends TelemetrySink {
  readonly events: RemusTelemetryEvent[];
  readonly errors: Error[];
}

export function createInMemoryTelemetrySink(): InMemoryTelemetrySink {
  const events: RemusTelemetryEvent[] = [];
  const errors: Error[] = [];
  return {
    events,
    errors,
    logEvent: event => {events.push(event);},
    recordError: error => {errors.push(error);},
  };
}
