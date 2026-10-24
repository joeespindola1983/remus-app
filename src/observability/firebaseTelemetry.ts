import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getCrashlytics, recordError} from '@react-native-firebase/crashlytics';

import {createTelemetry} from './telemetry';

/** Firebase integration: no React UI or app-specific rules belong here. */
export const remusTelemetry = createTelemetry({
  logEvent: event => logEvent(getAnalytics(), event.name),
  recordError: error => recordError(getCrashlytics(), error),
});
