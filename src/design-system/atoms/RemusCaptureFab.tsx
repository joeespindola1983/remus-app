import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type DesignColorMode } from '../tokens';
import { createCaptureFabInteraction, getCaptureFabAppearance, type CaptureAction } from './remusChartCaptureStyle';

export type RemusCaptureFabProps = {
  action: CaptureAction;
  accessibilityLabel: string;
  mode?: DesignColorMode;
  disabled?: boolean;
  onPress?: () => void;
  testID?: string;
};

/** Figma 548:14119. Visual action only; recording is controlled by its parent. */
export function RemusCaptureFab({ action, accessibilityLabel, mode = 'athleteLight',
  disabled = false, onPress, testID }: RemusCaptureFabProps) {
  const a = getCaptureFabAppearance(action, mode);
  const interaction = createCaptureFabInteraction({ action, accessibilityLabel, disabled, onPress });
  return (
    <Pressable {...interaction} testID={testID}
      style={[styles.control, {
        borderWidth: a.borderWidth, borderColor: a.borderColor,
        backgroundColor: a.backgroundColor,
      }, disabled && styles.disabled]}>
      {action === 'pause' ? (
        <View style={styles.pauseRow}>
          <View style={[styles.pauseBar, { backgroundColor: a.symbolColor }]} />
          <View style={[styles.pauseBar, { backgroundColor: a.symbolColor }]} />
        </View>
      ) : (
        <View style={[styles.stop, { backgroundColor: a.symbolColor }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  pauseRow: { flexDirection: 'row', gap: 6 },
  pauseBar: { width: 6, height: 24, borderRadius: 2 },
  stop: { width: 22, height: 22, borderRadius: 5 },
});
