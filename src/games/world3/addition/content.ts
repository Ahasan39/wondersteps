import type{GameDefinition}from'../../shared/types.ts';import{numberChoices}from'../shared.ts'
const pairs=[[1,1],[1,2],[2,2],[2,3],[3,1],[3,2],[4,1],[4,2],[5,1],[5,3]] as const
export const addition:GameDefinition={levelId:11,intro:'Join two little groups and count them all.',questions:pairs.map(([left,right],i)=>{const total=left+right;return{id:`add-${i}`,instruction:'How many altogether?',prompt:{kind:'addition',left,right,visual:i%2?'star':'apple'},choices:numberChoices(total),correctAnswerId:String(total)}})}
