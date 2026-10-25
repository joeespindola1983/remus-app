import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {PrimaryButton} from '../../design-system/atoms/PrimaryButton';
import {RemusBatteryStatus} from '../../design-system/atoms/RemusBatteryStatus';
import {RemusConditionStatus} from '../../design-system/atoms/RemusConditionStatus';
import {RemusSourceBadge} from '../../design-system/atoms/RemusSourceBadge';
import {RemusText} from '../../design-system/atoms/RemusText';
import {colors, radius, spacing, type DesignColorMode} from '../../design-system/tokens';
import {t} from '../../i18n';
import {
  PhoneHardwareProfile,
  PhoneRecordingProjection,
} from '../phoneRecordingContracts';
import {PhoneRecordingAdapter} from '../phoneRecordingAdapter';

export interface RecordingPreviewProps {
  mode: DesignColorMode;
  adapter: PhoneRecordingAdapter;
}

export function RecordingPreview({mode, adapter}: RecordingPreviewProps) {
  const theme = colors[mode];
  const [isRecording, setIsRecording] = useState(false);
  const [activityId, setActivityId] = useState<string | undefined>();
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [hardwareProfile, setHardwareProfile] = useState<PhoneHardwareProfile>({});
  const [projection, setProjection] = useState<PhoneRecordingProjection | undefined>();
  const [lastResult, setLastResult] = useState<string>('');
  const [lastError, setLastError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const refreshState = useCallback(async () => {
    try {
      const state = await adapter.getState();
      setIsRecording(state.isRecording);
      setActivityId(state.activityId);

      const perm = await adapter.getLocationPermissionStatus();
      setPermissionStatus(perm);

      const bat = await adapter.getBatteryLevel();
      setBatteryLevel(bat);

      const hw = await adapter.getPhoneHardwareProfile();
      setHardwareProfile(hw);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    }
  }, [adapter]);

  useEffect(() => {
    refreshState();
    const unsubscribe = adapter.onUpdate(p => {
      setProjection(p);
    });
    return () => {
      unsubscribe();
    };
  }, [adapter, refreshState]);

  const handleRequestPermission = async () => {
    setLoading(true);
    setLastError(undefined);
    try {
      const status = await adapter.requestLocationPermission();
      setPermissionStatus(status);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setLastError(undefined);
    try {
      const result = await adapter.start();
      setIsRecording(true);
      setActivityId(result.activityId);
      setLastResult(t('recording.activityId', {id: result.activityId}));
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setLastError(undefined);
    try {
      const manifest = await adapter.stop();
      setIsRecording(false);
      setActivityId(undefined);
      setLastResult(
        `${t('recording.status.idle')} · ${manifest.status} (${manifest.sampleCounts?.phoneMotion ?? 0} motion, ${manifest.sampleCounts?.phoneLocation ?? 0} GPS)`,
      );
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setLastError(undefined);
    try {
      const result = await adapter.exportRecording();
      setLastResult(t('recording.exportSuccess', {path: result.zipPath}));
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async () => {
    setLoading(true);
    setLastError(undefined);
    try {
      const state = await adapter.reconcileState();
      setIsRecording(state.isRecording);
      setActivityId(state.activityId);
      setLastResult(
        `Reconciled: isRecording=${state.isRecording}, activityId=${state.activityId ?? 'none'}`,
      );
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const permissionLabel =
    permissionStatus === 'granted'
      ? t('recording.permission.granted')
      : permissionStatus === 'denied'
      ? t('recording.permission.denied')
      : t('recording.permission.undetermined');

  const statusLabel = isRecording
    ? t('recording.status.recording')
    : adapter.hasUnknownState()
    ? t('recording.status.unknown')
    : t('recording.status.idle');

  const conditionStatus = isRecording
    ? 'best'
    : adapter.hasUnknownState()
    ? 'caution'
    : 'good';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.card, {backgroundColor: theme.surface, borderColor: theme.border}]}>
        <View style={styles.headerRow}>
          <RemusText variant="h2" mode={mode}>
            {t('recording.title')}
          </RemusText>
          <RemusSourceBadge source="phone" mode={mode} />
        </View>

        <View style={styles.statusRow}>
          <RemusText variant="bodyMedium" mode={mode}>
            Status:
          </RemusText>
          <RemusText
            testID="recording-status"
            variant="h4"
            mode={mode}
            tone={isRecording ? 'primary' : 'secondary'}>
            {statusLabel}
          </RemusText>
          <RemusConditionStatus status={conditionStatus} mode={mode} />
        </View>

        {activityId ? (
          <RemusText variant="caption" mode={mode} tone="secondary">
            {t('recording.activityId', {id: activityId})}
          </RemusText>
        ) : null}

        <View style={styles.metricsRow}>
          <RemusText
            testID="recording-permission-status"
            variant="caption"
            mode={mode}
            tone={permissionStatus === 'granted' ? 'primary' : 'secondary'}>
            {t('recording.permission.title')}: {permissionLabel}
          </RemusText>
          {batteryLevel !== null ? (
            <View style={styles.batteryRow}>
              <RemusBatteryStatus
                condition={batteryLevel > 50 ? 'good' : batteryLevel > 20 ? 'low' : 'critical'}
                mode={mode}
              />
              <RemusText variant="small" mode={mode} tone="secondary">
                {t('recording.battery', {level: batteryLevel})}
              </RemusText>
            </View>
          ) : null}
        </View>

        <View style={styles.hardwareRow}>
          {hardwareProfile.hasGps ? (
            <RemusText variant="small" mode={mode} tone="secondary">
              • {t('recording.hardware.gps')}
            </RemusText>
          ) : null}
          {hardwareProfile.hasAccelerometer ? (
            <RemusText variant="small" mode={mode} tone="secondary">
              • {t('recording.hardware.accelerometer')}
            </RemusText>
          ) : null}
          {hardwareProfile.hasGyroscope ? (
            <RemusText variant="small" mode={mode} tone="secondary">
              • {t('recording.hardware.gyroscope')}
            </RemusText>
          ) : null}
        </View>
      </View>

      {isRecording && projection ? (
        <View style={[styles.card, {backgroundColor: theme.surface, borderColor: theme.border}]}>
          <RemusText variant="h3" mode={mode}>
            Telemetria em Tempo Real
          </RemusText>
          <RemusText variant="body" mode={mode}>
            {t('recording.distance', {distance: Math.round(projection.distanceMeters ?? 0)})}
          </RemusText>
          <RemusText variant="body" mode={mode}>
            {t('recording.motionSamples', {count: projection.motionSampleCount})}
          </RemusText>
          <RemusText variant="body" mode={mode}>
            {t('recording.locationSamples', {count: projection.locationSampleCount})}
          </RemusText>
          {projection.groundSpeedMetersPerSecond !== undefined ? (
            <RemusText variant="caption" mode={mode} tone="secondary">
              {t('recording.speed', {speed: projection.groundSpeedMetersPerSecond.toFixed(1)})}
            </RemusText>
          ) : null}
          {projection.horizontalAccuracyMeters !== undefined ? (
            <RemusText variant="caption" mode={mode} tone="secondary">
              {t('recording.accuracy', {accuracy: projection.horizontalAccuracyMeters.toFixed(1)})}
            </RemusText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionsContainer}>
        {permissionStatus !== 'granted' ? (
          <PrimaryButton
            testID="recording-permission-button"
            label={t('recording.permission.request')}
            mode={mode}
            onPress={handleRequestPermission}
            disabled={loading}
          />
        ) : null}

        {!isRecording ? (
          <PrimaryButton
            testID="recording-start-button"
            label={t('recording.start')}
            mode={mode}
            onPress={handleStart}
            disabled={loading}
          />
        ) : (
          <PrimaryButton
            testID="recording-stop-button"
            label={t('recording.stop')}
            mode={mode}
            onPress={handleStop}
            disabled={loading}
          />
        )}

        <PrimaryButton
          testID="recording-export-button"
          label={t('recording.export')}
          mode={mode}
          onPress={handleExport}
          disabled={loading || isRecording}
        />

        <PrimaryButton
          testID="recording-reconcile-button"
          label={t('recording.reconcile')}
          mode={mode}
          onPress={handleReconcile}
          disabled={loading}
        />
      </View>

      {lastResult ? (
        <View style={[styles.resultCard, {backgroundColor: theme.surface, borderColor: theme.border}]}>
          <RemusText testID="recording-last-result" variant="caption" mode={mode}>
            {lastResult}
          </RemusText>
        </View>
      ) : null}

      {lastError ? (
        <View style={[styles.resultCard, {backgroundColor: theme.surface, borderColor: theme.feedbackError}]}>
          <RemusText testID="recording-error" variant="caption" mode={mode} style={[styles.errorText, {color: theme.feedbackError}]}>
            {t('recording.error', {message: lastError})}
          </RemusText>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hardwareRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  resultCard: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  errorText: {
    fontWeight: '500',
  },
});
