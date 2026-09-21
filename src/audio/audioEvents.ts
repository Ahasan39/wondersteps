export const audioEvents=['gameStart','buttonTap','correct','incorrect','star','coin','levelComplete','levelUnlock'] as const
export type AudioEvent=typeof audioEvents[number]
export interface AudioSynth {startMusic():void;stopMusic():void;setDucked(value:boolean):void;play(event:AudioEvent):void;stopEffects():void;dispose():void}
