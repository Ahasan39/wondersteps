import { colorMatch } from './color-match/content.ts'
import { countIt } from './count-it/content.ts'
import { alphabetMatch } from './alphabet-match/content.ts'
import { animalMatch } from './animal-match/content.ts'
import { fruitMatch } from './fruit-match/content.ts'
import type { GameDefinition } from './shared/types.ts'
export const gameRegistry: Readonly<Record<number, GameDefinition>> = { 1: colorMatch, 2: countIt, 3: alphabetMatch, 4: animalMatch, 5: fruitMatch }
export const resolveGame = (levelId: number): GameDefinition | undefined => gameRegistry[levelId]
