import type { GameDefinition, Question, VisualId } from '../shared/types.ts'
const objects: readonly VisualId[] = ['star', 'apple', 'flower']
export const countIt: GameDefinition = {
  levelId: 2, intro: 'Count the little objects. How many can you see?',
  questions: objects.flatMap(visual => Array.from({ length: 10 }, (_, index): Question => {
    const count = index + 1
    const numbers = [count, count % 10 + 1, (count + 2) % 10 + 1, (count + 4) % 10 + 1]
    return { id: `count-${visual}-${count}`, instruction: 'How many?', prompt: { kind: 'count', count, visual }, choices: numbers.map(number => ({ id: String(number), label: String(number), number })), correctAnswerId: String(count) }
  })),
}
