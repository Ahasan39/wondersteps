import type {Choice} from '../shared/types.ts'
export const numberChoices=(answer:number):Choice[]=>[answer,answer+1,Math.max(0,answer-1),answer+2].filter((n,i,a)=>a.indexOf(n)===i).slice(0,4).map(number=>({id:String(number),label:String(number),number}))
