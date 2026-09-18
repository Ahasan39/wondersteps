import { useEffect,useRef } from 'react'
import { animate,motion,useMotionValue,useReducedMotion,useTransform } from 'framer-motion'
import { ArrowRight,Coins,Compass,RotateCcw,Star,Unlock } from 'lucide-react'
import type { Level,LevelProgress } from '../../types/game'
import type { GameSession } from './types'
import type { SessionOutcome } from './useGameSession'
import { Mascot } from '../../components/game/Mascot'
import { ButtonLink } from '../../components/ui/Primitives'
import { useAudio } from '../../audio/AudioContext'
import { GameSparkles } from './Sparkles'

function CoinCount({coins}:{coins:number}){
 const reduced=useReducedMotion()
 const value=useMotionValue(0)
 const displayed=useTransform(value,number=>'+'+Math.round(number))
 useEffect(()=>{
  const control=animate(value,coins,{duration:reduced?0:.6,delay:reduced?0:.75,ease:'easeOut'})
  return ()=>control.stop()
 },[coins,reduced,value])
 return <strong><span className="sr-only">+{coins}</span><motion.span aria-hidden="true">{displayed}</motion.span></strong>
}
export function LevelResult({level,saved,session,outcome,replay}:{level:Level;saved:LevelProgress;session:GameSession;outcome:SessionOutcome;replay:()=>void}){
 const reduced=useReducedMotion()
 const audio=useAudio()
 const heading=useRef<HTMLHeadingElement>(null)
 useEffect(()=>{heading.current?.focus({preventScroll:true})},[])
 useEffect(()=>{
  const timers:number[]=[]
  const schedule=(event:Parameters<typeof audio.emit>[0],delay:number)=>timers.push(window.setTimeout(()=>audio.emit(event),reduced?0:delay))
  if(reduced){if(outcome.stars>0)schedule('star',0)}
  else for(let star=0;star<outcome.stars;star++)schedule('star',200+star*220)
  if(outcome.coins>0)schedule('coin',750)
  if(outcome.firstCompletion)schedule('levelUnlock',1100)
  return ()=>timers.forEach(timer=>window.clearTimeout(timer))
 },[outcome,audio,reduced])
 return <motion.div className="level-result" aria-labelledby="result-title" initial={reduced?false:{opacity:.8,y:6}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.18}}>
  <div className="result-pip"><Mascot state="celebrating"/><GameSparkles celebration/></div>
  <h2 id="result-title" tabIndex={-1} ref={heading}>Level Complete!</h2><p className="result-encouragement">You did it! Every little challenge is complete.</p>
  <span className="star-display result-stars" role="img" aria-label={outcome.stars+' of 3 stars'}>{[1,2,3].map(star=>star<=outcome.stars?<motion.span key={star} initial={reduced?false:{opacity:0,scale:.4,y:8}} animate={{opacity:1,scale:reduced?1:[.4,1.16,1],y:0}} transition={{duration:reduced?0:.35,delay:reduced?0:.2+(star-1)*.22}}><Star className="earned-star" aria-hidden="true"/></motion.span>:<span key={star}><Star className="empty-star" aria-hidden="true"/></span>)}</span>
  <div className="result-stats"><span>Final score <strong>{outcome.score}</strong></span><span>Correct answers <strong>{session.correctAnswers} / {session.questions.length}</strong></span>
   <motion.span className="coin-reward" initial={false} animate={outcome.coins>0&&!reduced?{scale:[1,1.04,1]}:{scale:1}} transition={{delay:.75,duration:.35}}><span><Coins size={18} aria-hidden="true"/> Coins earned</span>{outcome.coins>0?<CoinCount coins={outcome.coins}/>:<strong>+0</strong>}</motion.span></div>
  <div className="result-best"><p className="new-best">{outcome.newBest?'New best!':'Keep exploring. Every try is a little victory.'}</p><p className="saved-best">Saved best: {saved.bestScore} points · {saved.stars} stars</p></div>
  <div className="result-unlock">{outcome.firstCompletion&&<motion.p className="unlock-message" initial={reduced?false:{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{delay:reduced?0:1.1,duration:reduced?0:.3}}><Unlock size={18} aria-hidden="true"/>{level.id<5?'Level '+(level.id+1)+' Unlocked!':'World 1 complete! Level 6 is unlocked and coming soon.'}</motion.p>}</div>
  {!outcome.persisted&&<p role="status">Progress is saved for this visit. Browser storage is unavailable.</p>}
  <div className="result-actions">{level.id<5?<ButtonLink to={'/play/'+(level.id+1)}><ArrowRight size={20}/> Next Level</ButtonLink>:<ButtonLink to="/levels"><Compass size={20}/> Back to Adventure</ButtonLink>}
   <button className="game-button secondary" onClick={replay}><RotateCcw size={20} aria-hidden="true"/> Replay Level</button><ButtonLink to="/levels" secondary><Compass size={20}/> Level Map</ButtonLink></div>
 </motion.div>
}
