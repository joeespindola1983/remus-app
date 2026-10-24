import {
  colors,
  typographyScale,
  type DesignColorMode,
  type TypographyVariant,
} from '../tokens';

export type RemusTextTone = 'primary' | 'secondary';
export type TextPlatform = 'ios' | 'android' | 'other';

/** Normalize every platform React Native may report to our mobile design contract. */
export function normalizeTextPlatform(os: string): TextPlatform {
  return os === 'ios' || os === 'android' ? os : 'other';
}

/**
 * Pure visual contract: same semantic scale across platforms and modes.
 * On iOS, the system default font is San Francisco (SF Pro).
 */
export function getRemusTextStyle({
  variant,
  mode = 'athleteLight',
  tone = 'primary',
  platform,
}: {
  variant: TypographyVariant;
  mode?: DesignColorMode;
  tone?: RemusTextTone;
  platform: TextPlatform;
}) {
  const scale = typographyScale[variant];
  const palette = colors[mode];

  return {
    fontFamily: platform === 'android' ? 'Roboto' : undefined,
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    fontWeight: scale.fontWeight,
    color: tone === 'secondary' ? palette.secondaryText : palette.text,
  };
}
