import { createPrimaryButtonInteraction } from '../src/design-system/atoms/primaryButtonInteraction';
import { colors, controlSize, radius, spacing } from '../src/design-system/tokens';

describe('Remus foundations (Figma contract)', () => {
  it('preserves measured dimension tokens', () => {
    expect(spacing).toMatchObject({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 });
    expect(radius.lg).toBe(12);
    expect(controlSize).toMatchObject({ small: 40, medium: 50, large: 56, minimumTouch: 48 });
  });

  it('preserves primary semantic colors per design mode', () => {
    expect(colors.athleteLight.primary).toBe('#3B82F6');
    expect(colors.athleteDark.primary).toBe('#60A5FA');
    expect(colors.adminLight.primary).toBe('#DC2626');
    expect(colors.adminDark.primary).toBe('#FCA5A5');
  });
});

describe('PrimaryButton interaction contract (used by the native Pressable)', () => {
  it('exposes an accessible button and forwards the action when enabled', () => {
    const onPress = jest.fn();
    const button = createPrimaryButtonInteraction({
      label: 'Start activity',
      disabled: false,
      onPress,
    });

    expect(button.accessibilityRole).toBe('button');
    expect(button.accessibilityLabel).toBe('Start activity');
    expect(button.accessibilityState).toEqual({ disabled: false });
    expect(button.disabled).toBe(false);
    expect(button.onPress).toBe(onPress);

    button.onPress?.();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not bind the action when disabled', () => {
    const onPress = jest.fn();
    const button = createPrimaryButtonInteraction({
      label: 'Disabled',
      disabled: true,
      onPress,
    });

    expect(button.accessibilityRole).toBe('button');
    expect(button.accessibilityState).toEqual({ disabled: true });
    expect(button.disabled).toBe(true);
    expect(button.onPress).toBeUndefined();
    expect(onPress).not.toHaveBeenCalled();
  });
});
