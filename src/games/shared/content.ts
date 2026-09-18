import type { Choice, Question } from './types.ts'

/** Stable distractor sets; session creation shuffles their order exactly once. */
export function choicesFor(pool: readonly Choice[], target: Choice): Choice[] {
  const index = pool.findIndex(item => item.id === target.id)
  return [target, ...[1, 3, 5].map(offset => pool[(index + offset) % pool.length])]
}
export function identificationQuestions(pool: readonly Choice[], kind: 'animal' | 'fruit'): Question[] {
  return pool.map(target => ({
    id: `${kind}-${target.id}`, instruction: kind === 'animal' ? 'Find the animal' : 'Find the fruit',
    prompt: { kind, name: target.label, visual: target.visual! },
    choices: choicesFor(pool, target), correctAnswerId: target.id,
  }))
}
