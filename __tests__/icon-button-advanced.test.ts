import {
  createIconButtonInteraction,
  getIconButtonAppearance,
  iconButtonSizes,
} from '../src/design-system/atoms/iconButtonStyle';
import { getRemusIconDefinition, remusIconGeometry } from '../src/design-system/atoms/remusIconDefinition';
import { colors } from '../src/design-system/tokens';

describe('Icon Button advanced — Figma 07 Atoms (97:2)', () => {
  it('matches the literal Figma Color collection for warning/destructive in Light and Dark', () => {
    expect(colors.athleteLight.warning).toBe('#F59E0B');
    expect(colors.athleteLight.warningPressed).toBe('#78350F');
    expect(colors.athleteLight.destructive).toBe('#EF4444');
    expect(colors.athleteLight.destructivePressed).toBe('#B91C1C');
    expect(colors.athleteDark.warning).toBe('#FBBF24');
    expect(colors.athleteDark.warningPressed).toBe('#F59E0B');
    expect(colors.athleteDark.destructive).toBe('#F87171');
    expect(colors.athleteDark.destructivePressed).toBe('#DC2626');
    expect(colors.athleteLight.onWarningPressed).toBe('#FFFFFF');
    expect(colors.athleteDark.onWarningPressed).toBe('#111827');
  });

  it('uses semantic warning and destructive default/pressed colors in each mode', () => {
    for (const mode of ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const) {
      const palette = colors[mode];
      const warning = getIconButtonAppearance({ variant: 'warning', mode });
      const warningPressed = getIconButtonAppearance({ variant: 'warning', mode, pressed: true });
      const destructive = getIconButtonAppearance({ variant: 'destructive', mode });
      const destructivePressed = getIconButtonAppearance({ variant: 'destructive', mode, pressed: true });
      expect(warning.borderColor).toBe(palette.warning);
      expect(warningPressed.borderColor).toBe(palette.warningPressed);
      expect(destructive.borderColor).toBe(palette.destructive);
      expect(destructivePressed.borderColor).toBe(palette.destructivePressed);
      for (const appearance of [warning, warningPressed, destructive, destructivePressed]) {
        expect(appearance.backgroundColor).toBe('transparent');
        expect(appearance.iconColor).toBe(appearance.borderColor);
      }
    }
  });

  it('uses on-colors for filled workout actions, including pressed warning', () => {
    for (const mode of ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const) {
      const palette = colors[mode];
      const warning = getIconButtonAppearance({ size: 'workout', variant: 'warning', mode });
      expect(warning.backgroundColor).toBe(palette.warning);
      expect(warning.iconColor).toBe(palette.onWarning);
      const pressed = getIconButtonAppearance({ size: 'workout', variant: 'warning', mode, pressed: true });
      expect(pressed.backgroundColor).toBe(palette.warningPressed);
      expect(pressed.iconColor).toBe(palette.onWarningPressed);
      const destructive = getIconButtonAppearance({ size: 'workout', variant: 'destructive', mode });
      expect(destructive.backgroundColor).toBe(palette.destructive);
      expect(destructive.iconColor).toBe(palette.onDestructive);
      expect(destructive.borderWidth).toBe(0);
      expect(destructive.width).toBe(iconButtonSizes.workout);
    }
  });

  it('keeps disabled semantic colors and disallows press interactions while loading', () => {
    const disabled = getIconButtonAppearance({ variant: 'destructive', disabled: true });
    expect(disabled.borderColor).toBe(colors.athleteLight.disabled);
    expect(disabled.opacity).toBe(0.42);
    const onPress = jest.fn();
    const loading = createIconButtonInteraction({
      accessibilityLabel: 'Finalizando treino',
      loading: true,
      onPress,
    });
    expect(loading.accessibilityState).toEqual({ disabled: true, busy: true });
    expect(loading.accessibilityRole).toBe('button');
    expect(loading.disabled).toBe(true);
    expect(loading.onPress).toBeUndefined();
    loading.onPress?.();
    expect(onPress).not.toHaveBeenCalled();
    const busyAndDisabled = createIconButtonInteraction({
      accessibilityLabel: 'Finalizando treino',
      loading: true,
      disabled: true,
      onPress,
    });
    expect(busyAndDisabled.onPress).toBeUndefined();
  });

  it('preserves the original default interaction contract', () => {
    const onPress = jest.fn();
    const active = createIconButtonInteraction({ accessibilityLabel: 'Iniciar', onPress });
    expect(active.accessibilityState).toEqual({ disabled: false });
    expect(active.disabled).toBe(false);
    active.onPress?.();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the exact Figma loading vector instead of a platform-specific spinner', () => {
    expect(remusIconGeometry.loading.figmaNodeId).toBe('176:387');
    expect(remusIconGeometry.loading.strokeWidth).toBe(2.66667);
    expect(getRemusIconDefinition({ name: 'loading' }).path).toBe(remusIconGeometry.loading.path);
  });
});
