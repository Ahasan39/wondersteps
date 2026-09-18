import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Choice, GameSession, Question } from './types'
import { Visual } from './Visual'
import { positiveFeedback } from './session'
import { GameSparkles } from './Sparkles'

export function RoundProgress({ session }: { session: GameSession }) {
 return <div className="round-progress"><span>Round {session.roundIndex + 1} / {session.questions.length}</span><span>Score: {session.score}</span>
  <progress aria-label="Completed rounds" value={session.correctAnswers} max={session.questions.length}/>
 </div>
}
export function QuestionPrompt({ question }: { question: Question }) {
 const { prompt } = question
 const focus = useRef<HTMLHeadingElement>(null)
 useEffect(() => { focus.current?.focus({ preventScroll:true }) }, [question.id])
 return <div className={'question-prompt prompt-' + prompt.kind}>
  <h2 ref={focus} tabIndex={-1}>{question.instruction}</h2>
  {prompt.kind === 'color' ? <strong className="prompt-word">{prompt.name}</strong>
   : prompt.kind === 'alphabet' ? <strong className="prompt-letter">{prompt.letter}</strong>
   : prompt.kind === 'count' ? <div className="count-group" role="img" aria-label={prompt.count + ' ' + prompt.visual + ' objects'} style={{ '--count-columns': Math.min(prompt.count, 5) } as React.CSSProperties}>
    {Array.from({ length: prompt.count }, (_, i) => <span className="count-object" key={i}><Visual id={prompt.visual}/></span>)}
   </div>
   : <div className="named-prompt"><Visual id={prompt.visual}/><strong className="prompt-word">{prompt.name}</strong></div>}
 </div>
}
export function AnswerCard({ choice, state, disabled, onAnswer }: { choice: Choice; state:'default'|'correct'|'incorrect'; disabled:boolean; onAnswer:()=>void }) {
 const reduced = useReducedMotion()
 return <motion.button type="button" className={'answer-card answer-' + state} aria-label={choice.label} disabled={disabled}
  onClick={onAnswer} onKeyDown={event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault() }}
  whileTap={reduced?undefined:{scale:.97}}
  animate={reduced ? {} : state === 'correct' ? {scale:[1,1.055,1]} : state === 'incorrect' ? {x:[0,-3,3,0]} : {scale:1,x:0}}
  transition={{duration:reduced ? 0 : .35}}>
  {choice.color ? <span className={'color-swatch swatch-' + choice.color} aria-hidden="true"/>
   : choice.visual ? <Visual id={choice.visual}/> : <strong className="number-choice">{choice.number}</strong>}
  <span className="answer-label">{choice.label}</span>{state === 'correct' && <><motion.span className="answer-check" initial={reduced?false:{opacity:0,scale:.4}} animate={{opacity:1,scale:1}} transition={{duration:reduced?0:.2}}><Check size={20} aria-hidden="true"/></motion.span><GameSparkles/></>}
 </motion.button>
}
export function ChoiceGrid({ session, onAnswer }: { session:GameSession; onAnswer:(questionId:string,answerId:string)=>void }) {
 const question = session.questions[session.roundIndex]
 return <div className="choice-grid" role="group" aria-label="Choose an answer">{question.choices.map(choice => <AnswerCard key={question.id + choice.id} choice={choice}
  disabled={session.status !== 'playing'} state={session.selectedAnswerId === choice.id ? session.feedback ?? 'default' : 'default'}
  onAnswer={() => onAnswer(question.id,choice.id)}/>)}</div>
}
export function FeedbackMessage({ session }: { session: GameSession }) {
 return <p className={'round-feedback feedback-' + (session.feedback ?? 'waiting')} role="status" aria-live="polite" aria-atomic="true">
  {session.feedback === 'correct' ? positiveFeedback[(session.correctAnswers - 1) % positiveFeedback.length] : session.feedback === 'incorrect' ? 'Almost! Try again' : 'Take your time. You can do it!'}
 </p>
}
