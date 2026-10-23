/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import {remusTelemetry} from './src/observability/firebaseTelemetry';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Best effort: telemetry must never block startup.
remusTelemetry.trackAppStarted();
