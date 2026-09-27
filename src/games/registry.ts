import { colorMatch } from './color-match/content.ts'
import { countIt } from './count-it/content.ts'
import { alphabetMatch } from './alphabet-match/content.ts'
import { animalMatch } from './animal-match/content.ts'
import { fruitMatch } from './fruit-match/content.ts'
import { shapeMatch } from './shape-match/content.ts'
import {addition}from'./world3/addition/content.ts';import{subtraction}from'./world3/subtraction/content.ts';import{animalHome}from'./world3/animal-home/content.ts';import{foodSort}from'./world3/food-sort/content.ts';import{shapePuzzle}from'./world3/shape-puzzle/content.ts'
import type { GameDefinition } from './shared/types.ts'
export const gameRegistry: Readonly<Record<number, GameDefinition>> = { 1: colorMatch, 2: countIt, 3: alphabetMatch, 4: animalMatch, 5: fruitMatch,6:shapeMatch,11:addition,12:subtraction,13:animalHome,14:foodSort,15:shapePuzzle }
export const resolveGame = (levelId: number): GameDefinition | undefined => gameRegistry[levelId]
