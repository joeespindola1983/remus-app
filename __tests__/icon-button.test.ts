import {
  createIconButtonInteraction,
  getIconButtonAppearance,
  iconButtonSizes,
} from '../src/design-system/atoms/iconButtonStyle';

describe('Icon Button contract — Figma 07 Atoms (97:2)', () => {
  it('preserves all four dimensions and the circular/filled distinction', () => {
    expect(iconButtonSizes).toEqual({ small: 40, medium: 50, large: 56, workout: 72 });
    for (const size of ['small', 'medium', 'large'] as const) {
      const view = getIconButtonAppearance({ size });
      expect(view.width).toBe(iconButtonSizes[size]);
      expect(view.height).toBe(iconButtonSizes[size]);
      expect(view.borderWidth).toBe(2);
      expect(view.borderRadius).toBe(9999);
      expect(view.backgroundColor).toBe('transparent');
      expect(view.iconSize).toBe(32);
    }
    const workout = getIconButtonAppearance({ size: 'workout', mode: 'athleteLight' });
    expect(workout.width).toBe(72);
    expect(workout.borderWidth).toBe(0);
    expect(workout.backgroundColor).toBe('#3B82F6');
    expect(workout.iconColor).toBe('#FFFFFF');
    const neutralWorkout = getIconButtonAppearance({ size: 'workout', variant: 'neutral' });
    expect(neutralWorkout.backgroundColor).toBe('#0EA5E9');
    expect(neutralWorkout.iconColor).toBe('#111827');
    for (const mode of ['athleteLight', 'athleteDark', 'adminLight', 'adminDark'] as const) {
      for (const disabled of [false, true]) {
        const state = getIconButtonAppearance({ size: 'workout', variant: 'neutral', mode, disabled });
        expect(state.iconColor).toBe('#111827');
      }
    }
  });

  it('distinguishes neutral/primary semantics in both Athlete themes', () => {
    expect(getIconButtonAppearance({ variant: 'neutral' }).borderColor).toBe('#0EA5E9');
    expect(getIconButtonAppearance({ variant: 'primary' }).borderColor).toBe('#3B82F6');
    expect(getIconButtonAppearance({ variant: 'neutral', mode: 'athleteDark' }).iconColor).toBe('#38BDF8');
    expect(getIconButtonAppearance({ variant: 'primary', mode: 'athleteDark' }).iconColor).toBe('#60A5FA');
    expect(getIconButtonAppearance({ variant: 'primary', pressed: true }).borderColor).toBe('#1D4ED8');
    expect(getIconButtonAppearance({ variant: 'primary', pressed: true }).opacity).toBe(0.86);
  });

  it('uses the disabled token, lowers opacity and prevents actions', () => {
    const appearance = getIconButtonAppearance({ disabled: true });
    expect(appearance.borderColor).toBe('#D1D5DB');
    expect(appearance.iconColor).toBe('#D1D5DB');
    expect(appearance.opacity).toBe(0.42);

    const onPress = jest.fn();
    const disabled = createIconButtonInteraction({
      accessibilityLabel: 'Excluir treino',
      disabled: true,
      onPress,
    });
    expect(disabled.accessibilityRole).toBe('button');
    expect(disabled.accessibilityLabel).toBe('Excluir treino');
    expect(disabled.accessibilityState).toEqual({ disabled: true });
    expect(disabled.onPress).toBeUndefined();
    disabled.onPress?.();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes the accessible action when enabled', () => {
    const onPress = jest.fn();
    const active = createIconButtonInteraction({
      accessibilityLabel: 'Iniciar atividade',
      onPress,
    });
    expect(active.disabled).toBe(false);
    expect(active.accessibilityLabel).toBe('Iniciar atividade');
    active.onPress?.();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
