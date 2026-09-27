import type{GameDefinition}from'../../shared/types.ts';import{numberChoices}from'../shared.ts'
const pairs=[[3,1],[4,1],[5,2],[6,1],[6,3],[7,2],[8,3],[9,4],[10,2],[10,5]] as const
export const subtraction:GameDefinition={levelId:12,intro:'Watch a few float away and count what remains.',questions:pairs.map(([left,right],i)=>{const answer=left-right;return{id:`subtract-${i}`,instruction:'How many are left?',prompt:{kind:'subtraction',left,right,visual:i%2?'star':'flower'},choices:numberChoices(answer),correctAnswerId:String(answer)}})}
