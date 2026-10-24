import React from 'react';
import Svg, { Line, Rect } from 'react-native-svg';
import { type DesignColorMode } from '../tokens';
import { getChartAppearance, type ChartRuleKind } from './remusChartCaptureStyle';

export type RemusChartRuleProps = { kind: ChartRuleKind; mode?: DesignColorMode; testID?: string };

/** Figma 337:31. 220×44 reference geometry; drawing only, not chart scaling. */
export function RemusChartRule({ kind, mode = 'athleteLight', testID }: RemusChartRuleProps) {
  const c = getChartAppearance(mode);
  return (
    <Svg width={220} height={44} viewBox="0 0 220 44" testID={testID}>
      {kind === 'threshold' ? (
        <Rect x={16} y={8} width={188} height={28} rx={8} fill={c.threshold} opacity={0.14} />
      ) : (
        <Line x1={16} x2={204} y1={kind === 'selection' ? 21 : 21.5}
          y2={kind === 'selection' ? 21 : 21.5}
          stroke={kind === 'grid' ? c.grid : kind === 'reference' ? c.historical : c.primary}
          strokeWidth={kind === 'selection' ? 2 : 1}
          strokeDasharray={kind === 'reference' ? '5 5' : undefined}
          opacity={kind === 'grid' ? 0.55 : 0.85} />
      )}
    </Svg>
  );
}
