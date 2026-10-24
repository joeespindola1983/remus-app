/** A temporary, debug-only component gallery. No application/business logic. */
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { colors, radius, spacing, typography } from '../tokens';

export function DesignSystemPreview() {
  const insets = useSafeAreaInsets();
  const [dark, setDark] = useState(false);
  const [lastAction, setLastAction] = useState('Nenhum botão acionado');
  const mode = dark ? 'athleteDark' : 'athleteLight';
  const theme = colors[mode];

  return (
    <ScrollView
      testID="design-system-preview"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingTop: spacing.lg + insets.top }]}
    >
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Text style={[styles.eyebrow, { color: theme.secondaryText }]}>REMUS / DESIGN SYSTEM</Text>
      <Text style={[styles.heading, { color: theme.text }]}>Foundations</Text>
      <Text style={[styles.description, { color: theme.secondaryText }]}>
        Primeiro átomo — Button / Primary. Catálogo local com dados simulados.
      </Text>
      <Pressable
        testID="theme-toggle"
        accessibilityRole="button"
        accessibilityLabel="Alternar tema Athlete"
        onPress={() => setDark(value => !value)}
        style={[styles.themeToggle, { borderColor: theme.border }]}
      >
        <Text style={[styles.themeToggleLabel, { color: theme.text }]}>
          {dark ? 'Athlete Dark → Light' : 'Athlete Light → Dark'}
        </Text>
      </Pressable>

      <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tamanhos</Text>
        <View style={styles.example}>
          <PrimaryButton label="Small · 40" size="small" mode={mode} onPress={() => setLastAction('Small')} />
        </View>
        <View style={styles.example}>
          <PrimaryButton label="Start activity" size="medium" mode={mode} testID="catalog-primary-medium" onPress={() => setLastAction('Medium')} />
        </View>
        <View style={styles.example}>
          <PrimaryButton label="Large · 56" size="large" mode={mode} onPress={() => setLastAction('Large')} />
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Estados</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>
          Pressione e segure o botão ativo para ver Pressed.
        </Text>
        <View style={styles.example}>
          <PrimaryButton label="Default / Pressed" mode={mode} onPress={() => setLastAction('Pressed test')} />
        </View>
        <View style={styles.example}>
          <PrimaryButton label="Disabled" disabled mode={mode} onPress={() => setLastAction('ERRO: disabled')} />
        </View>
      </View>

      <Text testID="last-action" style={[styles.feedback, { color: theme.text }]}>
        Última ação: {lastAction}
      </Text>
      <Text style={[styles.footer, { color: theme.secondaryText }]}>
        Loading, ícones e outras variantes entram nos próximos incrementos.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.x3l },
  eyebrow: { ...typography.caption, fontWeight: '600', marginBottom: spacing.sm },
  heading: { fontSize: 30, lineHeight: 36, fontWeight: '700', marginBottom: spacing.sm },
  description: { ...typography.body, marginBottom: spacing.md },
  themeToggleLabel: { fontWeight: '600' },
  themeToggle: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  panel: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: '600', marginBottom: spacing.md },
  example: { paddingBottom: spacing.md },
  feedback: { ...typography.body, fontWeight: '600', marginVertical: spacing.md },
  footer: typography.caption,
});
