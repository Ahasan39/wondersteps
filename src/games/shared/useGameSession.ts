import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateStars } from '../../engine/progressEngine'
import { useProgress } from '../../hooks/useProgress'
import type { Level, Stars } from '../../types/game'
import type { FeedbackEvent, GameDefinition, GameSession, RandomSource } from './types'
import { advanceRound, answerQuestion, createSession, FEEDBACK_DELAY_MS } from './session'
import { completionCoins } from './rewards'

export interface SessionOutcome { score:number; stars:Stars; coins:number; firstCompletion:boolean; newBest:boolean; improvedStars:boolean; persisted:boolean }
export function useGameSession(level:Level, game:GameDefinition, options: { random?:RandomSource; feedbackDelay?:number; onFeedback?:(event:FeedbackEvent)=>void } = {}) {
 const { recordAttempt, completeLevel, getLevelProgress } = useProgress()
 const [session, setSession] = useState<GameSession|null>(null)
 const [outcome, setOutcome] = useState<SessionOutcome|null>(null)
 const [error,setError] = useState('')
 const current = useRef<GameSession|null>(null)
 const completed = useRef(false)
 const callbacks = useRef({getLevelProgress,onFeedback:options.onFeedback})
 useEffect(() => { callbacks.current = {getLevelProgress,onFeedback:options.onFeedback} })
 const update = useCallback((next:GameSession|null) => { current.current=next;setSession(next) },[])
 const save = useCallback((finished:GameSession) => {
  if (completed.current) return
  const previous = callbacks.current.getLevelProgress(level.id)!
  const stars = calculateStars(finished.score,level.starThresholds!)
  if (!stars.ok) {setError('This step could not be saved. Please try again.');return}
  const coins = previous.completed ? 0 : completionCoins(stars.value)
  const result = completeLevel({levelId:level.id,score:finished.score,stars:stars.value,coinsEarned:coins})
  if (!result.ok) {setError('This step could not be saved. Please try again.');return}
  completed.current=true
  setError('')
  setOutcome({score:finished.score,stars:stars.value,coins,firstCompletion:!previous.completed,newBest:finished.score>previous.bestScore,improvedStars:stars.value>previous.stars,persisted:result.value.persisted})
  callbacks.current.onFeedback?.('levelComplete')
 },[completeLevel,level])
 useEffect(() => {
  if (!session || session.status !== 'round-feedback') return
  const questionId=session.questions[session.roundIndex].id
  const timer=window.setTimeout(() => {
   if (!current.current) return
   const next=advanceRound(current.current,questionId)
   if (next === current.current) return
   update(next)
   if (next.status === 'level-complete') save(next)
  },options.feedbackDelay ?? FEEDBACK_DELAY_MS)
  return () => window.clearTimeout(timer)
 },[session,options.feedbackDelay,save,update])
 const start = () => {
  if (current.current) return false
  const next=createSession(game,options.random)
  const attempt=recordAttempt(level.id)
  if (!attempt.ok) {setError('This step is not ready. Return to your adventure.');return false}
  setError('');update(next)
  return true
 }
 const answer = (questionId:string,answerId:string) => {
  if (!current.current) return
  const next=answerQuestion(current.current,questionId,answerId)
  if (next === current.current) return
  update(next)
  callbacks.current.onFeedback?.(next.feedback === 'correct' ? 'correct' : 'incorrect')
 }
 const replay = () => {completed.current=false;setOutcome(null);setError('');update(null)}
 return {session,outcome,error,start,answer,replay,retrySave:()=>{if(current.current?.status==='level-complete')save(current.current)}}
}
