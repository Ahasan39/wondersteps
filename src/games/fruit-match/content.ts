import { identificationQuestions } from '../shared/content.ts'
import type { Choice, GameDefinition } from '../shared/types.ts'
export const fruits: readonly Choice[] = ([
  ['apple','Apple'], ['banana','Banana'], ['orange','Orange'], ['mango','Mango'], ['grapes','Grapes'], ['watermelon','Watermelon'],
  ['strawberry','Strawberry'], ['pineapple','Pineapple'], ['pear','Pear'], ['cherry','Cherry'], ['peach','Peach'], ['kiwi','Kiwi'],
] as const).map(([id, label]) => ({ id, label, visual: id }))
export const fruitMatch: GameDefinition = { levelId: 5, intro: 'A tasty little adventure. Find the matching fruit!', questions: identificationQuestions(fruits, 'fruit') }
