import type { GameDefinition, GameSession, Question, RandomSource } from './types.ts'

export const ROUND_COUNT = 10
export const FEEDBACK_DELAY_MS = 650
export const PERFECT_BONUS = 100
export const positiveFeedback = ['Great job!', 'Awesome!', 'You got it!', 'Wonderful!'] as const

export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const value = random()
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Random source must return a value in [0, 1)')
    const other = Math.floor(value * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}
export function validateQuestions(questions: readonly Question[]): void {
  const ids = new Set<string>()
  for (const question of questions) {
    if (!question.id || ids.has(question.id)) throw new Error('Question IDs must be unique')
    ids.add(question.id)
    if (!question.instruction.trim() || question.choices.length < 3 || question.choices.length > 4) throw new Error('A question needs instructions and 3–4 choices')
    const prompt = question.prompt
    if (!prompt || !['color', 'count', 'alphabet', 'animal', 'fruit'].includes(prompt.kind)) throw new Error('A valid prompt is required')
    if (prompt.kind === 'count' ? !Number.isInteger(prompt.count) || prompt.count < 1 || prompt.count > 10 || !prompt.visual
      : prompt.kind === 'alphabet' ? !/^[A-Z]$/.test(prompt.letter)
      : !prompt.name?.trim() || (prompt.kind !== 'color' && !prompt.visual)) throw new Error('Prompt content is required')
    const choiceIds = new Set(question.choices.map(choice => choice.id))
    if (choiceIds.size !== question.choices.length || question.choices.some(choice => !choice.id || !choice.label.trim())) throw new Error('Choice IDs and labels must be valid')
    if (question.choices.filter(choice => choice.id === question.correctAnswerId).length !== 1) throw new Error('Exactly one correct answer is required')
  }
}
export function createSession(game: GameDefinition, random: RandomSource = Math.random): GameSession {
  validateQuestions(game.questions)
  if (game.questions.length < ROUND_COUNT) throw new Error('A game needs at least 10 questions')
  const questions = shuffle(game.questions, random).slice(0, ROUND_COUNT).map(question => ({ ...question, choices: shuffle(question.choices, random) }))
  return { status: 'playing', questions, roundIndex: 0, score: 0, correctAnswers: 0, wrongAttempts: 0, firstTryCorrect: 0, roundWrongAttempts: 0, selectedAnswerId: null, feedback: null }
}
export const pointsForRound = (wrongAttempts: number) => wrongAttempts === 0 ? 100 : wrongAttempts === 1 ? 70 : 40
/** The question ID is a transition token: stale input cannot affect the next round. */
export function answerQuestion(session: GameSession, questionId: string, answerId: string): GameSession {
  const question = session.questions[session.roundIndex]
  if (session.status !== 'playing' || question.id !== questionId || !question.choices.some(choice => choice.id === answerId)) return session
  if (answerId !== question.correctAnswerId) return { ...session, wrongAttempts: session.wrongAttempts + 1, roundWrongAttempts: session.roundWrongAttempts + 1, selectedAnswerId: answerId, feedback: 'incorrect' }
  return { ...session, status: 'round-feedback', correctAnswers: session.correctAnswers + 1, firstTryCorrect: session.firstTryCorrect + (session.roundWrongAttempts === 0 ? 1 : 0), score: session.score + pointsForRound(session.roundWrongAttempts), selectedAnswerId: answerId, feedback: 'correct' }
}
export function advanceRound(session: GameSession, questionId: string): GameSession {
  if (session.status !== 'round-feedback' || session.questions[session.roundIndex].id !== questionId) return session
  if (session.roundIndex === session.questions.length - 1) {
    return { ...session, status: 'level-complete', score: session.score + (session.firstTryCorrect === session.questions.length ? PERFECT_BONUS : 0) }
  }
  return { ...session, status: 'playing', roundIndex: session.roundIndex + 1, roundWrongAttempts: 0, selectedAnswerId: null, feedback: null }
}
