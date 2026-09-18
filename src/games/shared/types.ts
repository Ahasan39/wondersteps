export type VisualId =
  | 'apple' | 'banana' | 'orange' | 'mango' | 'grapes' | 'watermelon' | 'strawberry' | 'pineapple' | 'pear' | 'cherry' | 'peach' | 'kiwi'
  | 'cat' | 'dog' | 'lion' | 'tiger' | 'elephant' | 'rabbit' | 'panda' | 'monkey' | 'fish' | 'bird' | 'frog' | 'turtle' | 'horse' | 'cow' | 'sheep' | 'duck' | 'whale' | 'zebra'
  | 'ball' | 'house' | 'ice-cream' | 'juice' | 'kite' | 'moon' | 'nest' | 'queen' | 'sun' | 'tree' | 'umbrella' | 'van' | 'xylophone' | 'yo-yo' | 'star' | 'flower' | 'circle'
export type ColorId = 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'pink' | 'brown' | 'black' | 'white'
export interface Choice { id: string; label: string; visual?: VisualId; color?: ColorId; number?: number }
export type Prompt =
  | { kind: 'color'; name: string }
  | { kind: 'count'; count: number; visual: VisualId }
  | { kind: 'alphabet'; letter: string }
  | { kind: 'animal' | 'fruit'; name: string; visual: VisualId }
export interface Question { id: string; instruction: string; prompt: Prompt; choices: readonly Choice[]; correctAnswerId: string }
export interface GameDefinition { levelId: number; intro: string; questions: readonly Question[] }
export type SessionStatus = 'playing' | 'round-feedback' | 'level-complete'
export interface GameSession {
  readonly status: SessionStatus
  readonly questions: readonly Question[]
  readonly roundIndex: number
  readonly score: number
  readonly correctAnswers: number
  readonly wrongAttempts: number
  readonly firstTryCorrect: number
  readonly roundWrongAttempts: number
  readonly selectedAnswerId: string | null
  readonly feedback: 'correct' | 'incorrect' | null
}
export type FeedbackEvent = 'correct' | 'incorrect' | 'levelComplete'
export type RandomSource = () => number
