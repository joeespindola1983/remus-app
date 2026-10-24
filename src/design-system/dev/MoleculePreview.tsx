/** Debug-only QA gallery for Figma Molecules 20–23. All values are explicitly simulated. */
import React, { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type DesignColorMode } from '../tokens';
import { moleculePalette, moleculeStyles } from '../molecules/moleculeStyle';
import {
  RemusMetricTile, RemusActivitySummaryCard, RemusMediaThumbnail, RemusEngagementBar,
  RemusShareFormat, RemusActivityOverlay, RemusBoatMarker, RemusNearbyBoatCard,
  RemusMapControlStack, RemusActivityFilterBar, RemusSettingsRow, type ShareFormat,
} from '../molecules/RemusDataMolecules';
import {
  RemusDailyForecast, RemusWindSummary, RemusTrainingWindow,
  RemusWeatherAlert, RemusLocationContext, RemusTrainingWindowSummary,
} from '../molecules/RemusWeatherMolecules';
import {
  RemusSourceStatusRow, RemusArtifactPartProgress, RemusActivityMatchCard,
  RemusRecordingRangeControl, RemusPermissionReadinessRow,
  RemusOperationalEventBanner, RemusResourcePressureCard,
  RemusFinalizationStatusRow, RemusLiveMetricCell,
} from '../molecules/RemusCaptureMolecules';
import {
  RemusUnifiedChart, RemusUnifiedDetailedChart, RemusForecastDateRail,
  RemusWeatherMetricDropdown, RemusTwelveHourConditionsChart,
  type WeatherMetric,
} from '../molecules/RemusChartMolecules';
import { chartSelectSegment, createChartSelection, type ChartSelection } from '../molecules/chartContract';
import { goldenChartSession } from './goldenChartFixture';
import { goldenChartSummaryFixture } from './goldenChartSummaryFixture';

type Tab='data'|'weather'|'capture'|'charts';
const tabs:readonly {id:Tab;label:string}[]=[
  {id:'data',label:'Data Display'}, {id:'weather',label:'Weather'},
  {id:'capture',label:'Capture'}, {id:'charts',label:'Charts'},
];

/** Frozen recorded session comes from the canonical Golden Master HTML. */
export const sampleChartSession = goldenChartSession;

