/** Provider-independent observability boundary. Safe to exercise without an SDK. */
export type RemusTelemetryEvent = Readonly<{
  name: 'remus_app_started' | 'remus_qa_observability_probe';
}>;

export type TelemetryCollectionConsent = Readonly<{
  analytics: boolean;
  crashReporting: boolean;
}>;

export type ReadTelemetryCollectionConsent = () => TelemetryCollectionConsent;

export interface TelemetrySink {
  logEvent(event: RemusTelemetryEvent): Promise<void> | void;
  recordError(error: Error): Promise<void> | void;
}

const collectionEnabled: TelemetryCollectionConsent = {
  analytics: true,
  crashReporting: true,
};

const readEnabledCollection = () => collectionEnabled;

function normalizeError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  return new Error(String(value));
}

function collectionAllowed(
  readConsent: ReadTelemetryCollectionConsent,
  channel: keyof TelemetryCollectionConsent,
): boolean {
  try {
    return readConsent()[channel] === true;
  } catch {
    // Missing or corrupted preferences must never opt a user into collection.
    return false;
  }
}

export function createTelemetry(
  sink: TelemetrySink,
  readConsent: ReadTelemetryCollectionConsent = readEnabledCollection,
) {
  const trackEvent = async (event: RemusTelemetryEvent): Promise<boolean> => {
    if (!collectionAllowed(readConsent, 'analytics')) {return false;}
    try {
      await sink.logEvent(event);
      return true;
    } catch {
      // Analytics is non-essential; never interrupt the user.
      return false;
    }
  };

  return {
    trackEvent,
    /** One event per JavaScript runtime startup, not per foreground transition. */
    trackAppStarted: () => trackEvent({name: 'remus_app_started'}),
    /** Record a recoverable error without propagating SDK failures. */
    async recordNonFatal(value: unknown): Promise<boolean> {
      if (!collectionAllowed(readConsent, 'crashReporting')) {return false;}
      try {
        await sink.recordError(normalizeError(value));
        return true;
      } catch {
        return false;
      }
    },
  };
}
