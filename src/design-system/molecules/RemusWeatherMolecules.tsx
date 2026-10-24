import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RemusConditionStatus } from '../atoms/RemusConditionStatus';
import { type ConditionStatus } from '../atoms/remusPresentationStyle';
import { type MoleculeMode, moleculePalette, moleculeStyles } from './moleculeStyle';

type Base={mode?:MoleculeMode;testID?:string};

/** Figma 260:793. The forecast is externally supplied, never inferred. */
export function RemusDailyForecast({day,temperature,detail,status,mode='athleteLight',testID}:Base & {
  day:string;temperature:string;detail:string;status:ConditionStatus;
}) {
  const c=moleculePalette(mode);
  return <View testID={testID} style={[moleculeStyles.card,styles.forecast,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[moleculeStyles.title,{color:c.text}]}>{day}</Text>
    <Text style={[moleculeStyles.big,{color:c.text}]}>{temperature}</Text>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{detail}</Text>
    <RemusConditionStatus status={status} mode={mode}/>
  </View>;
}

/** Figma 280:211. Wind direction and gusts are display strings, not computed from other values. */
export function RemusWindSummary({value,detail,mode='athleteLight',testID}:Base & {value:string;detail:string}) {
  const c=moleculePalette(mode);
  return <View testID={testID} style={[moleculeStyles.card,moleculeStyles.row,{backgroundColor:c.surface,borderColor:c.border}]}>
    <View style={[styles.symbol,{borderColor:c.accent}]}><Text style={[moleculeStyles.big,{color:c.accent}]}>↝</Text></View>
    <View style={[moleculeStyles.column,styles.flexContent]}>
      <Text style={[moleculeStyles.subtitle,{color:c.secondaryText}]}>Wind</Text>
      <Text style={[moleculeStyles.strong,{color:c.text}]}>{value}</Text>
      <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{detail}</Text>
    </View>
  </View>;
}

/** Figma 281:213. A proposed training window is advice, not a live weather measurement. */
export function RemusTrainingWindow({time,description,status,mode='athleteLight',testID,onPress}:Base & {
  time:string;description:string;status:ConditionStatus;onPress?:()=>void;
}) {
  const c=moleculePalette(mode);
  return <Pressable testID={testID} disabled={!onPress} onPress={onPress} accessibilityRole={onPress?'button':undefined}
    style={[moleculeStyles.card,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>Suggested training window</Text>
    <Text style={[moleculeStyles.strong,{color:c.text}]}>{time}</Text>
    <Text style={[moleculeStyles.subtitle,{color:c.secondaryText}]}>{description}</Text>
    <RemusConditionStatus status={status} mode={mode}/>
  </Pressable>;
}

/** Figma 282:275. Critical state uses the destructive family. */
export function RemusWeatherAlert({title,detail,severity='caution',mode='athleteLight',testID,onPress}:Base & {
  title:string;detail:string;severity?:'caution'|'critical';onPress?:()=>void;
}) {
  const c=moleculePalette(mode);
  const urgent=severity==='critical';
  return <Pressable testID={testID} onPress={onPress} disabled={!onPress}
    accessibilityRole={onPress?'button':undefined} accessibilityLabel={`${title}. ${detail}`}
    style={[moleculeStyles.card,moleculeStyles.row,{backgroundColor:urgent?c.criticalSurface:c.warningSurface,
      borderColor:urgent?c.destructive:c.warning}]}>
    <Text style={[moleculeStyles.big,{color:urgent?c.destructive:c.warning}]}>{urgent?'!':'⚠'}</Text>
    <View style={[moleculeStyles.column,styles.flexContent]}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>{title}</Text>
      <Text style={[moleculeStyles.subtitle,{color:c.secondaryText}]}>{detail}</Text>
    </View>
  </Pressable>;
}

/** Figma 282:1623. Freshness always comes from source timestamps. */
export function RemusLocationContext({location,freshness,mode='athleteLight',testID,onPress}:Base & {
  location:string;freshness:string;onPress?:()=>void;
}) {
  const c=moleculePalette(mode);
  return <Pressable testID={testID} onPress={onPress} disabled={!onPress}
    style={[moleculeStyles.card,moleculeStyles.row,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[moleculeStyles.strong,{color:c.primary}]}>⌖</Text>
    <View style={[moleculeStyles.column,styles.flexContent]}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>{location}</Text>
      <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{freshness}</Text>
    </View>
  </Pressable>;
}

export type WindowScenario='morning'|'afternoon'|'adverse';
/** Figma 366:282. Parent supplies recommendation and its provenance. */
export function RemusTrainingWindowSummary({scenario,time,status,reason,source,mode='athleteLight',testID}:Base & {
  scenario:WindowScenario;time:string;status:ConditionStatus;reason:string;source:string;
}) {
  const c=moleculePalette(mode);
  return <View testID={testID} style={[moleculeStyles.card,{backgroundColor:c.surface,borderColor:c.border}]}>
    <View style={styles.headingWrap}>
      <Text style={[moleculeStyles.title,styles.flexText,{color:c.text}]}>{scenario==='morning'?'Morning':scenario==='afternoon'?'Afternoon':'Adverse conditions'}</Text>
      <RemusConditionStatus status={status} mode={mode}/>
    </View>
    <Text style={[moleculeStyles.strong,{color:c.text}]}>{time}</Text>
    <Text style={[moleculeStyles.subtitle,{color:c.text}]}>{reason}</Text>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{source}</Text>
  </View>;
}

const styles=StyleSheet.create({
  flexContent:{flex:1,minWidth:0},
  flexText:{flexShrink:1},
  headingWrap:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:8},
  forecast:{width:176,minHeight:220,alignItems:'flex-start'},
  symbol:{width:52,height:52,borderWidth:2,borderRadius:26,alignItems:'center',justifyContent:'center'},
});
