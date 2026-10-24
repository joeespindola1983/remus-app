import React, { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { colors, type DesignColorMode } from '../tokens';
import { getRemusInputAppearance } from './remusInputStyle';

export type RemusInputProps = TextInputProps & {
  mode?: DesignColorMode;
  error?: boolean;
  disabled?: boolean;
};

/**
 * Single-line, controlled/uncontrolled native input.
 * Labels and validation messages belong to a later Field molecule.
 * Figma: 10 Atoms — Form Controls, Atom/Input (304:10).
 */
export function RemusInput({
  mode = 'athleteLight',
  error = false,
  disabled = false,
  editable = true,
  onFocus,
  onBlur,
  style,
  ...inputProps
}: RemusInputProps) {
  const [focused, setFocused] = useState(false);
  const canEdit = editable && !disabled;

  return (
    <TextInput
      {...inputProps}
      multiline={false}
      editable={canEdit}
      underlineColorAndroid="transparent"
      placeholderTextColor={disabled || !canEdit ? colors[mode].text : colors[mode].secondaryText}
      accessibilityState={{ disabled: !canEdit }}
      onFocus={event => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={event => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[getRemusInputAppearance({ mode, focused, error, disabled: !canEdit }), style]}
    />
  );
}
