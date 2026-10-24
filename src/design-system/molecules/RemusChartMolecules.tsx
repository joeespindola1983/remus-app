import React, { useId, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { type MoleculeMode, moleculePalette, moleculeStyles } from './moleculeStyle';
import {
  type ChartAxis, type ChartMetric, type ChartSelection, type ChartSession,
  chartFullRange, chartFormatDuration, chartFormatPace, chartMetricDefs,
  chartRangeSummary, chartResetRange, chartSelectSegment, chartSeriesPaths, chartNearestRow, chartInspectMetric,
  chartSetAxis, chartSetRange, chartToggleMetric, chartYDomain, createChartSelection,
} from './chartContract';

/** Golden Master v1.0-rc2: one plot for reading, independent navigator for range control. */
const PLOT_HEIGHT = 214;
const NAV_HEIGHT = 64;
const PLOT_LEFT = 39;
const PLOT_RIGHT = 8;
const PLOT_TOP = 9;
const PLOT_BOTTOM = 30;
const MIN_WIDTH = 160;

type Base = {mode?: MoleculeMode; testID?: string};
const dataMetrics: readonly ChartMetric[] = ['pace', 'speed', 'spm', 'hr'];
const seriesAccent = (metric: ChartMetric) => chartMetricDefs[metric].accent;

export function RemusUnifiedChart({session, selection, onSelectionChange, mode = 'athleteLight', density = 'detailed', testID}: Base & {
  session: ChartSession;
  selection?: ChartSelection;
  onSelectionChange?: (next: ChartSelection) => void;
  density?: 'compact' | 'standard' | 'detailed';
}) {
  const c = moleculePalette(mode);
  const clipId = `chart-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [local, setLocal] = useState<ChartSelection>(() => createChartSelection(session));
  const [width, setWidth] = useState(320);
  const [inspection, setInspection] = useState<number | null>(null);
  const drag = useRef<{kind: 'left' | 'right' | 'window'; origin: number; start: number; end: number} | null>(null);
  const state = selection ?? local;
  const full = chartFullRange(session);
  const duration = Math.max(1, full.end - full.start);
  const safeWidth = Math.max(MIN_WIDTH, width);
  const plotWidth = Math.max(40, safeWidth - PLOT_LEFT - PLOT_RIGHT);
  const plotHeight = PLOT_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const fromNavigatorX = (x: number) => full.start + Math.max(0, Math.min(1, x / safeWidth)) * duration;
  const setState = (next: ChartSelection) => {
    if (selection === undefined) {setLocal(next);}
    onSelectionChange?.(next);
    setInspection(null);
  };
  const domain = chartYDomain(session, state);
  const summary = chartRangeSummary(session, state);
  const left = safeWidth * ((state.start - full.start) / duration);
  const right = safeWidth * ((state.end - full.start) / duration);
  const selectedWidth = Math.max(0, right - left);
  const mainTitle = state.metrics.map(metric => chartMetricDefs[metric].label).join(' + ');
  const mainUnit = state.metrics.length === 1 ? chartMetricDefs[state.metrics[0]].unit : 'unidades na legenda';
  const visible = session.data.filter(row => row.t >= state.start && row.t <= state.end);
  const firstVisible = visible[0];
  const lastVisible = visible[visible.length - 1];
  const xStart = state.axis === 'time' ? (firstVisible?.t ?? state.start) : (firstVisible?.d ?? 0);
  const xEnd = state.axis === 'time' ? (lastVisible?.t ?? state.end) : (lastVisible?.d ?? 1);
  const xSpan = Math.max(0.000001, xEnd - xStart);
  const pointX = (time: number, distance: number) => plotWidth * ((state.axis === 'time' ? time : distance) - xStart) / xSpan;
  const positionAtTime = (time: number) => {
    const row = session.data.find(point => point.t >= time) ?? lastVisible;
    return row ? pointX(row.t, row.d) : 0;
  };
  const xDisplay = (fraction: number) => {
    if (state.axis === 'time') {return chartFormatDuration(xStart + fraction * xSpan - full.start);}
    return `${((xStart + fraction * xSpan) / 1000).toFixed(2)} km`;
  };
  const plotInspection = (event: GestureResponderEvent) => {
    const fraction = Math.max(0, Math.min(1, (event.nativeEvent.locationX - PLOT_LEFT) / plotWidth));
    setInspection(chartNearestRow(session, state, fraction)?.t ?? null);
  };
  const startNavigatorDrag = (event: GestureResponderEvent) => {
    const x = event.nativeEvent.locationX;
    const kind: 'left' | 'right' | 'window' =
      Math.abs(x - left) < 22 ? 'left' : Math.abs(x - right) < 22 ? 'right' : 'window';
    drag.current = {kind, origin: fromNavigatorX(x), start: state.start, end: state.end};
  };
  const moveNavigatorDrag = (event: GestureResponderEvent) => {
    const current = drag.current;
    if (!current) {return;}
    const target = fromNavigatorX(event.nativeEvent.locationX);
    if (current.kind === 'left') {setState(chartSetRange(state, session, target, current.end));}
    else if (current.kind === 'right') {setState(chartSetRange(state, session, current.start, target));}
    else {
      const delta = target - current.origin;
      setState(chartSetRange(state, session, current.start + delta, current.end + delta));
    }
  };
  const plotPaths = state.metrics.map(metric => (
    <React.Fragment key={metric}>
      {chartSeriesPaths(session, state, metric, plotWidth, plotHeight, domain).map((path, index) => (
        <Path key={`${metric}-${index}`} d={path} fill="none" stroke={seriesAccent(metric)}
          strokeWidth={state.primaryMetric === metric ? 2.4 : 1.7} strokeLinejoin="round"/>
      ))}
    </React.Fragment>
  ));
  const hrDots = state.metrics.includes('hr') ? (session.hrPoints ?? [])
    .filter(point => point.t >= state.start && point.t <= state.end)
    .map(point => <Circle key={`hr-${point.t}`} cx={pointX(point.t, point.d)}
      cy={plotHeight * (1 - (point.hr - domain.min) / Math.max(0.000001, domain.max - domain.min))}
      r={2.8} fill={seriesAccent('hr')}/>) : null;
  const miniSelection: ChartSelection = {...state, ...full, metrics: ['speed'], primaryMetric: 'speed', axis: 'time'};
  const miniDomain = chartYDomain(session, miniSelection);
  const miniPaths = chartSeriesPaths(session, miniSelection, 'speed', safeWidth, NAV_HEIGHT, miniDomain);
  const inspected = inspection === null ? null : session.data.find(row => row.t === inspection) ?? null;
  const cursorX = inspected ? pointX(inspected.t, inspected.d) : 0;
  const dark = mode.endsWith('Dark');
  const plotBackground = dark ? '#1A3433' : '#E9F7F4';
  const mutedGrid = dark ? '#35514D' : '#CDE3DF';
  const fullWindow = state.start <= full.start && state.end >= full.end;

  return <View testID={testID} style={[moleculeStyles.card, styles.chartCard,
    {borderColor: c.border, backgroundColor: c.surface}]}>
    <View style={styles.header}>
      <View style={styles.flexText}>
        <Text style={[moleculeStyles.title, {color: c.text}]}>{session.title}</Text>
        <Text style={[moleculeStyles.caption, {color: c.secondaryText}]}>{session.date}</Text>
      </View>
      <Text style={[styles.sourceLabel, {color: c.secondaryText}]} numberOfLines={2}>{session.sources.join(' · ')}</Text>
    </View>

    {density !== 'compact' ? <View style={styles.chipRow}>
      {dataMetrics.map(metric => <Pressable key={metric} testID={`chart-metric-${metric}`}
        accessibilityRole="button" accessibilityState={{selected: state.metrics.includes(metric)}}
        onPress={() => setState(chartToggleMetric(state, metric))}
        style={[styles.pill, {borderColor: state.metrics.includes(metric) ? seriesAccent(metric) : c.border,
          backgroundColor: state.metrics.includes(metric) ? c.mutedSurface : c.surface}]}>
        <View style={[styles.dot, {backgroundColor: seriesAccent(metric)}]}/>
        <Text style={[moleculeStyles.caption, {color: c.text}]}>{chartMetricDefs[metric].label}</Text>
      </Pressable>)}
    </View> : null}

    <View style={styles.axesRow}>
      <Text style={[moleculeStyles.caption, {color: c.secondaryText}]}>Eixo X</Text>
      <View style={styles.axisGroup}>
        {(['time', 'distance'] as ChartAxis[]).map(axis => <Pressable key={axis}
          onPress={() => setState(chartSetAxis(state, axis))} testID={`chart-axis-${axis}`}
          accessibilityRole="button" accessibilityState={{selected: state.axis === axis}}
          style={[styles.axisButton, {borderColor: state.axis === axis ? c.primary : c.border,
            backgroundColor: state.axis === axis ? c.mutedSurface : c.surface}]}>
          <Text style={[moleculeStyles.caption, {color: c.text}]}>{axis === 'time' ? 'Tempo' : 'Distância'}</Text>
        </Pressable>)}
      </View>
    </View>

    {density === 'detailed' ? <View style={styles.statGrid}>
      {[
        ['SPM MÉDIO', summary.spm === null ? '—' : summary.spm.toFixed(1)],
        ['RITMO MÉDIO', chartFormatPace(summary.pace)],
        ['DISTÂNCIA', `${(summary.distance / 1000).toFixed(2)} km`],
        ['DURAÇÃO', chartFormatDuration(summary.duration)],
      ].map(([label, value]) => <View key={label} style={[styles.stat, {backgroundColor: c.mutedSurface}]}>
        <Text style={[styles.statLabel, {color: c.secondaryText}]}>{label}</Text>
        <Text style={[styles.statValue, {color: c.text}]} numberOfLines={2}>{value}</Text>
      </View>)}
    </View> : null}

    <View style={[styles.chartFrame, {borderColor: c.border}]}>
      <View style={styles.chartHeading}>
        <Text style={[styles.chartHeadingText, {color: c.text}]}>{mainTitle.toUpperCase()}</Text>
        <Text style={[styles.chartUnit, {color: c.secondaryText}]}>{mainUnit}</Text>
      </View>
      <View style={styles.legendRow}>
        {state.metrics.map(metric => <View key={metric} style={styles.legendItem}>
          <View style={[styles.dot, {backgroundColor: seriesAccent(metric)}]}/>
          <Text style={[styles.legendText, {color: c.secondaryText}]}>{chartMetricDefs[metric].label} · {chartMetricDefs[metric].unit}</Text>
        </View>)}
      </View>
      <View testID="chart-main-plot" style={styles.plotViewport}
        onLayout={event => setWidth(Math.max(MIN_WIDTH, event.nativeEvent.layout.width))}
        onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
        onResponderGrant={plotInspection} onResponderMove={plotInspection}
        accessible accessibilityLabel={`Gráfico ${mainTitle}, de ${chartFormatDuration(state.start - full.start)} a ${chartFormatDuration(state.end - full.start)}. Escala Y automática.`}>
        <Svg width="100%" height={PLOT_HEIGHT} viewBox={`0 0 ${safeWidth} ${PLOT_HEIGHT}`}>
          <Defs><ClipPath id={clipId}><Rect width={plotWidth} height={plotHeight}/></ClipPath></Defs>
          <G transform={`translate(${PLOT_LEFT},${PLOT_TOP})`}>
            <Rect x={0} y={0} width={plotWidth} height={plotHeight} fill={plotBackground}/>
            <G clipPath={`url(#${clipId})`}>
              {session.segments.filter(segment => segment.end >= state.start && segment.start <= state.end).map(segment => {
                const x = Math.max(0, Math.min(plotWidth, positionAtTime(segment.start)));
                const end = Math.max(x, Math.min(plotWidth, positionAtTime(segment.end)));
                return <Rect key={segment.id} x={x} y={0} width={end - x} height={plotHeight}
                  fill={c.accent} opacity={0.09}/>;
              })}
              {[0, 0.25, 0.5, 0.75, 1].map(fraction => <Line key={`grid-${fraction}`} x1={0} x2={plotWidth}
                y1={plotHeight * fraction} y2={plotHeight * fraction} stroke={mutedGrid} strokeWidth={0.75}/>)}
              {plotPaths}
              {hrDots}
              {inspected && inspection !== null && inspection >= state.start && inspection <= state.end ?
                <Line x1={cursorX} x2={cursorX} y1={0} y2={plotHeight} stroke={c.secondaryText} strokeWidth={1}/>:null}
            </G>
            {[0, 0.25, 0.5, 0.75, 1].map(fraction => <SvgText key={`tick-${fraction}`}
              x={-6} y={plotHeight * fraction + 3} fontSize={9} fill={c.secondaryText} textAnchor="end">
              {(domain.max - (domain.max - domain.min) * fraction).toFixed(domain.max <= 12 ? 1 : 0)}
            </SvgText>)}
            {[0, 0.5, 1].map(fraction => <SvgText key={`x-${fraction}`} x={plotWidth * fraction}
              y={plotHeight + 17} fontSize={9} fill={c.secondaryText}
              textAnchor={fraction === 0 ? 'start' : fraction === 1 ? 'end' : 'middle'}>{xDisplay(fraction)}</SvgText>)}
          </G>
        </Svg>
      </View>
      {inspected ? <View style={[styles.inspection, {borderTopColor: c.border}]}>
        <Text style={[styles.inspectionText, {color: c.text}]}>{chartFormatDuration(inspected.t - full.start)} · {(inspected.d / 1000).toFixed(2)} km</Text>
        {state.metrics.map(metric => <Text key={metric} style={[styles.inspectionText, {color: seriesAccent(metric)}]}>
          {chartMetricDefs[metric].label}: {chartInspectMetric(session, inspected, metric)}
        </Text>)}
      </View> : null}
    </View>

    <View style={styles.navigatorHeader}>
      <Text style={[styles.navigatorTitle, {color: c.secondaryText}]}>TIMELINE NAVIGATOR</Text>
      <Pressable onPress={() => setState(chartResetRange(state, session))} testID="chart-reset"
        accessibilityRole="button" accessibilityLabel="Voltar ao treino inteiro">
        <Text style={[styles.navigatorReset, {color: c.primary}]}>↺ {fullWindow ? 'Treino inteiro' : 'Restaurar zoom'}</Text>
      </Pressable>
    </View>
    <View testID="chart-navigator" style={styles.navigatorViewport}
      onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
      onResponderGrant={startNavigatorDrag} onResponderMove={moveNavigatorDrag}
      onResponderRelease={() => {drag.current = null;}}
      accessible accessibilityLabel="Navegador de intervalo. Arraste extremidades para redimensionar ou o centro para mover.">
      <Svg width="100%" height={NAV_HEIGHT} viewBox={`0 0 ${safeWidth} ${NAV_HEIGHT}`}>
        <Rect x={0} y={0} width={safeWidth} height={NAV_HEIGHT} fill={c.mutedSurface}/>
        {miniPaths.map((path, index) => <Path key={`nav-${index}`} d={path} stroke={c.accent}
          strokeWidth={1.4} fill="none"/>)}
        <Rect x={0} y={0} width={left} height={NAV_HEIGHT} fill={c.background} opacity={0.68}/>
        <Rect x={right} y={0} width={Math.max(0, safeWidth - right)} height={NAV_HEIGHT}
          fill={c.background} opacity={0.68}/>
        <Rect x={left} y={0} width={selectedWidth} height={NAV_HEIGHT} fill={c.accent} opacity={0.13}/>
        <Rect x={left} y={0} width={4} height={NAV_HEIGHT} fill={c.primary}/>
        <Rect x={Math.max(0, right - 4)} y={0} width={4} height={NAV_HEIGHT} fill={c.primary}/>
      </Svg>
    </View>
    <View style={styles.navigatorFooter}>
      <Text style={[styles.navigatorTime, {color: c.secondaryText}]}>{chartFormatDuration(state.start - full.start)}</Text>
      <Text style={[styles.navigatorTime, {color: c.secondaryText}]}>{chartFormatDuration(state.end - full.start)}</Text>
    </View>
    {density !== 'compact' ? <View style={styles.navigatorActions}>
      <Pressable accessibilityRole="button" accessibilityLabel="Mover seleção 30 segundos para trás"
        onPress={() => setState(chartSetRange(state, session, state.start - 30, state.end - 30))}>
        <Text style={[styles.navigatorReset, {color: c.primary}]}>← 30s</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Mover seleção 30 segundos para frente"
        onPress={() => setState(chartSetRange(state, session, state.start + 30, state.end + 30))}>
        <Text style={[styles.navigatorReset, {color: c.primary}]}>30s →</Text>
      </Pressable>
    </View> : null}
    {density === 'detailed' ? <ScrollView horizontal showsHorizontalScrollIndicator={false}
      accessibilityLabel="Segmentos do treino">
      <View style={styles.chipRow}>
        {session.segments.map(segment => <Pressable key={segment.id} testID={`chart-segment-${segment.id}`}
          accessibilityRole="button" accessibilityState={{selected: state.activeSegment === segment.id}}
          onPress={() => setState(chartSelectSegment(state, session, segment.id))}
          style={[styles.segmentChip, {borderColor: state.activeSegment === segment.id ? c.primary : c.border}]}>
          <Text style={[moleculeStyles.caption, {color: c.text}]}>{segment.label}</Text>
        </Pressable>)}
      </View>
    </ScrollView> : null}
  </View>;
}

/** All densities share the same selection contract, source and plot renderer. */
export function RemusUnifiedDetailedChart(props: Parameters<typeof RemusUnifiedChart>[0]) {
  return <RemusUnifiedChart {...props} density="detailed"/>;
}

/** Figma 342:126. A date rail selects a contextual date, not an arbitrary chart range. */
export function RemusForecastDateRail({dates,selected,onSelect,mode='athleteLight',testID}:Base & {
  dates:readonly {id:string;label:string;detail:string}[];selected:string;onSelect?:(id:string)=>void;
}) {
  const c=moleculePalette(mode);
  return <ScrollView testID={testID} horizontal showsHorizontalScrollIndicator={false}>
    <View style={moleculeStyles.wrap}>
      {dates.map(d=><Pressable key={d.id} accessibilityRole="button" accessibilityState={{selected:selected===d.id}}
        onPress={()=>onSelect?.(d.id)} style={[styles.date,{borderColor:selected===d.id?c.primary:c.border}]}>
        <Text style={[moleculeStyles.title,{color:c.text}]}>{d.label}</Text>
        <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{d.detail}</Text>
      </Pressable>)}
    </View>
  </ScrollView>;
}

export type WeatherMetric='overview'|'wind'|'rain'|'humidity'|'temperature';
/** Figma 362:7571 — native compact metric selector. */
export function RemusWeatherMetricDropdown({metric,expanded=false,onSelect,onToggle,mode='athleteLight',testID}:Base & {
  metric:WeatherMetric;expanded?:boolean;onSelect?:(v:WeatherMetric)=>void;onToggle?:()=>void;
}) {
  const c=moleculePalette(mode);
  const options:WeatherMetric[]=['overview','wind','rain','humidity','temperature'];
  return <View testID={testID} style={[moleculeStyles.card,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Pressable accessibilityRole="button" accessibilityLabel="Métrica meteorológica" onPress={onToggle}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>{metric.toUpperCase()} {expanded?'⌃':'⌄'}</Text>
    </Pressable>
    {expanded?<View style={moleculeStyles.wrap}>{options.map(option=><Pressable key={option}
      accessibilityRole="button" accessibilityState={{selected:metric===option}} onPress={()=>onSelect?.(option)}
      style={[styles.pill,{borderColor:metric===option?c.primary:c.border}]}>
      <Text style={[moleculeStyles.caption,{color:c.text}]}>{option}</Text>
    </Pressable>)}</View>:null}
  </View>;
}

/** Figma 364:7682. Twelve-hour weather blocks are provided, not synthesized. */
export function RemusTwelveHourConditionsChart({points,mode='athleteLight',testID}:Base & {
  points:readonly {hour:string;temperature:number;label:string}[];
}) {
  const c=moleculePalette(mode);
  const values=points.map(p=>p.temperature);
  const min=values.length?Math.min(...values):0;const max=values.length?Math.max(...values):1;
  return <View testID={testID} style={[moleculeStyles.card,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Text style={[moleculeStyles.title,{color:c.text}]}>12-hour conditions</Text>
    <View style={moleculeStyles.row}>
      {points.map((p,i)=><View key={`${p.hour}-${i}`} style={styles.weatherColumn}>
        <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{p.hour}</Text>
        <View style={[styles.bar,makeBarStyle(p.temperature,min,max,c.accent)]}/>
        <Text style={[moleculeStyles.caption,{color:c.text}]}>{p.label}</Text>
      </View>)}
    </View>
  </View>;
}

const makeBarStyle=(temperature:number,min:number,max:number,color:string)=>({
  height:20+40*(temperature-min)/Math.max(1,max-min),backgroundColor:color,
});

const styles = StyleSheet.create({
  chartCard:{gap:12,overflow:'hidden'},
  header:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',gap:8,minWidth:0},
  flexText:{flex:1,minWidth:0},
  sourceLabel:{fontSize:10,lineHeight:14,textAlign:'right',flexShrink:1,maxWidth:'45%'},
  chipRow:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:7},
  dot:{width:7,height:7,borderRadius:4},
  pill:{borderWidth:1,borderRadius:999,paddingVertical:7,paddingHorizontal:9,flexDirection:'row',gap:5,alignItems:'center'},
  axesRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8},
  axisGroup:{flexDirection:'row',alignItems:'center',gap:6},
  axisButton:{borderWidth:1,borderRadius:8,paddingHorizontal:13,paddingVertical:7},
  statGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  stat:{flexBasis:'46%',flexGrow:1,minWidth:0,borderRadius:8,padding:9,gap:4},
  statLabel:{fontSize:10,lineHeight:14,fontWeight:'600'},
  statValue:{fontSize:18,lineHeight:24,fontWeight:'700',fontVariant:['tabular-nums']},
  chartFrame:{borderWidth:1,borderRadius:10,overflow:'hidden'},
  chartHeading:{paddingHorizontal:10,paddingTop:9,flexDirection:'row',justifyContent:'space-between',flexWrap:'wrap',gap:6},
  chartHeadingText:{fontSize:11,lineHeight:15,fontWeight:'600',flexShrink:1},
  chartUnit:{fontSize:10,lineHeight:15},
  legendRow:{flexDirection:'row',flexWrap:'wrap',gap:8,paddingHorizontal:10,paddingVertical:8},
  legendItem:{flexDirection:'row',alignItems:'center',gap:4},
  legendText:{fontSize:9,lineHeight:13},
  plotViewport:{width:'100%'},
  inspection:{flexDirection:'row',flexWrap:'wrap',gap:8,padding:8,borderTopWidth:1},
  inspectionText:{fontSize:11,lineHeight:16},
  navigatorHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'},
  navigatorTitle:{fontSize:10,lineHeight:14,fontWeight:'600'},
  navigatorReset:{fontSize:11,lineHeight:16,fontWeight:'600'},
  navigatorViewport:{width:'100%',minHeight:NAV_HEIGHT},
  navigatorFooter:{flexDirection:'row',justifyContent:'space-between'},
  navigatorTime:{fontSize:10,lineHeight:14,fontVariant:['tabular-nums']},
  navigatorActions:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:12},
  segmentChip:{borderWidth:1,borderRadius:999,paddingHorizontal:10,paddingVertical:8},
  date:{minWidth:84,borderWidth:1,borderRadius:10,padding:10,gap:4},
  weatherColumn:{flex:1,minWidth:34,alignItems:'center',justifyContent:'flex-end',gap:6},
  bar:{width:12,borderRadius:4},
});
