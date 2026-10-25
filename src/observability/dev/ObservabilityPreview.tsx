import React, {useEffect, useState} from 'react';
import {ScrollView, Share, StyleSheet, Text, View} from 'react-native';
import {PrimaryButton} from '../../design-system/atoms/PrimaryButton';
import {RemusToggle} from '../../design-system/atoms/RemusToggle';
import {colors, radius, spacing, typography, type DesignColorMode} from '../../design-system/tokens';
import {type RemusTelemetryEvent, type TelemetryCollectionConsent} from '../telemetry';
import {type DiagnosticJournal} from '../diagnosticJournal';
import {
  type TelemetryCollectionControl,
  type TelemetryCollectionResult,
} from '../telemetryCollectionControl';

export type ObservabilityDiagnostics = {
  trackEvent(event: RemusTelemetryEvent): Promise<boolean>;
  recordNonFatal(error: Error): Promise<boolean>;
};

export type ObservabilityPreviewProps = {
  mode: DesignColorMode;
  collectionControl: Pick<TelemetryCollectionControl, 'readConsent' | 'applyConsent'>;
  diagnostics: ObservabilityDiagnostics;
  journal: Pick<DiagnosticJournal, 'append' | 'read' | 'exportJson'>;
};

export type ObservabilityPreviewDependencies = Omit<ObservabilityPreviewProps, 'mode'>;

const resultLabel = (result: TelemetryCollectionResult) =>
  `Analytics: ${result.analytics === 'applied' ? 'aplicado' : 'falhou'} · ` +
  `Crash: ${result.crashReporting === 'applied' ? 'aplicado' : 'falhou'}`;

