import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { RemusFilterChip } from '../atoms/RemusFilterChip';
import { RemusIcon } from '../atoms/RemusIcon';
import { RemusIconButton } from '../atoms/RemusIconButton';
import { RemusToggle } from '../atoms/RemusToggle';
import { type MoleculeMode, moleculeGeometry, moleculePalette, moleculeStyles } from './moleculeStyle';

type Base = {mode?: MoleculeMode; testID?: string};

/** Figma 199:212. Values and units are supplied by the caller, never invented here. */
export function RemusMetricTile({label, value, unit, size = 'compact', mode = 'athleteLight', testID}: Base & {
  label: string; value: string; unit?: string; size?: 'compact' | 'regular';
}) {
  const c = moleculePalette(mode);
  return <View testID={testID} style={[styles.metric, size==='compact' ? styles.metricCompact : styles.metricRegular,
    {backgroundColor: c.mutedSurface}]}>
    <Text style={[moleculeStyles.metricLabel, {color: c.secondaryText}]}>{label}</Text>
    <View style={moleculeStyles.row}>
      <Text numberOfLines={1} style={[moleculeStyles.big, {color: c.text}]}>{value}</Text>
      {unit ? <Text style={[moleculeStyles.caption, {color: c.secondaryText}]}>{unit}</Text> : null}
    </View>
  </View>;
}

/** Figma 297:5389. Data and state are supplied by activity history. */
export function RemusActivitySummaryCard({title, date, distance, duration, pace, mode = 'athleteLight', testID, onPress}: Base & {
  title: string; date: string; distance: string; duration: string; pace: string; onPress?: () => void;
}) {
  const c = moleculePalette(mode);
  return <Pressable testID={testID} onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined}
    style={[moleculeStyles.card, {backgroundColor: c.surface, borderColor: c.border}]}>
    <View style={moleculeStyles.between}>
      <Text style={[moleculeStyles.title, styles.flexText, {color: c.text}]}>{title}</Text>
      <Text style={[moleculeStyles.caption, {color: c.secondaryText}]}>{date}</Text>
    </View>
    <View style={moleculeStyles.wrap}>
      <RemusMetricTile label="DISTÂNCIA" value={distance} mode={mode}/>
      <RemusMetricTile label="DURAÇÃO" value={duration} mode={mode}/>
      <RemusMetricTile label="RITMO" value={pace} mode={mode}/>
    </View>
  </Pressable>;
}

/** Figma 287:3583. An optional local/remote URI replaces the placeholder. */
export function RemusMediaThumbnail({uri, media = 'photo', aspect = 'square', mode = 'athleteLight', testID}: Base & {
  uri?: string; media?: 'photo'|'video'; aspect?: 'square'|'portrait';
}) {
  const c = moleculePalette(mode);
  const container = aspect === 'portrait' ? moleculeStyles.mediaPortrait : moleculeStyles.mediaSquare;
  return <View testID={testID} style={[container, {backgroundColor: c.mutedBackground, borderColor: c.border}]}>
    {uri ? <Image source={{uri}} resizeMode="cover" style={StyleSheet.absoluteFill}/> : null}
    {!uri ? <Text style={[moleculeStyles.title, {color: c.secondaryText}]}>{media === 'video' ? 'VIDEO' : 'PHOTO'}</Text> : null}
    {media === 'video' ? <View style={[styles.playBadge, {backgroundColor: c.surface}]}><RemusIcon name="start" size={24} mode={mode}/></View> : null}
  </View>;
}

