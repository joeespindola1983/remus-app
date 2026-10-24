/**
 * Remus Design System foundations.
 * Figma: J9mlZzajI8meLd5KQYg4KB
 * Sources: Color (20:3), Typography (20:4), Dimension (20:5).
 * Values in dp/pt; React Native uses density-independent layout units.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  x2l: 48,
  x3l: 64,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const controlSize = {
  small: 40,
  medium: 50,
  large: 56,
  minimumTouch: 48,
} as const;

export const stroke = { default: 1, emphasis: 2 } as const;

export const typography = {
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 14, lineHeight: 20 },
  small: { fontSize: 12, lineHeight: 16 },
  button: {
    small: 14,
    medium: 16,
    large: 18,
    fontWeight: '600' as const,
  },
} as const;

/**
 * Semantic text styles from Figma: 03 Foundations — Typography (20:4).
 * iOS uses its native SF Pro system font; Android uses Roboto.
 */
export const typographyScale = {
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  h4: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  small: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const;

export type TypographyVariant = keyof typeof typographyScale;

// Semantic mode values are resolved from the Figma Color collection.
// Use semantic tokens in components; avoid hardcoded primitive colors.
export const colors = {
  athleteLight: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111827',
    secondaryText: '#6B7280',
    border: '#E5E7EB',
    primary: '#3B82F6',
    primaryPressed: '#1D4ED8',
    accent: '#0EA5E9',
    warning: '#F59E0B',
    warningPressed: '#78350F',
    onWarning: '#111827',
    onWarningPressed: '#FFFFFF',
    destructive: '#EF4444',
    destructivePressed: '#B91C1C',
    onDestructive: '#FFFFFF',
    onAccent: '#111827',
    disabled: '#D1D5DB',
  },
  athleteDark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    secondaryText: '#D1D5DB',
    border: '#374151',
    primary: '#60A5FA',
    primaryPressed: '#2563EB',
    accent: '#38BDF8',
    warning: '#FBBF24',
    warningPressed: '#F59E0B',
    onWarning: '#111827',
    onWarningPressed: '#111827',
    destructive: '#F87171',
    destructivePressed: '#DC2626',
    onDestructive: '#111827',
    onAccent: '#111827',
    disabled: '#4B5563',
  },
  adminLight: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111827',
    secondaryText: '#6B7280',
    border: '#E5E7EB',
    primary: '#DC2626',
    primaryPressed: '#991B1B',
    accent: '#F59E0B',
    warning: '#F59E0B',
    warningPressed: '#78350F',
    onWarning: '#111827',
    onWarningPressed: '#FFFFFF',
    destructive: '#EF4444',
    destructivePressed: '#B91C1C',
    onDestructive: '#FFFFFF',
    onAccent: '#111827',
    disabled: '#D1D5DB',
  },
  adminDark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    secondaryText: '#D1D5DB',
    border: '#374151',
    primary: '#FCA5A5',
    primaryPressed: '#EF4444',
    accent: '#FBBF24',
    warning: '#FBBF24',
    warningPressed: '#F59E0B',
    onWarning: '#111827',
    onWarningPressed: '#111827',
    destructive: '#F87171',
    destructivePressed: '#DC2626',
    onDestructive: '#111827',
    onAccent: '#111827',
    disabled: '#4B5563',
  },
} as const;

export type DesignColorMode = keyof typeof colors;