export function ObservabilityPreview({mode, collectionControl, diagnostics, journal}: ObservabilityPreviewProps) {
  const theme = colors[mode];
  const [consent, setConsent] = useState<TelemetryCollectionConsent>(() => collectionControl.readConsent());
  const [pending, setPending] = useState(false);
  const [lastResult, setLastResult] = useState('Nenhuma operação executada.');
  const [journalStatus, setJournalStatus] = useState('Carregando journal local...');

  const refreshJournal = async () => {
    try {
      const entries = await journal.read();
      setJournalStatus(`Journal local: ${entries.length} evento(s).`);
    } catch {
      setJournalStatus('Journal local indisponível.');
    }
  };

  const appendJournal = (event: Parameters<DiagnosticJournal['append']>[0]) => {
    // Local diagnostics are best-effort and must never block app controls.
    journal.append(event).catch(() => undefined).then(refreshJournal);
  };

  useEffect(() => {
    let active = true;
    journal.read().then(entries => {
      if (active) {setJournalStatus(`Journal local: ${entries.length} evento(s).`);}
    }).catch(() => {
      if (active) {setJournalStatus('Journal local indisponível.');}
    });
    return () => {active = false;};
  }, [journal]);

  const applyConsent = async (next: TelemetryCollectionConsent) => {
    setPending(true);
    setConsent({analytics: false, crashReporting: false});
    const result = await collectionControl.applyConsent(next);
    setConsent(result.effective);
    setLastResult(resultLabel(result));
    appendJournal({
      name: 'collection_consent_applied',
      analytics: result.effective.analytics,
      crashReporting: result.effective.crashReporting,
      outcome: result.analytics === 'applied' && result.crashReporting === 'applied'
        ? 'applied'
        : 'partial_failure',
    });
    setPending(false);
  };

  const runProbe = async () => {
    const delivered = await diagnostics.trackEvent({name: 'remus_qa_observability_probe'});
    appendJournal({name: 'qa_probe_completed', channel: 'analytics', outcome: delivered ? 'accepted' : 'blocked'});
    setLastResult(delivered ? 'Evento QA aceito.' : 'Evento QA bloqueado ou indisponível.');
  };

  const runNonFatal = async () => {
    const delivered = await diagnostics.recordNonFatal(new Error('REMUS QA non-fatal probe'));
    appendJournal({
      name: 'qa_probe_completed',
      channel: 'crash_reporting',
      outcome: delivered ? 'accepted' : 'blocked',
    });
    setLastResult(delivered ? 'Non-fatal QA aceito.' : 'Non-fatal QA bloqueado ou indisponível.');
  };

  const shareJournal = async () => {
    try {
      await Share.share({message: await journal.exportJson(), title: 'Remus QA · journal diagnóstico'});
      setLastResult('Compartilhamento do journal solicitado.');
    } catch {
      setLastResult('Não foi possível compartilhar o journal.');
    }
  };

  return <ScrollView style={styles.scroll} contentContainerStyle={styles.content} testID="observability-preview">
    <Text style={[styles.eyebrow, {color: theme.secondaryText}]}>REMUS / QA</Text>
    <Text style={[styles.heading, {color: theme.text}]}>Diagnóstico de observabilidade</Text>
    <Text style={[styles.description, {color: theme.secondaryText}]}>
      Estado solicitado nesta execução. Não provoca crash e ainda não representa consentimento persistido do produto.
    </Text>

    <View style={[styles.panel, {backgroundColor: theme.surface, borderColor: theme.border}]}>
      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={[styles.title, {color: theme.text}]}>Analytics</Text>
          <Text style={[styles.caption, {color: theme.secondaryText}]}>Evento técnico exclusivo de QA.</Text>
        </View>
        <RemusToggle testID="observability-analytics-toggle" accessibilityLabel="Coleta do Analytics"
          value={consent.analytics} disabled={pending} mode={mode}
          onValueChange={analytics => applyConsent({...consent, analytics})}/>
      </View>
      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={[styles.title, {color: theme.text}]}>Crash Reporting</Text>
          <Text style={[styles.caption, {color: theme.secondaryText}]}>Somente erro recuperável controlado.</Text>
        </View>
        <RemusToggle testID="observability-crash-toggle" accessibilityLabel="Coleta do Crash Reporting"
          value={consent.crashReporting} disabled={pending} mode={mode}
          onValueChange={crashReporting => applyConsent({...consent, crashReporting})}/>
      </View>
    </View>

    <View style={[styles.panel, {backgroundColor: theme.surface, borderColor: theme.border}]}>
      <Text testID="observability-journal-status" style={[styles.caption, {color: theme.secondaryText}]}>
        {journalStatus}
      </Text>
      <PrimaryButton testID="observability-journal-refresh" label="Atualizar journal" mode={mode}
        onPress={refreshJournal}/>
      <PrimaryButton testID="observability-journal-share" label="Compartilhar journal" mode={mode}
        onPress={shareJournal}/>
    </View>

    <View style={[styles.panel, {backgroundColor: theme.surface, borderColor: theme.border}]}>
      <PrimaryButton testID="observability-event-probe" label="Enviar evento QA" mode={mode}
        disabled={pending || !consent.analytics} onPress={runProbe}/>
      <PrimaryButton testID="observability-nonfatal-probe" label="Registrar non-fatal QA" mode={mode}
        disabled={pending || !consent.crashReporting} onPress={runNonFatal}/>
    </View>

    <Text testID="observability-last-result" style={[styles.result, {color: theme.text}]}>{lastResult}</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {padding: spacing.lg, paddingBottom: spacing.x3l},
  eyebrow: {...typography.caption, fontWeight: '600', marginBottom: spacing.sm},
  heading: {fontSize: 24, lineHeight: 32, fontWeight: '700', marginBottom: spacing.sm},
  description: {...typography.body, marginBottom: spacing.md},
  panel: {borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.md},
  settingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md},
  settingText: {flex: 1},
  title: {...typography.body, fontWeight: '600'},
  caption: typography.caption,
  result: {...typography.body, fontWeight: '600'},
});
