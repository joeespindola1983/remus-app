/** REMUS Chart Golden Master — state/transform contract, independent of renderer.
 * Approved references: REMUS_Chart_Gold_Master.md and Visual System v1.0-rc2.
 */
export type ChartMetric='speed'|'pace'|'spm'|'hr';
export type ChartAxis='time'|'distance';
export type ChartDatum={t:number;d:number;speed:number|null;pace:number|null;spm:number|null;hr:number|null};
export type ChartHeartRate={t:number;d:number;hr:number};
export type ChartSegment={id:string;label:string;kind:'piece'|'sprint'|'turn'|'stopped'|'race';start:number;end:number;note?:string};
export type ChartSession={id:string;title:string;date:string;data:readonly ChartDatum[];hrPoints?:readonly ChartHeartRate[];segments:readonly ChartSegment[];sources:readonly string[]};
export type ChartSelection={axis:ChartAxis;start:number;end:number;metrics:readonly ChartMetric[];primaryMetric:ChartMetric;activeSegment:string|null};
export type ChartSessionSelection={sessionId:string;selection:ChartSelection};

/** Engine/backend-owned sport metrics for one physical elapsed-time range.
 *  Values are inputs to the UI, never derived by this contract.
 *  The range is expressed in seconds regardless of Time/Distance display axis.
 */
export type ChartContextSummary = {
  range: Readonly<{start:number;end:number}>;
  averageSpm: number | null;
  averageSplitSecondsPer500m: number | null;
  distanceMeters: number | null;
  durationSeconds: number | null;
};

/** Prevent a slow engine/backend response for an old range from being shown
 *  under the newly selected range. Axis and active metrics don't alter identity. */
export function chartSummaryForSelection(
  selection: ChartSelection,
  summary: ChartContextSummary | null | undefined,
): ChartContextSummary | null {
  if (!summary) {return null;}
  const EPSILON_SECONDS = 0.001;
  return Math.abs(summary.range.start - selection.start) <= EPSILON_SECONDS &&
    Math.abs(summary.range.end - selection.end) <= EPSILON_SECONDS ? summary : null;
}

export type ChartDomain={min:number;max:number};
export const chartMetricDefs={
  speed:{label:'Speed',unit:'km/h',accent:'#12a99c',minSpan:2.5},
  pace:{label:'Pace',unit:'/500 m',accent:'#4d8df7',minSpan:0.6},
  spm:{label:'Stroke rate',unit:'SPM',accent:'#7669ee',minSpan:4},
  hr:{label:'Heart rate',unit:'bpm',accent:'#e34e54',minSpan:10},
} as const;

export function chartFullRange(session:ChartSession):{start:number;end:number}{
  const first=session.data[0]?.t??0;
  const last=session.data[session.data.length-1]?.t??first+12;
  return {start:first,end:Math.max(first+12,last)};
}

export function createChartSelection(session:ChartSession):ChartSelection{
  const full=chartFullRange(session);
  return {...full,axis:'time',metrics:['speed'],primaryMetric:'speed',activeSegment:null};
}

/** Keeps uncontrolled UI state scoped to one stable session identity. */
export function chartSelectionForSession(
  current:ChartSessionSelection,
  session:ChartSession,
):ChartSessionSelection{
  return current.sessionId===session.id
    ? current
    : {sessionId:session.id,selection:createChartSelection(session)};
}

export function normalizeChartRange(range:{start:number;end:number},full:{start:number;end:number},minDuration=12):{start:number;end:number}{
  const total=Math.max(full.end-full.start,0);
  const duration=Math.min(Math.max(minDuration,range.end-range.start),total);
  const start=Math.max(full.start,Math.min(full.end-duration,Number.isFinite(range.start)?range.start:full.start));
  return {start,end:start+duration};
}

export function chartToggleMetric(state:ChartSelection,metric:ChartMetric):ChartSelection{
  const chosen=state.metrics.includes(metric);
  if(chosen){
    if(state.metrics.length===1)return state;
    const remaining=state.metrics.filter(m=>m!==metric);
    return {...state,metrics:remaining,primaryMetric:state.primaryMetric===metric?remaining[remaining.length-1]:state.primaryMetric};
  }
  return {...state,metrics:[...state.metrics,metric],primaryMetric:metric};
}

export function chartSetAxis(state:ChartSelection,axis:ChartAxis):ChartSelection{
  return {...state,axis}; // start/end remain elapsed seconds — same physical interval
}

export function chartSelectSegment(state:ChartSelection,session:ChartSession,segmentId:string):ChartSelection{
  const segment=session.segments.find(s=>s.id===segmentId);
  if(!segment)return state;
  const range=normalizeChartRange({start:segment.start,end:segment.end},chartFullRange(session));
  return {...state,...range,activeSegment:segmentId};
}

export function chartSetRange(state:ChartSelection,session:ChartSession,start:number,end:number):ChartSelection{
  return {...state,...normalizeChartRange({start,end},chartFullRange(session)),activeSegment:null};
}

