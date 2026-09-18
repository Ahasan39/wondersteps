import { identificationQuestions } from '../shared/content.ts'
import type { Choice, GameDefinition } from '../shared/types.ts'
export const animals: readonly Choice[] = ([
  ['cat','Cat'], ['dog','Dog'], ['lion','Lion'], ['tiger','Tiger'], ['elephant','Elephant'], ['rabbit','Rabbit'],
  ['panda','Panda'], ['monkey','Monkey'], ['fish','Fish'], ['bird','Bird'], ['frog','Frog'], ['turtle','Turtle'],
  ['horse','Horse'], ['cow','Cow'], ['sheep','Sheep'], ['duck','Duck'],
] as const).map(([id, label]) => ({ id, label, visual: id }))
export const animalMatch: GameDefinition = { levelId: 4, intro: 'Find Pip’s animal friends!', questions: identificationQuestions(animals, 'animal') }