export function MoleculePreview({mode}: {mode:DesignColorMode}){
  const c=moleculePalette(mode);
  const [tab,setTab]=useState<Tab>('data');
  const [last,setLast]=useState('Nenhuma ação');
  const [format,setFormat]=useState<ShareFormat>('story');
  const [filter,setFilter]=useState<'all'|'training'>('all');
  const [settings,setSettings]=useState(false);
  const [liked,setLiked]=useState(false);
  const [saved,setSaved]=useState(false);
  const [date,setDate]=useState('today');
  const [weatherMetric,setWeatherMetric]=useState<WeatherMetric>('overview');
  const [weatherExpanded,setWeatherExpanded]=useState(false);
  const [selection,setSelection]=useState<ChartSelection>(()=>chartSelectSegment(createChartSelection(sampleChartSession),sampleChartSession,'piece1'));
  // QA-only: production callers pass a precomputed summary received from an engine/data source.
  const chartSummary = goldenChartSummaryFixture(sampleChartSession, selection);
  const press=(text:string)=>()=>setLast(text);
  const sample=(name:string,content:ReactNode)=><View style={[styles.sample,{borderColor:c.border}]}>
    <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{name}</Text>
    {content}
  </View>;

  return <View style={styles.container}>
    <View style={[styles.tabs,{borderBottomColor:c.border}]}>
      {tabs.map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityState={{selected:tab===item.id}}
        testID={`molecules-tab-${item.id}`} onPress={()=>setTab(item.id)}
        style={[styles.tab,{borderBottomColor:tab===item.id?c.primary:c.border}]}>
        <Text style={[moleculeStyles.caption,{color:tab===item.id?c.primary:c.text}]}>{item.label}</Text>
      </Pressable>)}
    </View>
    <ScrollView testID="molecule-preview" style={styles.scroll}
      contentContainerStyle={styles.content}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>Moléculas · Figma 20–23</Text>
      <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>
        Apenas QA. As moléculas usam mocks; Charts usa a sessão real congelada do Golden Master. Sem conexão com backend, GPS ou firmware.
      </Text>
      {tab==='data'?<View style={styles.section}>
        {sample('01 · Metric Tile',<View style={moleculeStyles.wrap}>
          <RemusMetricTile label="PACE" value="2:08" unit="/500m" mode={mode}/>
          <RemusMetricTile label="SPM" value="28" unit="spm" size="regular" mode={mode}/>
        </View>)}
        {sample('02 · Activity Summary Card',<RemusActivitySummaryCard title="Remada matinal" date="24 out"
          distance="12.4 km" duration="42:00" pace="2:08" mode={mode} onPress={press('Activity Summary')}/>)}
        {sample('03 · Media Thumbnail',<View style={moleculeStyles.wrap}>
          <RemusMediaThumbnail mode={mode} media="photo"/><RemusMediaThumbnail mode={mode} media="video"/>
        </View>)}
        {sample('04 · Engagement Bar',<RemusEngagementBar likes={128+(liked?1:0)} comments={24} liked={liked}
          saved={saved} onLike={()=>setLiked(v=>!v)} onSave={()=>setSaved(v=>!v)}
          onShare={press('Compartilhar')} onComment={press('Comentar')} mode={mode}/>)}
        {sample('05 · Share Format',<View style={moleculeStyles.wrap}>
          {(['story','post','reel'] as ShareFormat[]).map(f=><RemusShareFormat key={f} format={f}
            selected={format===f} onPress={()=>setFormat(f)} mode={mode}/>)}
        </View>)}
        {sample('06 · Activity Overlay',<RemusActivityOverlay title="REMUS · MORNING ROW" summary="12.4 km · 42 min"
          style="metrics" detail="Avg 28 SPM · Pace 2:08"/>)}
        {sample('07 · Boat Marker',<View style={moleculeStyles.wrap}>
          {(['nearby','self','selected','stale'] as const).map(s=><RemusBoatMarker key={s} status={s}
            heading={45} label="1x" mode={mode} onPress={press(`Boat ${s}`)}/>)}
        </View>)}
        {sample('08 · Nearby Boat Card',<RemusNearbyBoatCard name="Marina Costa" detail="Single scull · 180 m · N"
          mode={mode} onPress={press('Nearby boat')}/>)}
        {sample('09 · Map Control Stack',<RemusMapControlStack mode={mode} onCenter={press('Center')}
          onNearby={press('Nearby')} onMapView={press('Map view')}/>)}
        {sample('10 · Activity Filter Bar',<RemusActivityFilterBar mode={mode} selected={filter} onChange={setFilter}/>)}
        {sample('11 · Settings Row',<View style={styles.section}>
          <RemusSettingsRow title="Notifications" detail="Workout alerts" accessory="toggle" value={settings}
            onValueChange={setSettings} mode={mode}/>
          <RemusSettingsRow title="Display" detail="Chart preferences" accessory="chevron" mode={mode}
            onPress={press('Display settings')}/>
        </View>)}
      </View>:null}
      {tab==='weather'?<View style={styles.section}>
        {sample('01 · Daily Forecast',<RemusDailyForecast day="Sat" temperature="24°C" detail="Sunny · example"
          status="best" mode={mode}/>)}
        {sample('02 · Wind Summary',<RemusWindSummary value="NW · 12 km/h" detail="Gusts up to 18 km/h" mode={mode}/>)}
        {sample('03 · Training Window',<RemusTrainingWindow time="06:00–08:00" description="Morning conditions"
          status="good" mode={mode} onPress={press('Training Window')}/>)}
        {sample('04 · Weather Alert',<View style={styles.section}>
          <RemusWeatherAlert title="Wind warning" detail="Check conditions before training" mode={mode}/>
          <RemusWeatherAlert title="Not recommended" severity="critical" detail="Severe weather example" mode={mode}/>
        </View>)}
        {sample('05 · Location Context',<RemusLocationContext location="Lago Paranoá" freshness="Updated 4 min ago · simulated" mode={mode}/>)}
        {sample('06 · Training Window Summary',<View style={styles.section}>
          <RemusTrainingWindowSummary scenario="morning" time="06:00–08:00" status="best"
            reason="Better conditions in the morning" source="Fictitious example" mode={mode}/>
          <RemusTrainingWindowSummary scenario="adverse" time="Avoid this interval" status="notRecommended"
            reason="High wind in the demonstration" source="Fictitious example" mode={mode}/>
        </View>)}
      </View>:null}
      {tab==='capture'?<View style={styles.section}>
        {sample('01 · Source Status Row',<View style={styles.section}>
          {([
            {state:'ready',source:'rbp1',name:'Remus Blade P1'},
            {state:'recording',source:'phone',name:'Celular'},
            {state:'interrupted',source:'watch',name:'Relógio'},
            {state:'syncing',source:'instrument',name:'Instrumento'},
          ] as const).map(item=><RemusSourceStatusRow key={item.state}
            name={item.name} detail="GPS · IMU · 92%" source={item.source} state={item.state} mode={mode}/>)}
        </View>)}
        {sample('02 · Artifact Part Progress',<View style={styles.section}>
          <RemusArtifactPartProgress state="transferring" percent={68} detail="IMU 3/5 · 68%" mode={mode}/>
          <RemusArtifactPartProgress state="verified" percent={100} detail="All parts verified" mode={mode}/>
        </View>)}
        {sample('03 · Activity Match Card',<RemusActivityMatchCard title="Remada · Hoje, 06:14"
          detail="Sobreposição de 42 min · mesma rota" state="suggested" mode={mode} onPress={press('Activity Match')}/>)}
        {sample('04 · Recording Range Control',<View style={styles.section}>
          <RemusRecordingRangeControl range="05:58–07:02 · 1h04" mode="whole" coverage={100} designMode={mode}/>
          <RemusRecordingRangeControl range="06:10–06:40 · 30 min" mode="phoneBounded" coverage={46} designMode={mode}/>
        </View>)}
        {sample('05 · Permission Readiness Row',<View style={styles.section}>
          {(['granted','required','blocked'] as const).map(s=><RemusPermissionReadinessRow key={s}
            state={s} name="Location while recording" mode={mode} onPress={press(`Permission ${s}`)}/>)}
        </View>)}
        {sample('06 · Operational Event Banner',<View style={styles.section}>
          {(['information','warning','critical','recovered'] as const).map(s=><RemusOperationalEventBanner key={s}
            tone={s} title="Watch disconnected" detail="Activity continues with other sources" mode={mode}/>)}
        </View>)}
        {sample('07 · Resource Pressure Card',<View style={styles.section}>
          <RemusResourcePressureCard name="Phone storage" detail="1.4 GB available (example)" resource="storage"
            severity="warning" percent={35} mode={mode}/>
          <RemusResourcePressureCard name="Phone storage" detail="Storage insufficient" resource="storage"
            severity="blocking" percent={8} mode={mode}/>
        </View>)}
        {sample('08 · Finalization Status Row',<View style={styles.section}>
          {(['pending','finalized','interrupted','unavailable'] as const).map(s=><RemusFinalizationStatusRow
            key={s} name="Remus Black Box" state={s} mode={mode}/>)}
        </View>)}
        {sample('09 · Live Metric Cell',<View style={moleculeStyles.wrap}>
          <RemusLiveMetricCell label="VOGA" value="28" unit="SPM" mode={mode}/>
          <RemusLiveMetricCell label="DISTÂNCIA" value="1.42" unit="KM" orientation="landscape" mode={mode}/>
        </View>)}
      </View>:null}
      {tab==='charts'?<View style={styles.section}>
        <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>
          Golden Master v1.0-rc2 · sessão real de referência (17 set 2026) · QA funcional, sem homologação de gestos.
        </Text>
        {sample('01 · Unified Detailed Chart',<RemusUnifiedDetailedChart session={sampleChartSession}
          selection={selection} summary={chartSummary} onSelectionChange={setSelection} mode={mode} testID="molecule-unified-detailed"/>)}
        {sample('02 · Unified Chart (Compact / Standard)',<RemusUnifiedChart session={sampleChartSession}
          selection={selection} summary={chartSummary} onSelectionChange={setSelection} density="compact" mode={mode}/>)}
        {sample('03 · Forecast Date Rail',<RemusForecastDateRail dates={[
          {id:'yesterday',label:'Yesterday',detail:'23 Oct'}, {id:'today',label:'Today',detail:'24 Oct'},
          {id:'tomorrow',label:'Tomorrow',detail:'25 Oct'},
        ]} selected={date} onSelect={setDate} mode={mode}/>)}
        {sample('04 · Weather Metric Dropdown',<RemusWeatherMetricDropdown metric={weatherMetric}
          expanded={weatherExpanded} onToggle={()=>setWeatherExpanded(v=>!v)} onSelect={setWeatherMetric} mode={mode}/>)}
        {sample('05 · 12-Hour Conditions Chart',<RemusTwelveHourConditionsChart
          points={[{hour:'06',temperature:21,label:'21°'},{hour:'08',temperature:23,label:'23°'},
            {hour:'10',temperature:24,label:'24°'},{hour:'12',temperature:25,label:'25°'}]} mode={mode}/>)}
      </View>:null}
      <Text testID="molecule-last-action" style={[moleculeStyles.caption,{color:c.secondaryText}]}>
        Última ação simulada: {last}
      </Text>
    </ScrollView>
  </View>;
}

const styles=StyleSheet.create({
  container:{flex:1},scroll:{flex:1},content:{padding:16,paddingBottom:44,gap:12},
  tabs:{flexDirection:'row',borderBottomWidth:1},
  tab:{flex:1,alignItems:'center',justifyContent:'center',paddingVertical:12,borderBottomWidth:2},
  section:{gap:16},sample:{borderWidth:1,borderRadius:12,padding:12,gap:12},
});
