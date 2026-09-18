import { choicesFor } from '../shared/content.ts'
import type { Choice, GameDefinition, VisualId } from '../shared/types.ts'
export const alphabet: readonly { letter: string; choice: Choice }[] = ([
  ['A','Apple','apple'], ['B','Ball','ball'], ['C','Cat','cat'], ['D','Dog','dog'], ['E','Elephant','elephant'],
  ['F','Fish','fish'], ['G','Grapes','grapes'], ['H','House','house'], ['I','Ice Cream','ice-cream'], ['J','Juice','juice'],
  ['K','Kite','kite'], ['L','Lion','lion'], ['M','Moon','moon'], ['N','Nest','nest'], ['O','Orange','orange'],
  ['P','Panda','panda'], ['Q','Queen','queen'], ['R','Rabbit','rabbit'], ['S','Sun','sun'], ['T','Tree','tree'],
  ['U','Umbrella','umbrella'], ['V','Van','van'], ['W','Whale','whale'], ['X','Xylophone','xylophone'], ['Y','Yo-yo','yo-yo'], ['Z','Zebra','zebra'],
] as const).map(([letter, label, visual]) => ({ letter, choice: { id: visual, label, visual: visual as VisualId } }))
export const alphabetMatch: GameDefinition = {
  levelId: 3, intro: 'Which picture starts with this letter?',
  questions: alphabet.map(({ letter, choice }) => ({ id: `letter-${letter}`, instruction: 'Starts with…', prompt: { kind: 'alphabet', letter }, choices: choicesFor(alphabet.map(item => item.choice), choice), correctAnswerId: choice.id })),
}
