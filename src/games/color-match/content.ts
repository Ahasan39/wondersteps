import { choicesFor } from '../shared/content.ts'
import type { Choice, GameDefinition } from '../shared/types.ts'
export const colors: readonly Choice[] = [
  { id: 'red', label: 'Red', color: 'red' }, { id: 'blue', label: 'Blue', color: 'blue' },
  { id: 'green', label: 'Green', color: 'green' }, { id: 'yellow', label: 'Yellow', color: 'yellow' },
  { id: 'orange', label: 'Orange', color: 'orange' }, { id: 'purple', label: 'Purple', color: 'purple' },
  { id: 'pink', label: 'Pink', color: 'pink' }, { id: 'brown', label: 'Brown', color: 'brown' },
  { id: 'black', label: 'Black', color: 'black' }, { id: 'white', label: 'White', color: 'white' },
]
export const colorMatch: GameDefinition = {
  levelId: 1, intro: 'Can you find the right color?',
  questions: colors.map(target => ({ id: `color-${target.id}`, instruction: 'Find this color', prompt: { kind: 'color', name: target.label }, choices: choicesFor(colors, target), correctAnswerId: target.id })),
}
