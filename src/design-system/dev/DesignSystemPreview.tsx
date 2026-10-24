/** A temporary, debug-only component gallery. No application/business logic. */
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { RemusIcon } from '../atoms/RemusIcon';
import { RemusIconButton } from '../atoms/RemusIconButton';
import { type RemusIconName } from '../atoms/remusIconDefinition';
import { RemusText } from '../atoms/RemusText';
import { colors, radius, spacing, typography } from '../tokens';

const typographyExamples = [
  { variant: 'h1', label: 'Heading/H1 · 30/36' },
  { variant: 'h2', label: 'Heading/H2 · 24/32' },
  { variant: 'h3', label: 'Heading/H3 · 20/28' },
  { variant: 'h4', label: 'Heading/H4 · 18/24' },
  { variant: 'body', label: 'Body/Default · 16/24' },
  { variant: 'bodyMedium', label: 'Body/Medium · 16/24' },
  { variant: 'caption', label: 'Body/Caption · 14/20' },
  { variant: 'small', label: 'Body/Small · 12/16' },
] as const;

const iconExamples: ReadonlyArray<{ name: RemusIconName; label: string }> = [
  { name: 'home', label: 'Home' },
  { name: 'chevronRight', label: 'Chevron Right' },
  { name: 'close', label: 'Close' },
  { name: 'plus', label: 'Plus' },
  { name: 'check', label: 'Check' },
  { name: 'start', label: 'Start' },
  { name: 'pause', label: 'Pause' },
  { name: 'stop', label: 'Stop' },
];

export function DesignSystemPreview() {
  const [dark, setDark] = useState(false);
  const [lastAction, setLastAction] = useState('Nenhum botão acionado');
  const mode = dark ? 'athleteDark' : 'athleteLight';
  const theme = colors[mode];

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <ScrollView
        testID="design-system-preview"
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tipografia</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Escala semântica oficial · SF Pro (iOS) / Roboto (Android).
          </Text>
          {typographyExamples.map(example => (
            <View key={example.variant} style={styles.typographyExample}>
              <RemusText
                testID={`typography-${example.variant}`}
                variant={example.variant}
                mode={mode}
              >
                {example.label}
              </RemusText>
            </View>
          ))}
          <RemusText variant="caption" mode={mode} tone="secondary">
            Texto secundário — legível nos dois temas.
          </RemusText>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Iconografia</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Ícones vetoriais oficiais · canvas 32 × 32 · cores semânticas.
          </Text>
          <View style={styles.iconGrid}>
            {iconExamples.map(({ name, label }) => (
              <View key={name} style={styles.iconExample}>
                <RemusIcon name={name} mode={mode} testID={`icon-${name}`} />
                <RemusText variant="caption" mode={mode} tone="secondary">
                  {label}
                </RemusText>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Botões com ícone</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Circular · Neutral / Primary · 40 / 50 / 56 / 72.
          </Text>
          <View style={styles.iconButtonGrid}>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="plus" size="small" variant="neutral" mode={mode}
                accessibilityLabel="Adicionar" testID="icon-button-small"
                onPress={() => setLastAction('Icon Button: adicionar')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Neutral 40</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="start" size="medium" mode={mode}
                accessibilityLabel="Iniciar atividade" testID="icon-button-medium"
                onPress={() => setLastAction('Icon Button: iniciar')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Primary 50</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="pause" size="large" variant="neutral" mode={mode}
                accessibilityLabel="Pausar atividade" testID="icon-button-large"
                onPress={() => setLastAction('Icon Button: pausar')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Neutral 56</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="close" size="workout" variant="neutral" mode={mode}
                accessibilityLabel="Fechar painel" testID="icon-button-workout"
                onPress={() => setLastAction('Icon Button: fechar painel')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Workout 72</RemusText>
            </View>
          </View>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Pressione e segure para testar Pressed; Disabled não executa ações.
          </Text>
          <View style={styles.iconButtonGrid}>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="check" mode={mode} accessibilityLabel="Confirmar"
                testID="icon-button-pressed"
                onPress={() => setLastAction('Icon Button: confirmado')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Pressed</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="close" mode={mode} accessibilityLabel="Indisponível"
                disabled testID="icon-button-disabled"
                onPress={() => setLastAction('ERRO: icon disabled')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Disabled</RemusText>
            </View>
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
          Loading e outras variantes entram nos próximos incrementos.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
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
  typographyExample: { marginBottom: spacing.md },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  iconExample: { width: 105, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  iconButtonGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  iconButtonExample: { width: 108, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  feedback: { ...typography.body, fontWeight: '600', marginVertical: spacing.md },
  footer: typography.caption,
});
