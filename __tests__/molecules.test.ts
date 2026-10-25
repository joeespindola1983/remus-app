import { goldenChartSession } from '../src/design-system/dev/goldenChartFixture';
import { goldenChartSummaryFixture } from '../src/design-system/dev/goldenChartSummaryFixture';
import { clampPercent, moleculeGeometry, moleculePalette, semanticProgress, toneColor } from '../src/design-system/molecules/moleculeStyle';
import {
  chartFullRange, chartToggleMetric, chartSetAxis, chartSetRange, chartSelectSegment,
  chartResetRange, chartYDomain, chartSummaryForSelection, chartSeriesPaths, createChartSelection,
  chartFormatPace, chartFormatDuration, chartMetricValue, chartNearestRow, chartInspectMetric,
  chartSelectionForSession,
  type ChartSession,
} from '../src/design-system/molecules/chartContract';

const activity:ChartSession={
  id:'test-activity',
  title:'Test',date:'Now',sources:['Mock'],
  data:Array.from({length:31},(_,i)=>({
    t:i*15,d:i*10,speed:i===10?null:5+i*.25,pace:i===10?null:210-i,
    spm:i===10?null:20+i*.1,hr:null,
  })),
  hrPoints:[{t:60,d:40,hr:142},{t:300,d:200,hr:155}],
  segments:[{id:'sprint',label:'Sprint',kind:'sprint',start:100,end:210,note:'simulated'}],
};

