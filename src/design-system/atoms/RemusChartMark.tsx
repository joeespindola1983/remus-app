import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { type DesignColorMode } from '../tokens';
import { chartBarGeometry, chartExamplePath, getChartAppearance, type ChartMarkKind } from './remusChartCaptureStyle';

export type RemusChartMarkProps = { kind: ChartMarkKind; mode?: DesignColorMode; testID?: string };

/** Figma 337:22. Static visual specimens; chart molecules will bind actual telemetry. */
export function RemusChartMark({ kind, mode = 'athleteLight', testID }: RemusChartMarkProps) {
  const c = getChartAppearance(mode);
  return (
    <Svg width={220} height={96} viewBox="0 0 220 96" testID={testID}>
      {kind === 'area' && (
        <Path d={`${chartExamplePath}V80H16V64Z`} fill={c.primary} opacity={0.16} />
      )}
      {(kind === 'line' || kind === 'area' || kind === 'historical' || kind === 'secondary') && (
        <Path d={chartExamplePath} fill="none"
          stroke={kind === 'historical' ? c.historical : kind === 'secondary' ? c.secondary : c.primary}
          strokeWidth={kind === 'secondary' ? 2 : 3} strokeLinecap="round"
          strokeDasharray={kind === 'historical' ? '5 7' : undefined}
          opacity={kind === 'secondary' ? 0.62 : 1} />
      )}
      {kind === 'bar' && chartBarGeometry.map((bar, i) => (
        <Rect key={bar.x} x={bar.x} y={bar.y} width={bar.width} height={bar.height}
          rx={5} fill={c.primary} opacity={i === chartBarGeometry.length - 1 ? 1 : 0.62} />
      ))}
      {kind === 'range' && (
        <>
          <Rect x={16} y={28} width={188} height={40} rx={10} fill={c.primary} opacity={0.14} />
          <Rect x={16} y={47} width={188} height={2} fill={c.primary} />
        </>
      )}
    </Svg>
  );
}