export function chartResetRange(state:ChartSelection,session:ChartSession):ChartSelection{
  return {...state,...chartFullRange(session),activeSegment:null};
}

export function chartVisibleRows(session:ChartSession,selection:ChartSelection):ChartDatum[]{
  return session.data.filter(row=>row.t>=selection.start&&row.t<=selection.end);
}

export function chartMetricValue(row:ChartDatum,metric:ChartMetric,overlay:boolean):number|null{
  const raw=row[metric];
  if(raw===null||!Number.isFinite(raw))return null;
  if(metric==='pace')return raw>0 ? (overlay?raw/60:raw):null;
  if(metric==='spm'&&raw<=0)return null;
  return raw;
}

function quantile(sorted:number[],p:number):number{
  if(sorted.length===0)return 0;
  const at=(sorted.length-1)*p;const low=Math.floor(at);const high=Math.ceil(at);
  return sorted[low]+(sorted[high]-sorted[low])*(at-low);
}

/** Single metric uses trimmed 3%-97% and minimum span; overlays share a 0-based Y. */
export function chartYDomain(session:ChartSession,selection:ChartSelection):ChartDomain{
  const overlay=selection.metrics.length>1;
  const vals=chartVisibleRows(session,selection).flatMap(row=>selection.metrics.map(metric=>chartMetricValue(row,metric,overlay)))
    .filter((value):value is number=>value!==null).sort((a,b)=>a-b);
  if(selection.metrics.includes('hr')&&session.hrPoints){
    for(const h of session.hrPoints){if(h.t>=selection.start&&h.t<=selection.end&&Number.isFinite(h.hr))vals.push(h.hr);}
    vals.sort((a,b)=>a-b);
  }
  if(vals.length===0)return {min:0,max:1};
  if(overlay){const max=Math.max(1,vals[vals.length-1]);return {min:0,max:Math.ceil(max*1.12)};}
  const metric=selection.metrics[0];
  const minSpan=chartMetricDefs[metric].minSpan*(metric==='pace'?60:1);
  const lo=quantile(vals,0.03);const hi=quantile(vals,0.97);
  const span=Math.max(minSpan,hi-lo);
  const center=(lo+hi)/2;
  return {min:center-span*0.62,max:center+span*0.62};
}

/** Inspection is a projection of the same physical sample in Time or Distance mode. */
export function chartNearestRow(session:ChartSession,selection:ChartSelection,ratio:number):ChartDatum|null{
  const rows=chartVisibleRows(session,selection);
  if(!rows.length)return null;
  const axisKey=selection.axis==='time'?'t':'d';
  const min=rows[0][axisKey];const max=rows[rows.length-1][axisKey];
  const target=min+Math.max(0,Math.min(1,ratio))*Math.max(0,max-min);
  return rows.reduce((best,row)=>Math.abs(row[axisKey]-target)<Math.abs(best[axisKey]-target)?row:best,rows[0]);
}

/** Sparse HR shows only observed evidence within a bounded inspection tolerance. */
export function chartInspectMetric(session:ChartSession,row:ChartDatum,metric:ChartMetric):string{
  const data=metric==='hr'&&row.hr===null?
    (session.hrPoints??[]).find(point=>Math.abs(point.t-row.t)<=8)?.hr??null:row[metric];
  if(data===null||!Number.isFinite(data)||data<=0)return '—';
  if(metric==='pace')return chartFormatPace(data);
  return metric==='speed'?`${data.toFixed(1)} km/h`:metric==='spm'?`${data.toFixed(1)} SPM`:`${Math.round(data)} bpm`;
}

export function chartFormatDuration(sec:number){const s=Math.floor(Math.max(0,sec));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
export function chartFormatPace(sec:number|null){return sec===null?'—':`${chartFormatDuration(Math.round(sec))} /500m`;}

/** Segments are separate subpaths. Missing rows/null values never connect. */
export function chartSeriesPaths(session:ChartSession,selection:ChartSelection,metric:ChartMetric,width:number,height:number,domain=chartYDomain(session,selection)){
  const data=chartVisibleRows(session,selection);
  const overlay=selection.metrics.length>1;
  const first=data[0];const last=data[data.length-1];
  if(!first||!last)return [];
  const xMin=selection.axis==='time'?first.t:first.d;
  const xMax=selection.axis==='time'?last.t:last.d;
  const span=Math.max(1e-6,xMax-xMin);
  const ySpan=Math.max(1e-6,domain.max-domain.min);
  const lines:string[]=[];let current='';
  for(const row of data){
    const value=chartMetricValue(row,metric,overlay);
    if(value===null){if(current)lines.push(current);current='';continue;}
    const x=width*((selection.axis==='time'?row.t:row.d)-xMin)/span;
    const y=height*(1-(value-domain.min)/ySpan);
    const pt=`${x.toFixed(2)} ${Math.max(0,Math.min(height,y)).toFixed(2)}`;
    current+=current?` L ${pt}`:`M ${pt}`;
  }
  if(current)lines.push(current);
  return lines;
}
