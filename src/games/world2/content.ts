export const huntTargets=['A','B','C','D','E','F','G','H','J','K'] as const
export const orderStarts=[1,2,3,4,5,1,2,4,3,5] as const
export type MiniRound={id:string;kind:'shape'|'letter'|'number'|'symbol';prompt:string;answer:string;choices:string[]}
export const miniRounds:readonly MiniRound[]=[
 {id:'s1',kind:'shape',prompt:'Find the triangle.',answer:'triangle',choices:['circle','triangle','square','heart']},
 {id:'l1',kind:'letter',prompt:'Find the letter B.',answer:'B',choices:['D','B','A','C']},
 {id:'n1',kind:'number',prompt:'What comes after 3?',answer:'4',choices:['2','5','4','1']},
 {id:'m1',kind:'symbol',prompt:'Match the forest symbol.',answer:'leaf',choices:['moon','leaf','star','flower']},
 {id:'s2',kind:'shape',prompt:'Find the star.',answer:'star',choices:['heart','diamond','circle','star']},
 {id:'l2',kind:'letter',prompt:'Find the letter F.',answer:'F',choices:['E','H','F','G']},
 {id:'n2',kind:'number',prompt:'What comes after 6?',answer:'7',choices:['5','8','7','4']},
 {id:'m2',kind:'symbol',prompt:'Match the night symbol.',answer:'moon',choices:['star','sun','moon','leaf']},
 {id:'s3',kind:'shape',prompt:'Find the diamond.',answer:'diamond',choices:['oval','square','diamond','triangle']},
 {id:'l3',kind:'letter',prompt:'Find the letter A.',answer:'A',choices:['C','A','D','B']},
]