/** Figma 287:3584. Parent owns like/save state, no network calls here. */
export function RemusEngagementBar({likes, comments, liked = false, saved = false, mode = 'athleteLight',
  onLike, onComment, onShare, onSave, testID}: Base & {
  likes: number; comments: number; liked?: boolean; saved?: boolean;
  onLike?:()=>void; onComment?:()=>void; onShare?:()=>void; onSave?:()=>void;
}) {
  const c = moleculePalette(mode);
  return <View testID={testID} style={moleculeStyles.wrap}>
    <Pressable accessibilityRole="button" accessibilityLabel={liked?'Remover curtida':'Curtir'} onPress={onLike}
      style={[styles.engagement, {borderColor: liked ? c.primary : c.accent}]}>
      <Text style={[moleculeStyles.title, {color: c.text}]}>{liked?'♥':'♡'} {likes}</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Comentar" onPress={onComment}
      style={[styles.engagement, {borderColor: c.border}]}>
      <Text style={[moleculeStyles.subtitle, {color: c.text}]}>◌ {comments}</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Compartilhar" onPress={onShare}
      style={[styles.engagement, {borderColor: c.border}]}>
      <Text style={[moleculeStyles.subtitle, {color: c.text}]}>↗</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={saved?'Remover dos salvos':'Salvar'} onPress={onSave}
      style={[styles.engagement, {borderColor: saved ? c.primary : c.border}]}>
      <Text style={[moleculeStyles.subtitle, {color: c.text}]}>{saved?'★':'☆'}</Text>
    </Pressable>
  </View>;
}

export type ShareFormat = 'story'|'post'|'reel';
/** Figma 290:323. */
export function RemusShareFormat({format, selected = false, mode = 'athleteLight', onPress, testID}: Base & {
  format: ShareFormat; selected?:boolean; onPress?:()=>void;
}) {
  const c = moleculePalette(mode);
  return <Pressable testID={testID} onPress={onPress} accessibilityRole="button"
    accessibilityState={{selected}} accessibilityLabel={`${format}, ${selected?'selecionado':'não selecionado'}`}
    style={[styles.share, {borderColor: selected ? c.primary : c.border, backgroundColor: c.surface}, selected && moleculeStyles.selection]}>
    <Text style={[moleculeStyles.title, {color: c.primary}]}>{format === 'story' ? '▣' : format === 'post' ? '▤' : '▷'}</Text>
    <Text style={[moleculeStyles.subtitle, {color: c.text}]}>{format === 'story' ? 'Story' : format === 'post' ? 'Post' : 'Reel'}</Text>
  </Pressable>;
}

/** Figma 290:4573. Overlay on media remains readable even without an image. */
export function RemusActivityOverlay({title, summary, detail, imageUri, style = 'minimal', testID}: Pick<Base,'testID'> & {
  title:string;summary:string;detail?:string;imageUri?:string;style?:'minimal'|'metrics'|'map';
}) {
  return <View testID={testID} style={[moleculeStyles.overlay, styles.mediaOverlay]}>
    {imageUri ? <Image source={{uri:imageUri}} resizeMode="cover" style={StyleSheet.absoluteFill}/> : null}
    <Text style={[moleculeStyles.caption, styles.onMedia]}>{title}</Text>
    <Text style={[moleculeStyles.big, styles.onMedia]}>{summary}</Text>
    {style !== 'minimal' && detail ? <Text style={[moleculeStyles.subtitle, styles.onMedia]}>{detail}</Text> : null}
    {style === 'map' ? <Text style={[moleculeStyles.caption, styles.onMedia]}>MAP OVERLAY</Text> : null}
  </View>;
}

export type BoatStatus = 'nearby'|'self'|'selected'|'stale';
/** Figma 294:322. Heading degrees do not imply an invented route. */
export function RemusBoatMarker({status='nearby',heading=0,label='1x',mode='athleteLight',testID,onPress}: Base & {
  status?:BoatStatus;heading?:number;label?:string;onPress?:()=>void;
}) {
  const c = moleculePalette(mode);
  const selected = status === 'selected' || status === 'self';
  return <Pressable testID={testID} onPress={onPress} disabled={!onPress} accessibilityRole="button"
    accessibilityLabel={`${label}, ${status}, rumo ${heading} graus`}
    style={[styles.boat, {borderColor:selected?c.primary:c.border,backgroundColor:c.surface},status==='stale' && moleculeStyles.disabled]}>
    <Text style={[moleculeStyles.caption,{color:c.primary}]}>{Number.isFinite(heading) ? '▲' : '○'}</Text>
    <Text style={[moleculeStyles.title,{color:c.text}]}>{label}</Text>
  </Pressable>;
}

