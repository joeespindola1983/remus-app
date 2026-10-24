import { colors, controlSize, radius, spacing, type DesignColorMode } from '../tokens';

/** Figma: 10 Atoms — Form Controls, Atom/Input (304:10). */
export type RemusInputState = 'default' | 'focused' | 'error' | 'disabled';

export type RemusInputStyleOptions = {
  mode?: DesignColorMode;
  focused?: boolean;
  error?: boolean;
  disabled?: boolean;
};

export function getRemusInputState({
  focused = false,
  error = false,
  disabled = false,
}: RemusInputStyleOptions = {}): RemusInputState {
  if (disabled) return 'disabled';
  if (error) return 'error';
  if (focused) return 'focused';
  return 'default';
}

export function getRemusInputAppearance(options: RemusInputStyleOptions = {}) {
  const palette = colors[options.mode ?? 'athleteLight'];
  const state = getRemusInputState(options);

  const borderColor = state === 'disabled'
    ? palette.disabled
    : state === 'error'
      ? palette.feedbackError
      : state === 'focused'
        ? palette.primary
        : palette.border;

  return {
    height: controlSize.input,
    width: '100%' as const,
    borderRadius: radius.md,
    borderWidth: state === 'focused' || state === 'error' ? 2 : 1,
    borderColor,
    backgroundColor: palette.surface,
    color: palette.text,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    opacity: state === 'disabled' ? 0.55 : 1,
  };
}
