import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemusSourceBadge } from '../atoms/RemusSourceBadge';
import { type MoleculeMode, type MoleculeTone, clampPercent, moleculePalette, moleculeStyles, toneColor } from './moleculeStyle';

type Base={mode?:MoleculeMode;testID?:string};
export type SourceStatus='ready'|'recording'|'interrupted'|'syncing';
const sourceLabels:Record<SourceStatus,string>={ready:'Pronto',recording:'Gravando',interrupted:'Interrompido',syncing:'Sincronizando'};
const sourceTones:Record<SourceStatus,MoleculeTone>={ready:'success',recording:'critical',interrupted:'warning',syncing:'primary'};

/** Figma 500:37. Source identity and state are intentionally independent. */
export function RemusSourceStatusRow({name,detail,state,mode='athleteLight',testID}:Base & {
  name:string;detail:string;state:SourceStatus;
}) {
  const c=moleculePalette(mode);
  return <View testID={testID} style={[moleculeStyles.card,moleculeStyles.between,{backgroundColor:c.surface,borderColor:c.border}]}>
    <View style={[moleculeStyles.row,styles.flexContent]}>
      <RemusSourceBadge source="rbp1" mode={mode}/>
      <View style={[moleculeStyles.column,styles.flexContent]}>
        <Text style={[moleculeStyles.title,{color:c.text}]}>{name}</Text>
        <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{detail}</Text>
      </View>
    </View>
    <Text style={[moleculeStyles.caption,styles.stateLabel,{color:toneColor(sourceTones[state],mode)}]}>{sourceLabels[state]}</Text>
  </View>;
}

export type ArtifactProgressState='transferring'|'verified'|'retry';
export function RemusArtifactPartProgress({state,percent,detail,mode='athleteLight',testID}:Base & {
  state:ArtifactProgressState;percent:number;detail:string;
}) {
  const c=moleculePalette(mode);
  const label=state==='transferring'?'Transferindo':state==='verified'?'Verificado':'Tentar novamente';
  const tone:MoleculeTone=state==='verified'?'success':state==='retry'?'warning':'primary';
  return <View testID={testID} style={[moleculeStyles.card,{backgroundColor:c.surface,borderColor:c.border}]}>
    <View style={moleculeStyles.between}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>{label}</Text>
      <Text style={[moleculeStyles.subtitle,{color:c.secondaryText}]}>{Math.round(clampPercent(percent))}%</Text>
    </View>
    <View style={[moleculeStyles.progressTrack,{backgroundColor:c.mutedBackground}]}>
      <View style={[moleculeStyles.progressFill,progressStyle(percent,toneColor(tone,mode))]}/>
    </View>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{detail}</Text>
  </View>;
}

export type ActivityMatchState='suggested'|'selected'|'review';
const matchLabel:Record<ActivityMatchState,string>={suggested:'Sugerido',selected:'Selecionado',review:'Revisar'};
export function RemusActivityMatchCard({title,detail,state,mode='athleteLight',testID,onPress}:Base & {
  title:string;detail:string;state:ActivityMatchState;onPress?:()=>void;
}) {
  const c=moleculePalette(mode);
  return <Pressable testID={testID} onPress={onPress} disabled={!onPress} accessibilityRole={onPress?'button':undefined}
    style={[moleculeStyles.card,{backgroundColor:c.surface,borderColor:state==='selected'?c.primary:c.border}]}>
    <View style={moleculeStyles.between}>
      <Text style={[moleculeStyles.title,styles.flexText,{color:c.text}]}>{title}</Text>
      <Text style={[moleculeStyles.caption,styles.stateLabel,{color:c.primary}]}>{matchLabel[state]}</Text>
    </View>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{detail}</Text>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>A sugestão não confirma a associação.</Text>
  </Pressable>;
}

