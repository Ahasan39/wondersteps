export const AUDIO_PREFERENCES_KEY = 'wondersteps.audio-preferences'
export interface AudioPreferences { version:1; musicEnabled:boolean; sfxEnabled:boolean }
export const defaultAudioPreferences:AudioPreferences = {version:1,musicEnabled:false,sfxEnabled:false}
export interface PreferenceStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
export function loadAudioPreferences(storage:PreferenceStorage):AudioPreferences {
 try {
  const raw=storage.getItem(AUDIO_PREFERENCES_KEY)
  if(!raw || raw.length>1000)return {...defaultAudioPreferences}
  const value:unknown=JSON.parse(raw)
  if(typeof value!=='object'||value===null||!('version' in value)||value.version!==1)return {...defaultAudioPreferences}
  return {version:1,musicEnabled:'musicEnabled' in value&&value.musicEnabled===true,sfxEnabled:'sfxEnabled' in value&&value.sfxEnabled===true}
 }catch{return {...defaultAudioPreferences}}
}
export function saveAudioPreferences(storage:PreferenceStorage,value:AudioPreferences):boolean {
 try{storage.setItem(AUDIO_PREFERENCES_KEY,JSON.stringify(value));return true}catch{return false}
}
