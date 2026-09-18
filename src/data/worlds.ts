import type { Level, World } from '../types/game'
export const worlds: World[] = [
{ id: 'meadow', name: 'Sunny Meadow', description: 'Little discoveries. Big smiles.', theme: 'meadow' },
{ id: 'forest', name: 'Magic Forest', description: 'A little curiosity goes a long way.', theme: 'forest' },
{ id: 'cloud', name: 'Cloud Kingdom', description: 'Let your imagination take flight.', theme: 'cloud' },
{ id: 'galaxy', name: 'Star Galaxy', description: 'Wonderful things are on the horizon.', theme: 'galaxy' },
]
const names = ['Color Match', 'Count It', 'Alphabet Match', 'Animal Match', 'Fruit Match', 'Shape Match', 'Memory Cards', 'Letter Hunt', 'Number Order', 'Mini Challenge', 'Addition', 'Subtraction', 'Animal Home', 'Food Sort', 'Shape Puzzle', 'Missing Letter', 'Missing Number', 'Advanced Memory', 'Speed Challenge', 'Final Adventure']
export const levels: Level[] = names.map((name, index) => ({ id: index + 1, name, worldId: worlds[Math.floor(index / 5)].id }))

