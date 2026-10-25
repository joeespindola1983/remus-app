import { colors, type DesignColorMode } from '../tokens';

/**
 * Exact SVG path geometry from Figma — 05 Atoms / Iconography (46:2).
 * All sources are 32×32, stroke-linecap=round, stroke-linejoin=round.
 * Source component IDs are retained to make visual audits reproducible.
 */
export const remusIconGeometry = {
  home: {
    figmaNodeId: '257:206',
    path: 'M5 14.5L16 5L27 14.5V27H19.5V19H12.5V27H5V14.5Z',
    strokeWidth: 2.5,
  },
  chevronRight: {
    figmaNodeId: '176:330',
    path: 'M12 6.66666L21.3333 16L12 25.3333',
    strokeWidth: 2.66667,
  },
  close: {
    figmaNodeId: '176:334',
    path: 'M8 8L24 24M24 8L8 24',
    strokeWidth: 2.66667,
  },
  plus: {
    figmaNodeId: '176:342',
    path: 'M16.0001 6.66666V25.3333M6.66675 16H25.3334',
    strokeWidth: 2.66667,
  },
  check: {
    figmaNodeId: '176:338',
    path: 'M6.66663 16.6667L12.6666 22.6667L25.3333 10',
    strokeWidth: 2.66667,
  },
  start: {
    figmaNodeId: '176:405',
    path: 'M9.33337 5.33325L25.3334 15.9999L9.33337 26.6666V5.33325Z',
    strokeWidth: 2.66667,
  },
  pause: {
    figmaNodeId: '176:409',
    path: 'M10.6666 6.66675V25.3334M21.3333 6.66675V25.3334',
    strokeWidth: 2.66667,
  },
  loading: {
    figmaNodeId: '176:387',
    path: 'M26.6667 16C26.6667 18.1096 26.0411 20.1719 24.8691 21.9261C23.697 23.6802 22.0311 25.0474 20.082 25.8547C18.1329 26.662 15.9882 26.8733 13.9191 26.4617C11.85 26.0501 9.94933 25.0342 8.45757 23.5425C6.96581 22.0507 5.94991 20.1501 5.53834 18.0809C5.12676 16.0118 5.338 13.8671 6.14533 11.918C6.95267 9.96895 8.31984 8.30304 10.074 7.13097C11.8281 5.9589 13.8904 5.33331 16 5.33331',
    strokeWidth: 2.66667,
  },
  stop: {
    figmaNodeId: '176:417',
    path: 'M24 8H8V24H24V8Z',
    strokeWidth: 2.66667,
  },
} as const;

export type RemusIconName = keyof typeof remusIconGeometry;
export type RemusIconTone = 'primary' | 'secondary' | 'inverse';

export function getRemusIconDefinition({
  name,
  mode = 'athleteLight',
  tone = 'primary',
}: {
  name: RemusIconName;
  mode?: DesignColorMode;
  tone?: RemusIconTone;
}) {
  const geometry = remusIconGeometry[name];
  const palette = colors[mode];
  const color = tone === 'primary'
    ? palette.primary
    : tone === 'secondary'
      ? palette.accent
      : palette.background;

  return {
    path: geometry.path,
    strokeWidth: geometry.strokeWidth,
    color,
  };
}
