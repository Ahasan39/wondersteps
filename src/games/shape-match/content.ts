import type { GameDefinition,ShapeId } from '../shared/types.ts'
export const shapes:readonly ShapeId[]=['circle','square','triangle','rectangle','star','heart','oval','diamond','pentagon','hexagon']
export const shapeMatch:GameDefinition={levelId:6,intro:'Look closely and find each magical shape.',questions:shapes.map((shape,index)=>{
 const unique=[shape,...shapes.filter(item=>item!==shape).slice(index%7,index%7+3)]
 for(const item of shapes)if(unique.length<4&&!unique.includes(item))unique.push(item)
 return {id:'shape-'+shape,instruction:`Find the ${shape}.`,prompt:{kind:'shape',name:shape,shape},choices:unique.map(item=>({id:item,label:item[0].toUpperCase()+item.slice(1),shape:item})),correctAnswerId:shape}
})}