export function RemusNearbyBoatCard({name, detail, label='1x', mode='athleteLight', testID,onPress}:Base & {
  name:string;detail:string;label?:string;onPress?:()=>void;
}) {
  const c=moleculePalette(mode);
  return <Pressable testID={testID} onPress={onPress} accessibilityRole="button"
    style={[moleculeStyles.card,moleculeStyles.row,{backgroundColor:c.surface,borderColor:c.border}]}>
    <RemusBoatMarker label={label} status="selected" mode={mode}/>
    <View style={[moleculeStyles.column,styles.flexContent]}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>{name}</Text>
      <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{detail}</Text>
    </View>
  </Pressable>;
}

/** Figma 294:4891. Buttons only dispatch explicit parent callbacks. */
export function RemusMapControlStack({mode='athleteLight',onCenter,onNearby,onMapView,testID}:Base & {
  onCenter?:()=>void;onNearby?:()=>void;onMapView?:()=>void;
}) {
  return <View testID={testID} style={moleculeStyles.mapStack}>
    <RemusIconButton icon="home" size="medium" mode={mode} accessibilityLabel="Centralizar mapa" onPress={onCenter}/>
    <RemusIconButton icon="plus" size="medium" variant="neutral" mode={mode} accessibilityLabel="Remadores próximos" onPress={onNearby}/>
    <RemusIconButton icon="chevronRight" size="medium" mode={mode} accessibilityLabel="Mudar visualização do mapa" onPress={onMapView}/>
  </View>;
}

export function RemusActivityFilterBar({selected='all',onChange,mode='athleteLight',testID}:Base & {
  selected:'all'|'training';onChange?:(value:'all'|'training')=>void;
}) {
  return <View testID={testID} style={moleculeStyles.wrap}>
    <RemusFilterChip label="Todos" selected={selected==='all'} onValueChange={()=>onChange?.('all')} mode={mode}/>
    <RemusFilterChip label="Treinos" selected={selected==='training'} onValueChange={()=>onChange?.('training')} mode={mode}/>
  </View>;
}

/** Figma 298:6299. Parent owns the settings model and navigation. */
export function RemusSettingsRow({title, detail, accessory='toggle',value=false,onValueChange,onPress,mode='athleteLight',testID}:Base & {
  title:string;detail:string;accessory?:'toggle'|'chevron';value?:boolean;onValueChange?:(value:boolean)=>void;onPress?:()=>void;
}) {
  const c=moleculePalette(mode);
  return <View testID={testID} style={[moleculeStyles.card,moleculeStyles.between,{backgroundColor:c.surface,borderColor:c.border}]}>
    <Pressable accessibilityRole="button" disabled={accessory==='toggle'} onPress={onPress} style={[moleculeStyles.column,styles.flexContent]}>
      <Text style={[moleculeStyles.title,{color:c.text}]}>{title}</Text>
      <Text style={[moleculeStyles.caption,{color:c.secondaryText}]}>{detail}</Text>
    </Pressable>
    {accessory==='toggle'?<RemusToggle value={value} onValueChange={onValueChange} mode={mode} accessibilityLabel={title}/>:
      <RemusIcon name="chevronRight" mode={mode} size={24}/> }
  </View>;
}

const styles=StyleSheet.create({
  metric:{minHeight:78,borderRadius:8,padding:10,justifyContent:'center',gap:4},
  metricCompact:{width:moleculeGeometry.metricCompact},
  metricRegular:{width:moleculeGeometry.metricRegular},
  playBadge:{borderRadius:999,padding:6},
  engagement:{minHeight:50,borderWidth:2,borderRadius:25,paddingHorizontal:12,justifyContent:'center'},
  share:{width:104,height:88,borderWidth:1,borderRadius:16,alignItems:'center',justifyContent:'center',gap:8},
  mediaOverlay:{backgroundColor:'rgba(0,0,0,0.65)',overflow:'hidden'},
  onMedia:{color:'#FFFFFF'},
  flexContent:{flex:1,minWidth:0},
  flexText:{flexShrink:1},
  boat:{width:64,height:64,borderWidth:2,borderRadius:32,alignItems:'center',justifyContent:'center',gap:0},
});
