/**
 * @format
 */

import { AppRegistry } from 'react-native';
import React from 'react';
import App from './App';
import {
  remusTelemetry,
  remusTelemetryCollectionControl,
} from './src/observability/firebaseTelemetry';
import { remusDiagnosticJournal } from './src/observability/sqliteDiagnosticJournal';
import { name as appName } from './app.json';

const RemusRoot = () => React.createElement(App, {
  observability: {
    collectionControl: remusTelemetryCollectionControl,
    diagnostics: remusTelemetry,
    journal: remusDiagnosticJournal,
  },
});

AppRegistry.registerComponent(appName, () => RemusRoot);

// Best effort: telemetry must never block startup.
remusTelemetry.trackAppStarted();
remusDiagnosticJournal.append({name: 'app_started'}).catch(() => undefined);
