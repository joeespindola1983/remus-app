import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  recordError,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';

import {createTelemetry} from './telemetry';
import {createTelemetryCollectionControl} from './telemetryCollectionControl';

export const remusTelemetryCollectionControl = createTelemetryCollectionControl({
  setAnalyticsCollectionEnabled: enabled =>
    setAnalyticsCollectionEnabled(getAnalytics(), enabled),
  setCrashReportingCollectionEnabled: enabled =>
    setCrashlyticsCollectionEnabled(getCrashlytics(), enabled),
}, {analytics: true, crashReporting: true});

/** Firebase integration: no React UI or app-specific rules belong here. */
export const remusTelemetry = createTelemetry({
  logEvent: event => logEvent(getAnalytics(), event.name),
  recordError: error => recordError(getCrashlytics(), error),
}, remusTelemetryCollectionControl.readConsent);
