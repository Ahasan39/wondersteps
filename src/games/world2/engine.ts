import { shuffle } from '../shared/session.ts'
import type { RandomSource } from '../shared/types.ts'
export const memorySymbols=['leaf','star','moon'] as const
export interface MemoryState{cards:{id:string;symbol:string;matched:boolean}[];open:string[];locked:boolean;mismatches:number}
export function createMemory(random:RandomSource=Math.random):MemoryState{return {cards:shuffle(memorySymbols.flatMap(symbol=>[0,1].map(copy=>({id:symbol+'-'+copy,symbol,matched:false}))),random),open:[],locked:false,mismatches:0}}
export function flipMemory(state:MemoryState,id:string):MemoryState{const card=state.cards.find(c=>c.id===id);if(state.locked||!card||card.matched||state.open.includes(id)||state.open.length>=2)return state;return {...state,open:[...state.open,id],locked:state.open.length===1}}
export function resolveMemory(state:MemoryState):MemoryState{if(state.open.length!==2)return state;const [a,b]=state.open.map(id=>state.cards.find(c=>c.id===id)!);const match=a.symbol===b.symbol;return {...state,cards:match?state.cards.map(c=>state.open.includes(c.id)?{...c,matched:true}:c):state.cards,open:[],locked:false,mismatches:state.mismatches+(match?0:1)}}
export const memoryScore=(mismatches:number)=>Math.max(500,1100-mismatches*100)
export interface HuntState{target:string;letters:{id:string;letter:string;found:boolean}[];wrong:number}
export function createHunt(target:string,random:RandomSource=Math.random):HuntState{const distractors=['A','B','C','D','E','F','G','H'].filter(x=>x!==target);return {target,wrong:0,letters:shuffle([...Array.from({length:3},(_,i)=>({id:'target-'+i,letter:target,found:false})),...distractors.slice(0,6).map((letter,i)=>({id:'other-'+i,letter,found:false}))],random)}}
export function tapHunt(state:HuntState,id:string):HuntState{const item=state.letters.find(x=>x.id===id);if(!item||item.found)return state;if(item.letter!==state.target)return {...state,wrong:state.wrong+1};return {...state,letters:state.letters.map(x=>x.id===id?{...x,found:true}:x)}}
export interface OrderState{numbers:number[];placed:number[];wrong:number}
export function createOrder(start:number,random:RandomSource=Math.random):OrderState{return {numbers:shuffle([start,start+1,start+2,start+3],random),placed:[],wrong:0}}
export function tapOrder(state:OrderState,value:number):OrderState{if(state.placed.includes(value))return state;const expected=Math.min(...state.numbers.filter(n=>!state.placed.includes(n)));return value===expected?{...state,placed:[...state.placed,value]}:{...state,wrong:state.wrong+1}}
export const roundScore=(wrong:number)=>wrong===0?100:wrong===1?70:40
export const finalTenRoundScore=(score:number,wrong:number)=>score+(wrong===0?100:0)
