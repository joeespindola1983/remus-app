import {
  getRemusInputAppearance,
  getRemusInputState,
} from '../src/design-system/atoms/remusInputStyle';
import { colors, controlSize, radius, spacing } from '../src/design-system/tokens';

describe('Remus Input — Figma 10 Atoms (304:10)', () => {
  it('has a 48 px canvas, 8 px radius, 16 px padding and default outline', () => {
    const appearance = getRemusInputAppearance();
    expect(controlSize.input).toBe(48);
    expect(appearance.height).toBe(48);
    expect(appearance.borderRadius).toBe(radius.md);
    expect(appearance.paddingHorizontal).toBe(spacing.md);
    expect(appearance.borderWidth).toBe(1);
    expect(appearance.borderColor).toBe(colors.athleteLight.border);
    expect(appearance.backgroundColor).toBe(colors.athleteLight.surface);
    expect(appearance.fontSize).toBe(16);
  });

  it('resolves focus and error semantic colors, error taking precedence', () => {
    for (const mode of ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const) {
      const focused = getRemusInputAppearance({ mode, focused: true });
      expect(focused.borderWidth).toBe(2);
      expect(focused.borderColor).toBe(colors[mode].primary);
      const error = getRemusInputAppearance({ mode, focused: true, error: true });
      expect(error.borderWidth).toBe(2);
      expect(error.borderColor).toBe(colors[mode].feedbackError);
      expect(getRemusInputState({ focused: true, error: true })).toBe('error');
    }
  });

  it('disables field state before focus/error and uses Figma 55% opacity', () => {
    expect(getRemusInputState({ disabled: true, error: true, focused: true })).toBe('disabled');
    for (const mode of ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const) {
      const appearance = getRemusInputAppearance({ mode, disabled: true, focused: true, error: true });
      expect(appearance.opacity).toBe(0.55);
      expect(appearance.borderWidth).toBe(1);
      expect(appearance.borderColor).toBe(colors[mode].disabled);
    }
  });

  it('keeps exact Figma error/focus tokens in both athlete themes', () => {
    expect(colors.athleteLight.feedbackError).toBe('#EF4444');
    expect(colors.athleteDark.feedbackError).toBe('#F87171');
    expect(getRemusInputAppearance({ mode: 'athleteLight', focused: true }).borderColor).toBe('#3B82F6');
    expect(getRemusInputAppearance({ mode: 'athleteDark', focused: true }).borderColor).toBe('#60A5FA');
  });
});
