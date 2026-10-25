import {type TelemetryCollectionConsent} from './telemetry';

export interface TelemetryCollectionAdapter {
  setAnalyticsCollectionEnabled(enabled: boolean): Promise<unknown>;
  setCrashReportingCollectionEnabled(enabled: boolean): Promise<unknown>;
}

export type TelemetryCollectionApplyStatus = 'applied' | 'failed';

export type TelemetryCollectionResult = Readonly<{
  requested: TelemetryCollectionConsent;
  effective: TelemetryCollectionConsent;
  analytics: TelemetryCollectionApplyStatus;
  crashReporting: TelemetryCollectionApplyStatus;
}>;

const collectionDisabled: TelemetryCollectionConsent = {
  analytics: false,
  crashReporting: false,
};

/** Coordinates application gating with SDK collection switches.
 * Collection remains blocked while native settings are being applied and after failures.
 */
export function createTelemetryCollectionControl(
  adapter: TelemetryCollectionAdapter,
  initial: TelemetryCollectionConsent = collectionDisabled,
) {
  let effective = initial;
  let revision = 0;

  return {
    readConsent: (): TelemetryCollectionConsent => effective,
    async applyConsent(requested: TelemetryCollectionConsent): Promise<TelemetryCollectionResult> {
      const operationRevision = ++revision;
      effective = collectionDisabled;
      const [analyticsResult, crashResult] = await Promise.allSettled([
        Promise.resolve().then(() => adapter.setAnalyticsCollectionEnabled(requested.analytics)),
        Promise.resolve().then(() => adapter.setCrashReportingCollectionEnabled(requested.crashReporting)),
      ]);
      const result: TelemetryCollectionResult = {
        requested,
        effective: {
          analytics: requested.analytics && analyticsResult.status === 'fulfilled',
          crashReporting: requested.crashReporting && crashResult.status === 'fulfilled',
        },
        analytics: analyticsResult.status === 'fulfilled' ? 'applied' : 'failed',
        crashReporting: crashResult.status === 'fulfilled' ? 'applied' : 'failed',
      };
      if (operationRevision === revision) {effective = result.effective;}
      return result;
    },
  };
}

export type TelemetryCollectionControl = ReturnType<typeof createTelemetryCollectionControl>;
