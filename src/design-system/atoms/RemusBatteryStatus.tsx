import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { type DesignColorMode } from '../tokens';
import { getBatteryAppearance, type BatteryCondition } from './remusChartCaptureStyle';

const labels: Record<BatteryCondition, string> = {
  good: 'Bateria em bom estado', low: 'Bateria baixa',
  critical: 'Bateria crítica', unknown: 'Estado da bateria desconhecido',
};

/** Figma 538:21; presents a source-reported condition; never guesses remaining time. */
export function RemusBatteryStatus({ condition, mode = 'athleteLight', testID }:
  { condition: BatteryCondition; mode?: DesignColorMode; testID?: string }) {
  const { color, levelWidth } = getBatteryAppearance(condition, mode);
  return (
    <Svg width={26} height={16} viewBox="0 0 26 16" testID={testID}
      accessible accessibilityRole="image" accessibilityLabel={labels[condition]}>
      <Rect x={0.75} y={1} width={20.5} height={14} rx={3} fill="none"
        stroke={color} strokeWidth={1.5} />
      <Rect x={23} y={5} width={3} height={6} rx={1} fill={color} />
      {levelWidth > 0 ? (
        <Rect x={3} y={4} width={levelWidth} height={8} rx={1.5} fill={color} />
      ) : (
        <Rect x={5} y={7} width={10} height={2} rx={1} fill={color} />
      )}
    </Svg>
  );
}