describe('Remus Molecules — shared semantics',()=>{
  it('keeps the canonical display footprints from the Figma library',()=>{
    expect(moleculeGeometry.metricCompact).toBe(144);
    expect(moleculeGeometry.metricRegular).toBe(148);
    expect(moleculeGeometry.sourceRowHeight).toBe(76);
    expect(moleculeGeometry.cardRadius).toBe(16);
  });
  it('clamps progress without inventing missing percentages',()=>{
    expect(clampPercent(-20)).toBe(0);
    expect(clampPercent(160)).toBe(100);
    expect(clampPercent(Number.NaN)).toBe(0);
    expect(semanticProgress(4,0)).toBe(0);
    expect(semanticProgress(25,100)).toBe(25);
  });
  it('resolves semantic tones in all supported themes',()=>{
    (['athleteLight','athleteDark','adminLight','adminDark'] as const).forEach(mode=>{
      const p=moleculePalette(mode);
      expect(p.mutedSurface).toMatch(/^#[0-9A-Fa-f]{6}$/);
      (['neutral','primary','success','warning','critical','accent'] as const).forEach(tone=>{
        expect(toneColor(tone,mode)).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});

describe('REMUS Golden Master — canonical chart contract',()=>{
  it('starts with one metric and the entire session range',()=>{
    const selection=createChartSelection(activity);
    expect(selection).toEqual({axis:'time',metrics:['speed'],primaryMetric:'speed',start:0,end:450,activeSegment:null});
  });
  it('keeps local selection for the same session and resets it for a new session',()=>{
    const selected=chartSelectSegment(createChartSelection(activity),activity,'sprint');
    const local={sessionId:activity.id,selection:selected};
    expect(chartSelectionForSession(local,{...activity})).toBe(local);

    const nextSession={...activity,id:'next-activity',data:activity.data.slice(0,11)};
    expect(chartSelectionForSession(local,nextSession)).toEqual({
      sessionId:'next-activity',
      selection:{axis:'time',metrics:['speed'],primaryMetric:'speed',start:0,end:150,activeSegment:null},
    });
  });
  it('keeps at least one metric and gives newest overlay primary focus',()=>{
    const original=createChartSelection(activity);
    expect(chartToggleMetric(original,'speed')).toEqual(original);
    const withPace=chartToggleMetric(original,'pace');
    expect(withPace.metrics).toEqual(['speed','pace']);
    expect(withPace.primaryMetric).toBe('pace');
    const removed=chartToggleMetric(withPace,'pace');
    expect(removed.metrics).toEqual(['speed']);
    expect(removed.primaryMetric).toBe('speed');
  });
  it('keeps the physical selected range when switching Time / Distance',()=>{
    const selected=chartSetRange(createChartSelection(activity),activity,100,250);
    const distance=chartSetAxis(selected,'distance');
    expect(distance.axis).toBe('distance');
    expect(distance.start).toBe(selected.start);
    expect(distance.end).toBe(selected.end);
  });
  it('selects segments using same range state and resets the complete session',()=>{
    const changed=chartSelectSegment(createChartSelection(activity),activity,'sprint');
    expect(changed.start).toBe(100);
    expect(changed.end).toBe(210);
    expect(changed.activeSegment).toBe('sprint');
    const reset=chartResetRange(changed,activity);
    expect(reset.activeSegment).toBe(null);
    expect(reset.start).toBe(chartFullRange(activity).start);
    expect(reset.end).toBe(chartFullRange(activity).end);
  });
  it('enforces a minimum selected duration and clamps to the actual activity',()=>{
    const s=chartSetRange(createChartSelection(activity),activity,-200,2);
    expect(s.start).toBe(0);
    expect(s.end).toBe(202); // 202-second physical span, clamped against session start
    const small=chartSetRange(createChartSelection(activity),activity,400,401);
    expect(small.end-small.start).toBe(12);
    expect(small.end).toBeLessThanOrEqual(450);
  });
  it('computes contextual summary without treating gaps as zeros',()=>{
    const range=chartSetRange(createChartSelection(activity),activity,15,45);
    const sum=goldenChartSummaryFixture(activity,range);
    expect(sum.durationSeconds).toBe(30);
    expect(sum.distanceMeters).toBe(20);
    expect(sum.averageSpm).toBeGreaterThan(20);
    expect(sum.averageSplitSecondsPer500m).toBeGreaterThan(0);
    expect(chartSummaryForSelection(range,sum)).toBe(sum);
  });
  it('uses local single metric Y scale but 0-based shared multi-metric domain',()=>{
    const single=chartYDomain(activity,createChartSelection(activity));
    expect(single.min).toBeGreaterThan(0);
    const multi=chartYDomain(activity,chartToggleMetric(createChartSelection(activity),'pace'));
    expect(multi.min).toBe(0);
    expect(multi.max).toBeGreaterThan(0);
  });
  it('never draws paths across missing telemetry values',()=>{
    const selection=createChartSelection(activity);
    const pieces=chartSeriesPaths(activity,selection,'speed',220,96);
    expect(pieces).toHaveLength(2);
    expect(pieces[0]).toMatch(/^M /);
    expect(pieces[1]).toMatch(/^M /);
    expect(chartMetricValue(activity.data[10],'speed',false)).toBe(null);
    expect(chartMetricValue(activity.data[10],'pace',false)).toBe(null);
  });
  it('preserves sparse HR observations as independent evidence in Y scaling',()=>{
    const sel=chartToggleMetric(createChartSelection(activity),'hr');
    const domain=chartYDomain(activity,sel);
    expect(domain.max).toBeGreaterThan(155);
    expect(activity.hrPoints).toHaveLength(2);
  });
  it('inspects the physical row through Time or Distance projection and exposes missing values',()=>{
    const original=createChartSelection(activity);
    expect(chartNearestRow(activity,original,0)?.t).toBe(0);
    expect(chartNearestRow(activity,chartSetAxis(original,'distance'),1)?.d).toBe(300);
    expect(chartInspectMetric(activity,activity.data[10],'speed')).toBe('—');
    expect(chartInspectMetric(activity,activity.data[4],'hr')).toBe('142 bpm');
    expect(chartInspectMetric(activity,activity.data[5],'hr')).toBe('—');
  });

  it('accepts only summaries matching the shared selection, never stale engine responses', () => {
    const first=chartSelectSegment(createChartSelection(activity),activity,'sprint');
    const result=goldenChartSummaryFixture(activity,first);
    expect(chartSummaryForSelection(first,result)).toBe(result);
    expect(chartSummaryForSelection(chartSetAxis(first,'distance'),result)).toBe(result);
    expect(chartSummaryForSelection(chartToggleMetric(first,'pace'),result)).toBe(result);
    const moved=chartSetRange(first,activity,130,230);
    expect(chartSummaryForSelection(moved,result)).toBe(null);
    expect(chartSummaryForSelection(moved,null)).toBe(null);
    expect(chartSummaryForSelection(moved,undefined)).toBe(null);
  });
  it('formats duration and pace using athlete-facing values',()=>{
    expect(chartFormatDuration(188)).toBe('3:08');
    expect(chartFormatPace(188)).toBe('3:08 /500m');
    expect(chartFormatPace(null)).toBe('—');
  });
});


describe('Golden Master v1.0-rc2 — frozen reference session', () => {
  it('uses all recorded GPS and sparse Watch observations without creating a synthetic sine trace', () => {
    expect(goldenChartSession.data).toHaveLength(2267);
    expect(goldenChartSession.hrPoints).toHaveLength(40);
    expect(goldenChartSession.segments).toHaveLength(6);
    expect(goldenChartSession.sources).toEqual(['Phone GPS', 'Remus Blade', 'Apple Watch']);
    expect(goldenChartSession.data[0].t).toBe(0);
    expect(goldenChartSession.data[0].pace).toBe(null);
  });
  it('reproduces the canonical selected piece distance, duration, cadence and split', () => {
    const selected=chartSelectSegment(createChartSelection(goldenChartSession),goldenChartSession,'piece1');
    expect(selected.start).toBe(570);
    expect(selected.end).toBe(950);
    const summary=goldenChartSummaryFixture(goldenChartSession,selected);
    expect(summary.durationSeconds).toBe(380);
    expect(summary.distanceMeters).toBeGreaterThan(1030);
    expect(summary.distanceMeters).toBeLessThanOrEqual(1040);
    expect(summary.averageSpm?.toFixed(1)).toBe('21.7');
    expect(chartFormatPace(summary.averageSplitSecondsPer500m)).toBe('3:03 /500m');
  });
  it('preserves selection and actual gaps after axis changes and metric overlays', () => {
    const piece=chartSelectSegment(createChartSelection(goldenChartSession),goldenChartSession,'piece1');
    const distance=chartSetAxis(piece,'distance');
    expect(distance.start).toBe(570);
    expect(distance.end).toBe(950);
    const multi=chartToggleMetric(distance,'spm');
    expect(multi.metrics).toEqual(['speed','spm']);
    expect(chartYDomain(goldenChartSession,multi).min).toBe(0);
    const hr=chartToggleMetric(multi,'hr');
    expect(chartYDomain(goldenChartSession,hr).max).toBeGreaterThan(100);
  });
});