export type RecordingRangeMode='whole'|'phoneBounded'|'pending';
const recordingTitle:Record<RecordingRangeMode,string>={whole:'Gravação inteira',phoneBounded:'Limitado ao telefone',pending:'Faixa pendente'};
export function RemusRecordingRangeControl({range,mode:rangeMode,coverage,designMode='athleteLight',testID,onPress}: {
  range:string;mode:RecordingRangeMode;coverage:number;designMode?:MoleculeMode;testID?:string;onPress?:()=>void;
}) {
  const c=moleculePalette(designMode);
  return <Pressable testID={testID} onPress={onPress} disabled={!onPress} accessibilityRole={onPress?'button':undefined}
    style={[moleculeStyles.card,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[moleculeStyles.title,{color:c.text}]}>{recordingTitle[rangeMode]}</Text>
    <View style={[moleculeStyles.progressTrack,{backgroundColor:c.mutedBackground}]}>
      <View style={[moleculeStyles.progressFill,progressStyle(coverage,rangeMode==='pending'?c.warning:c.primary)]}/>
    </View>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{range}</Text>
  </Pressable>;
}

export type PermissionState='granted'|'required'|'blocked';
const permissionLabel:Record<PermissionState,string>={granted:'Permitido',required:'Necessário',blocked:'Bloqueado'};
export function RemusPermissionReadinessRow({name,state,mode='athleteLight',testID,onPress}:Base & {
  name:string;state:PermissionState;onPress?:()=>void;
}) {
  const c=moleculePalette(mode);
  const tone:MoleculeTone=state==='granted'?'success':state==='required'?'warning':'critical';
  return <Pressable testID={testID} onPress={onPress} disabled={!onPress} accessibilityRole={onPress?'button':undefined}
    style={[moleculeStyles.card,moleculeStyles.between,{backgroundColor:c.surface,borderColor:c.border}]}>
    <View style={[moleculeStyles.row,styles.flexContent]}>
      <View style={[styles.stateDot,{backgroundColor:toneColor(tone,mode)}]}/>
      <Text style={[moleculeStyles.subtitle,styles.flexText,{color:c.text}]}>{name}</Text>
    </View>
    <View style={[moleculeStyles.pill,{backgroundColor:c.mutedBackground}]}>
      <Text style={[moleculeStyles.caption,{color:toneColor(tone,mode)}]}>{permissionLabel[state]}</Text>
    </View>
  </Pressable>;
}

export type OperationalEventTone='information'|'warning'|'critical'|'recovered';
export function RemusOperationalEventBanner({title,detail,tone,mode='athleteLight',testID}:Base & {
  title:string;detail:string;tone:OperationalEventTone;
}) {
  const c=moleculePalette(mode);
  const semantic:MoleculeTone=tone==='information'?'accent':tone==='recovered'?'success':tone==='critical'?'critical':'warning';
  return <View testID={testID} style={[moleculeStyles.softCard,moleculeStyles.row,{backgroundColor:c.mutedSurface}]}>
    <View style={[styles.eventAccent,{backgroundColor:toneColor(semantic,mode)}]}/>
    <View style={[moleculeStyles.column,styles.flexContent]}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>{title}</Text>
      <Text style={[moleculeStyles.subtitle,{color:c.secondaryText}]}>{detail}</Text>
    </View>
  </View>;
}

/** Figma 511:44. Storage duration is not inferred from free space. */
export function RemusResourcePressureCard({name,detail,resource,severity,percent,mode='athleteLight',testID}:Base & {
  name:string;detail:string;resource:'storage'|'battery';severity:'warning'|'blocking';percent:number;
}) {
  const c=moleculePalette(mode);
  const important=severity==='blocking';
  return <View testID={testID} style={[moleculeStyles.softCard,{backgroundColor:important?c.criticalSurface:c.warningSurface}]}>
    <View style={moleculeStyles.between}>
      <Text style={[moleculeStyles.title,styles.flexText,{color:c.text}]}>{name}</Text>
      <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{resource}</Text>
    </View>
    <View style={[moleculeStyles.progressTrack,{backgroundColor:c.mutedBackground}]}>
      <View style={[moleculeStyles.progressFill,progressStyle(percent,important?c.destructive:c.warning)]}/>
    </View>
    <Text style={[moleculeStyles.subtitle,{color:c.text}]}>{detail}</Text>
  </View>;
}

export type FinalizationState='pending'|'finalized'|'interrupted'|'unavailable';
const finalizeLabel:Record<FinalizationState,string>={pending:'Aguardando confirmação',finalized:'Finalizado',interrupted:'Interrompido',unavailable:'Indisponível'};
export function RemusFinalizationStatusRow({name,state,mode='athleteLight',testID}:Base & {name:string;state:FinalizationState}) {
  const c=moleculePalette(mode);
  const tone:MoleculeTone=state==='finalized'?'success':state==='interrupted'?'critical':state==='pending'?'warning':'neutral';
  return <View testID={testID} style={[moleculeStyles.card,moleculeStyles.row,{backgroundColor:c.surface,borderColor:c.border}]}>
    <View style={[styles.stateDot,{backgroundColor:toneColor(tone,mode)}]}/>
    <View style={moleculeStyles.column}>
      <Text style={[moleculeStyles.subtitle,{color:c.text}]}>{name}</Text>
      <Text style={[moleculeStyles.caption,{color:toneColor(tone,mode)}]}>{finalizeLabel[state]}</Text>
    </View>
  </View>;
}

/** Figma 549:14124. Metrics are observed values, no fabricated duration or confidence. */
export function RemusLiveMetricCell({label,value,unit,orientation='portrait',mode='athleteLight',testID}:Base & {
  label:string;value:string;unit:string;orientation?:'portrait'|'landscape';
}) {
  const c=moleculePalette(mode);
  return <View testID={testID} style={[orientation==='portrait'?moleculeStyles.liveMetricPortrait:moleculeStyles.liveMetricLandscape,
    {backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[moleculeStyles.subtitle,{color:c.secondaryText}]}>{label}</Text>
    <Text style={[moleculeStyles.liveValue,{color:c.text}]}>{value}</Text>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{unit}</Text>
  </View>;
}

const progressStyle=(percent:number,color:string)=>({width:`${clampPercent(percent)}%` as const,backgroundColor:color});
const styles=StyleSheet.create({
  flexContent:{flex:1,minWidth:0},
  flexText:{flexShrink:1},
  stateLabel:{flexShrink:1,maxWidth:'39%',textAlign:'right'},
  stateDot:{width:10,height:10,borderRadius:5},eventAccent:{width:4,alignSelf:'stretch',borderRadius:2}});
