/** A temporary, debug-only component gallery. No application/business logic. */
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../atoms/PrimaryButton';
import { RemusIcon } from '../atoms/RemusIcon';
import { RemusIconButton } from '../atoms/RemusIconButton';
import { RemusInput } from '../atoms/RemusInput';
import { RemusCheckbox } from '../atoms/RemusCheckbox';
import { RemusRadio } from '../atoms/RemusRadio';
import { RemusToggle } from '../atoms/RemusToggle';
import { RemusFilterChip } from '../atoms/RemusFilterChip';
import { RemusConditionStatus } from '../atoms/RemusConditionStatus';
import { RemusAvatar } from '../atoms/RemusAvatar';
import { RemusNavigationItem } from '../atoms/RemusNavigationItem';
import { RemusChartMark } from '../atoms/RemusChartMark';
import { RemusChartRule } from '../atoms/RemusChartRule';
import { RemusBatteryStatus } from '../atoms/RemusBatteryStatus';
import { RemusSourceBadge } from '../atoms/RemusSourceBadge';
import { RemusCaptureFab } from '../atoms/RemusCaptureFab';
import { chartMarkKinds, chartRuleKinds, batteryConditions, sourceTypes } from '../atoms/remusChartCaptureStyle';
import { type ConditionStatus } from '../atoms/remusPresentationStyle';
import { type RemusIconName } from '../atoms/remusIconDefinition';
import { MoleculePreview } from './MoleculePreview';
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
  const [gallery, setGallery] = useState<'atoms' | 'molecules'>('atoms');
  const [lastAction, setLastAction] = useState('Nenhum botão acionado');
  const [fieldValue, setFieldValue] = useState('');
  const [errorValue, setErrorValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [mixedChecked, setMixedChecked] = useState(false);
  const [radioChoice, setRadioChoice] = useState<'a' | 'b'>('a');
  const [toggleOn, setToggleOn] = useState(false);
  const [filterTraining, setFilterTraining] = useState(false);
  const [selectedNav, setSelectedNav] = useState<'home' | 'trainings'>('home');
  const mode = dark ? 'athleteDark' : 'athleteLight';
  const theme = colors[mode];

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <View style={[styles.fixedHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.fixedHeaderTitle, { color: theme.text }]}>REMUS · QA</Text>
        <Pressable
          testID="theme-toggle"
          accessibilityRole="button"
          accessibilityLabel="Alternar tema Athlete"
          onPress={() => setDark(value => !value)}
          style={[styles.themeToggle, { borderColor: theme.primary }]}
        >
          <Text style={[styles.themeToggleLabel, { color: theme.primary }]}>
            {dark ? 'Dark → Light' : 'Light → Dark'}
          </Text>
        </Pressable>
      </View>
      <View style={[styles.galleryTabs, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: gallery === 'atoms' }}
          testID="gallery-atoms" onPress={() => setGallery('atoms')} style={styles.galleryTab}>
          <Text style={[styles.galleryTabText, { color: gallery === 'atoms' ? theme.primary : theme.text }]}>Átomos</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: gallery === 'molecules' }}
          testID="gallery-molecules" onPress={() => setGallery('molecules')} style={styles.galleryTab}>
          <Text style={[styles.galleryTabText, { color: gallery === 'molecules' ? theme.primary : theme.text }]}>Moléculas</Text>
        </Pressable>
      </View>
      {gallery === 'molecules' ? <MoleculePreview mode={mode} /> : <ScrollView
        testID="design-system-preview"
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.eyebrow, { color: theme.secondaryText }]}>REMUS / DESIGN SYSTEM</Text>
        <Text style={[styles.heading, { color: theme.text }]}>Foundations</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>
          Primeiro átomo — Button / Primary. Catálogo local com dados simulados.
        </Text>

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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Icon Button — avançado</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Warning · Destructive · Loading. Loading substitui o ícone e bloqueia ações.
          </Text>
          <View style={styles.iconButtonGrid}>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="close" variant="warning" mode={mode}
                accessibilityLabel="Alerta" testID="icon-button-warning"
                onPress={() => setLastAction('Icon Button: alerta')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Warning</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="close" variant="destructive" mode={mode}
                accessibilityLabel="Excluir" testID="icon-button-destructive"
                onPress={() => setLastAction('Icon Button: excluir')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Destructive</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="start" variant="primary" loading mode={mode}
                accessibilityLabel="Carregando atividade" testID="icon-button-loading"
                onPress={() => setLastAction('ERRO: loading')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Loading</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="close" size="workout" variant="destructive" mode={mode}
                accessibilityLabel="Parar atividade" testID="icon-button-workout-destructive"
                onPress={() => setLastAction('Icon Button: parar')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Workout</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="close" size="workout" variant="warning" mode={mode}
                accessibilityLabel="Atenção durante o treino" testID="icon-button-workout-warning"
                onPress={() => setLastAction('Icon Button: alerta treino')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Warning 72</RemusText>
            </View>
            <View style={styles.iconButtonExample}>
              <RemusIconButton
                icon="stop" size="workout" variant="destructive" loading mode={mode}
                accessibilityLabel="Finalizando treino" testID="icon-button-workout-loading"
                onPress={() => setLastAction('ERRO: loading workout')}
              />
              <RemusText variant="caption" mode={mode} tone="secondary">Loading 72</RemusText>
            </View>
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Campos de texto</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Input · 48 px · Default / Focused / Error / Disabled.
          </Text>
          <View style={styles.inputExample}>
            <RemusInput
              mode={mode}
              testID="input-default"
              accessibilityLabel="Valor de exemplo"
              placeholder="Enter value"
              value={fieldValue}
              onChangeText={setFieldValue}
            />
          </View>
          <View style={styles.inputExample}>
            <RemusInput
              mode={mode}
              testID="input-error"
              accessibilityLabel="Valor com erro"
              placeholder="Valor inválido"
              error
              value={errorValue}
              onChangeText={setErrorValue}
            />
          </View>
          <View style={styles.inputExample}>
            <RemusInput
              mode={mode}
              testID="input-disabled"
              accessibilityLabel="Campo indisponível"
              placeholder="Unavailable"
              disabled
            />
          </View>
          <RemusText variant="caption" mode={mode} tone="secondary">
            Toque no primeiro campo para testar Focused. O último campo não permite edição.
          </RemusText>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Controles de seleção</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>Checkbox · Radio · Toggle · Filter Chip. Toque para alterar os estados.</Text>

          <RemusText variant="bodyMedium" mode={mode}>Checkbox</RemusText>
          <View style={styles.selectionRow}>
            <View style={styles.selectionExample}>
              <RemusCheckbox testID="selection-checkbox" accessibilityLabel="Marcar seleção"
                checked={checkboxChecked} onValueChange={setCheckboxChecked} mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>{checkboxChecked ? 'Checked' : 'Unchecked'}</RemusText>
            </View>
            <View style={styles.selectionExample}>
              <RemusCheckbox testID="selection-checkbox-mixed" accessibilityLabel="Marcar seleção parcial"
                checked={mixedChecked} indeterminate={!mixedChecked}
                onValueChange={setMixedChecked} mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>{mixedChecked ? 'Checked' : 'Mixed'}</RemusText>
            </View>
            <View style={styles.selectionExample}>
              <RemusCheckbox testID="selection-checkbox-disabled" accessibilityLabel="Seleção indisponível"
                disabled mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>Disabled</RemusText>
            </View>
          </View>

          <RemusText variant="bodyMedium" mode={mode}>Radio</RemusText>
          <View style={styles.selectionRow}>
            <View style={styles.selectionExample}>
              <RemusRadio testID="selection-radio-a" accessibilityLabel="Opção A"
                selected={radioChoice === 'a'} onSelect={() => setRadioChoice('a')} mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>Opção A</RemusText>
            </View>
            <View style={styles.selectionExample}>
              <RemusRadio testID="selection-radio-b" accessibilityLabel="Opção B"
                selected={radioChoice === 'b'} onSelect={() => setRadioChoice('b')} mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>Opção B</RemusText>
            </View>
            <View style={styles.selectionExample}>
              <RemusRadio testID="selection-radio-disabled" accessibilityLabel="Opção indisponível"
                disabled mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>Disabled</RemusText>
            </View>
          </View>

          <RemusText variant="bodyMedium" mode={mode}>Toggle</RemusText>
          <View style={styles.selectionRow}>
            <View style={styles.selectionExample}>
              <RemusToggle testID="selection-toggle" accessibilityLabel="Ativar recurso"
                value={toggleOn} onValueChange={setToggleOn} mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>{toggleOn ? 'On' : 'Off'}</RemusText>
            </View>
            <View style={styles.selectionExample}>
              <RemusToggle testID="selection-toggle-disabled" accessibilityLabel="Recurso indisponível"
                disabled mode={mode} />
              <RemusText variant="caption" tone="secondary" mode={mode}>Disabled</RemusText>
            </View>
          </View>

          <RemusText variant="bodyMedium" mode={mode}>Filter Chip</RemusText>
          <View style={[styles.selectionRow, styles.chipRow]}>
            <RemusFilterChip testID="selection-chip-all" label="Todos" mode={mode}
              selected={!filterTraining} onValueChange={() => setFilterTraining(false)} />
            <RemusFilterChip testID="selection-chip-training" label="Treinos" mode={mode}
              selected={filterTraining} onValueChange={() => setFilterTraining(true)} />
            <RemusFilterChip testID="selection-chip-disabled" label="Indisponível" disabled mode={mode} />
          </View>
          <RemusText variant="caption" mode={mode} tone="secondary">
            Os estados são controlados pela galeria. Disabled não executa ações.
          </RemusText>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Status, identidade e navegação</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Weather / Avatar / Navigation · três átomos da biblioteca oficial.
          </Text>
          <RemusText variant="bodyMedium" mode={mode}>Condition Status</RemusText>
          <View style={styles.presentationRow}>
            {(['best', 'good', 'caution', 'notRecommended', 'uncertain'] as ConditionStatus[]).map(status => (
              <RemusConditionStatus key={status} testID={`status-${status}`} status={status} mode={mode} />
            ))}
          </View>
          <RemusText variant="bodyMedium" mode={mode}>Avatar</RemusText>
          <View style={styles.presentationRow}>
            <RemusAvatar initials="AE" size="medium" mode={mode} testID="avatar-medium" />
            <RemusAvatar initials="AE" size="large" mode={mode} testID="avatar-large" />
          </View>
          <RemusText variant="bodyMedium" mode={mode}>Navigation Item</RemusText>
          <View style={styles.presentationRow}>
            <RemusNavigationItem icon="home" label="Home" testID="nav-home"
              selected={selectedNav === 'home'} onPress={() => setSelectedNav('home')} mode={mode} />
            <RemusNavigationItem icon="start" label="Treinos" testID="nav-trainings"
              selected={selectedNav === 'trainings'} onPress={() => setSelectedNav('trainings')} mode={mode} />
            <RemusNavigationItem icon="home" label="Disabled" testID="nav-disabled"
              disabled onPress={() => setLastAction('ERRO: navigation disabled')} mode={mode} />
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Gráficos — primitivas</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Amostras oficiais de marcas e guias. Os gráficos com dados reais virão nas moléculas.
          </Text>
          <View style={styles.chartGrid}>
            {chartMarkKinds.map(kind => (
              <View key={kind} style={styles.chartExample}>
                <RemusChartMark kind={kind} mode={mode} testID={`chart-mark-${kind}`} />
                <RemusText mode={mode} variant="caption" tone="secondary">{kind}</RemusText>
              </View>
            ))}
          </View>
          <RemusText mode={mode} variant="bodyMedium">Chart Rules</RemusText>
          <View style={styles.chartGrid}>
            {chartRuleKinds.map(kind => (
              <View key={kind} style={styles.chartExample}>
                <RemusChartRule kind={kind} mode={mode} testID={`chart-rule-${kind}`} />
                <RemusText mode={mode} variant="caption" tone="secondary">{kind}</RemusText>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Gravação — átomos</Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Fontes, bateria e ações visuais da captura; sem iniciar ou finalizar treinos reais.
          </Text>
          <RemusText mode={mode} variant="bodyMedium">Source Badges</RemusText>
          <View style={styles.captureRow}>
            {sourceTypes.map(source => (
              <View key={source} style={styles.captureExample}>
                <RemusSourceBadge source={source} mode={mode} testID={`capture-source-${source}`} />
                <RemusText mode={mode} variant="small" tone="secondary">{source}</RemusText>
              </View>
            ))}
          </View>
          <RemusText mode={mode} variant="bodyMedium">Battery Status</RemusText>
          <View style={styles.captureRow}>
            {batteryConditions.map(condition => (
              <View key={condition} style={styles.captureExample}>
                <RemusBatteryStatus condition={condition} mode={mode} testID={`capture-battery-${condition}`} />
                <RemusText mode={mode} variant="small" tone="secondary">{condition}</RemusText>
              </View>
            ))}
          </View>
          <RemusText mode={mode} variant="bodyMedium">Capture FAB</RemusText>
          <View style={styles.captureRow}>
            <View style={styles.captureExample}>
              <RemusCaptureFab action="pause" mode={mode} accessibilityLabel="Simular pausa"
                testID="capture-pause" onPress={() => setLastAction('Preview: pausar gravação')} />
              <RemusText mode={mode} variant="caption" tone="secondary">Pause</RemusText>
            </View>
            <View style={styles.captureExample}>
              <RemusCaptureFab action="finish" mode={mode} accessibilityLabel="Simular fim"
                testID="capture-finish" onPress={() => setLastAction('Preview: finalizar gravação')} />
              <RemusText mode={mode} variant="caption" tone="secondary">Finish</RemusText>
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
          Próximos incrementos: outros átomos e componentes compostos.
        </Text>
      </ScrollView>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  galleryTabs: { flexDirection: 'row', borderBottomWidth: 1 },
  galleryTab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  galleryTabText: { fontSize: 14, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.x3l },
  eyebrow: { ...typography.caption, fontWeight: '600', marginBottom: spacing.sm },
  heading: { fontSize: 30, lineHeight: 36, fontWeight: '700', marginBottom: spacing.sm },
  description: { ...typography.body, marginBottom: spacing.md },
  fixedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  fixedHeaderTitle: { ...typography.caption, fontWeight: '700' },
  themeToggleLabel: { fontWeight: '600', fontSize: 14 },
  themeToggle: { borderWidth: 1, borderRadius: radius.md,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  panel: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: '600', marginBottom: spacing.md },
  example: { paddingBottom: spacing.md },
  typographyExample: { marginBottom: spacing.md },
  inputExample: { marginBottom: spacing.md },
  selectionRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md, marginTop: spacing.sm, gap: spacing.sm },
  selectionExample: { minWidth: 72, alignItems: 'center', gap: spacing.xs },
  chipRow: { gap: spacing.sm },
  presentationRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md },
  chartGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chartExample: { alignItems: 'center', width: 220, gap: spacing.xs },
  captureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginVertical: spacing.md },
  captureExample: { width: 66, alignItems: 'center', gap: spacing.xs },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  iconExample: { width: 105, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  iconButtonGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  iconButtonExample: { width: 108, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  feedback: { ...typography.body, fontWeight: '600', marginVertical: spacing.md },
  footer: typography.caption,
});
