import { Compass,Play,Volume2 } from 'lucide-react'
import { useCallback,useEffect } from 'react'
import { motion,useReducedMotion } from 'framer-motion'
import type { Level,World } from '../../types/game'
import type { GameDefinition } from './types'
import { useProgress } from '../../hooks/useProgress'
import { GameShell } from '../../components/game/GameShell'
import { Mascot } from '../../components/game/Mascot'
import { ButtonLink } from '../../components/ui/Primitives'
import { ChoiceGrid,FeedbackMessage,QuestionPrompt,RoundProgress } from './GameUI'
import { useGameSession } from './useGameSession'
import { useAudio } from '../../audio/AudioContext'
import { LevelResult } from './LevelResult'

export function LearningGame({level,world,game}:{level:Level;world:World;game:GameDefinition}){
 const {getLevelProgress}=useProgress()
 const saved=getLevelProgress(level.id)!
 const audio=useAudio()
 const reduced=useReducedMotion()
 const {session,outcome,error,start,answer,replay,retrySave}=useGameSession(level,game,{onFeedback:audio.emit})
 const focusStart=useCallback((node:HTMLButtonElement|null)=>node?.focus({preventScroll:true}),[])
 useEffect(()=>()=>audio.endGame(),[audio])
 const begin=()=>{if(start())audio.startGame()}
 const playAgain=()=>{audio.endGame();replay()}
 const question=session&&!outcome?session.questions[session.roundIndex]:null
 useEffect(()=>{if(question&&session?.feedback===null)audio.speakPrompt(question)},[audio,question,session?.feedback])
 useEffect(()=>{if(session?.feedback==='correct')audio.speakCorrectPraise();else if(session?.feedback==='incorrect')audio.speakRetryEncouragement()},[audio,session?.feedback,session?.wrongAttempts,session?.correctAnswers])
 useEffect(()=>{if(outcome)audio.speakLevelComplete()},[audio,outcome])
 return <GameShell level={level} world={world} progress={saved} status={!session?'ready':outcome?'finished':'playing'}>
  {!session?<div className="game-intro"><Mascot/><h2>{game.intro}</h2><p>10 little challenges</p><button ref={focusStart} data-game-start className="game-button" onClick={begin}><Play size={20} aria-hidden="true"/> Start</button><ButtonLink to="/levels" secondary><Compass size={20}/> Back to adventure</ButtonLink></div>
   :outcome?<LevelResult level={level} saved={saved} session={session} outcome={outcome} replay={playAgain}/>
   :<div className="learning-stage"><RoundProgress session={session}/><div className="pip-companion"><Mascot key={session.correctAnswers+'-'+session.wrongAttempts} state={session.feedback==='correct'?'happy':session.feedback==='incorrect'?'encouraging':'thinking'}/><FeedbackMessage session={session}/></div>
    <motion.div className="round-challenge" key={session.questions[session.roundIndex].id} initial={reduced?false:{opacity:.85,y:5}} animate={reduced?{opacity:1,y:0}:session.feedback==='correct'?{opacity:[1,1,.15],y:[0,0,-3]}:{opacity:1,y:0}} transition={{duration:reduced?0:session.feedback==='correct'?.65:.16,times:session.feedback==='correct'?[0,.85,1]:undefined}}>
     <div className="question-tools"><button type="button" className="hear-again" aria-label="Hear question again" title="Hear question again" onClick={()=>audio.speakPrompt(session.questions[session.roundIndex])}><Volume2 size={20}/></button></div>
     <QuestionPrompt question={session.questions[session.roundIndex]}/><ChoiceGrid session={session} onAnswer={answer}/></motion.div></div>}
  {error&&<div role="alert"><p>{error}</p>{session?.status==='level-complete'&&<button className="game-button" onClick={retrySave}>Try saving again</button>}</div>}
 </GameShell>
}
