import { useEffect,useRef,useState } from 'react'
import { Compass,Play,Volume2 } from 'lucide-react'
import type { Level,World } from '../../types/game.ts'
import { calculateStars } from '../../engine/progressEngine.ts'
import { useProgress } from '../../hooks/useProgress.ts'
import { useAudio } from '../../audio/AudioContext.ts'
import { GameShell } from '../../components/game/GameShell.tsx'
import { Mascot } from '../../components/game/Mascot.tsx'
import { ButtonLink } from '../../components/ui/Primitives.tsx'
import { LevelResult } from '../shared/LevelResult.tsx'
import { completionCoins } from '../shared/rewards.ts'
import type { SessionOutcome } from '../shared/useGameSession.ts'
import { createHunt,createMemory,createOrder,finalTenRoundScore,flipMemory,memoryScore,resolveMemory,roundScore,tapHunt,tapOrder,type HuntState,type MemoryState,type OrderState } from './engine.ts'
import { huntTargets,miniRounds,orderStarts } from './content.ts'

const intros={7:'Turn over the cards and find three matching pairs.',8:'Find every copy of the magic letter.',9:'Tap the numbers from smallest to biggest.',10:'Four forest skills come together in one final challenge.'} as const
const instructions={7:'Find the matching pairs.',8:'Find all the matching letters.',9:'Tap the numbers from smallest to biggest.',10:'Complete the Magic Forest challenge.'} as const
const symbol=(name:string)=>name==='leaf'?'🍃':name==='star'?'★':name==='moon'?'☾':name==='flower'?'✿':name==='sun'?'☀':name

export function World2Game({level,world}:{level:Level;world:World}){
 const {recordAttempt,completeLevel,getLevelProgress}=useProgress(),audio=useAudio(),saved=getLevelProgress(level.id)!
 const [started,setStarted]=useState(false),[outcome,setOutcome]=useState<SessionOutcome|null>(null),[error,setError]=useState(''),done=useRef(false)
 const [feedback,setFeedback]=useState(''),[score,setScore]=useState(0),[wrong,setWrong]=useState(0),[round,setRound]=useState(0)
 const [totalWrong,setTotalWrong]=useState(0)
 const [memory,setMemory]=useState<MemoryState|null>(null),[hunt,setHunt]=useState<HuntState|null>(null),[order,setOrder]=useState<OrderState|null>(null)
 const instruction=level.id===8&&hunt?`Find all the letter ${hunt.target}'s.`:level.id===10?miniRounds[round]?.prompt??instructions[10]:instructions[level.id as 7|8|9|10]
 const finish=(finalScore:number,label='Challenges')=>{
  if(done.current)return;const previous=getLevelProgress(level.id)!,stars=calculateStars(finalScore,level.starThresholds!)
  if(!stars.ok)return setError('This step could not be saved. Please try again.')
  const coins=previous.completed?0:completionCoins(stars.value),result=completeLevel({levelId:level.id,score:finalScore,stars:stars.value,coinsEarned:coins})
  if(!result.ok)return setError('This step could not be saved. Please try again.')
  done.current=true;setOutcome({score:finalScore,stars:stars.value,coins,firstCompletion:!previous.completed,newBest:finalScore>previous.bestScore,improvedStars:stars.value>previous.stars,persisted:result.value.persisted});audio.emit('levelComplete');audio.speakLevelComplete();setFeedback(label)
 }
 const start=()=>{const attempt=recordAttempt(level.id);if(!attempt.ok)return setError('This step is not ready. Return to your adventure.');done.current=false;setStarted(true);setScore(0);setWrong(0);setTotalWrong(0);setRound(0);setFeedback('');audio.startGame();if(level.id===7)setMemory(createMemory());if(level.id===8)setHunt(createHunt(huntTargets[0]));if(level.id===9)setOrder(createOrder(orderStarts[0]))}
 const replay=()=>{audio.endGame();setStarted(false);setOutcome(null);setError('');done.current=false}
 useEffect(()=>()=>audio.endGame(),[audio])
 useEffect(()=>{if(started&&!outcome&&instruction)audio.speakInstruction(instruction)},[audio,instruction,outcome,started])
 useEffect(()=>{if(!memory?.locked)return;const timer=window.setTimeout(()=>setMemory(current=>current?resolveMemory(current):current),500);return()=>clearTimeout(timer)},[memory?.locked])
 const chooseMemory=(id:string)=>{if(!memory)return;const next=flipMemory(memory,id);if(next===memory)return;setMemory(next);if(next.open.length===2){const cards=next.open.map(key=>next.cards.find(c=>c.id===key)!);if(cards[0].symbol===cards[1].symbol){audio.emit('correct');setFeedback('A match!');audio.speakCorrectPraise();if(memory.cards.filter(card=>card.matched).length===4)window.setTimeout(()=>finish(memoryScore(memory.mismatches),'Pairs found'),520)}else{audio.emit('incorrect');setFeedback('Keep looking!')}}}
 const advanceHunt=(next:HuntState)=>{const complete=next.letters.filter(x=>x.letter===next.target).every(x=>x.found);if(!complete)return setHunt(next);const earned=roundScore(next.wrong),newScore=score+earned,newWrong=wrong+next.wrong;audio.emit('correct');audio.speakCorrectPraise();if(round===9)return finish(finalTenRoundScore(newScore,newWrong));setScore(newScore);setWrong(newWrong);setRound(value=>value+1);setHunt(createHunt(huntTargets[round+1]));setFeedback('Letter found!')}
 const chooseHunt=(id:string)=>{if(!hunt)return;const item=hunt.letters.find(x=>x.id===id),next=tapHunt(hunt,id);if(next===hunt)return;if(item?.letter!==hunt.target){audio.emit('incorrect');setFeedback('Look for '+hunt.target)}advanceHunt(next)}
 const advanceOrder=(next:OrderState)=>{if(next.placed.length<4)return setOrder(next);const earned=roundScore(next.wrong),newScore=score+earned,newWrong=wrong+next.wrong;audio.emit('correct');audio.speakCorrectPraise();if(round===9)return finish(finalTenRoundScore(newScore,newWrong));setScore(newScore);setWrong(newWrong);setRound(value=>value+1);setOrder(createOrder(orderStarts[round+1]));setFeedback('In order!')}
 const chooseOrder=(value:number)=>{if(!order)return;const next=tapOrder(order,value);if(next===order)return;if(next.wrong>order.wrong){audio.emit('incorrect');audio.speakRetryEncouragement();setFeedback('Try the smallest number next.')}advanceOrder(next)}
 const chooseMini=(answer:string)=>{const task=miniRounds[round];if(answer!==task.answer){setWrong(value=>value+1);setTotalWrong(value=>value+1);audio.emit('incorrect');audio.speakRetryEncouragement();setFeedback('Almost! Try again.');return}const earned=roundScore(wrong),newScore=score+earned;audio.emit('correct');audio.speakCorrectPraise();if(round===9)return finish(finalTenRoundScore(newScore,totalWrong));setScore(newScore);setWrong(0);setRound(value=>value+1);setFeedback('Great job!')}
 const fake={correctAnswers:level.id===7?3:10,questions:Array.from({length:level.id===7?3:10},()=>({}))} as never
 return <GameShell level={level} world={world} progress={saved} status={!started?'ready':outcome?'finished':'playing'}>
  {!started?<div className="game-intro forest-intro"><Mascot/><h2>{intros[level.id as 7|8|9|10]}</h2><p>{level.id===7?'3 magical pairs':'10 little challenges'}</p><button data-game-start className="game-button" onClick={start}><Play size={20}/> Start</button><ButtonLink to="/levels" secondary><Compass size={20}/> Back to adventure</ButtonLink></div>
  :outcome?<LevelResult level={level} saved={saved} session={fake} outcome={outcome} replay={replay} performanceLabel={level.id===7?'Pairs found':'Challenges'}/>
  :<div className="world2-stage"><div className="special-progress"><span>{level.id===7?'Pairs':`Round ${round+1} / 10`}</span><span>Score: {level.id===7?memoryScore(memory?.mismatches??0):score}</span></div><div className="special-guide"><Mascot state={feedback?'happy':'thinking'}/><p role="status">{feedback||instruction}</p><button className="hear-again" aria-label="Hear question again" onClick={()=>audio.speakInstruction(instruction)}><Volume2 size={20}/></button></div>
   {level.id===7&&memory&&<div className="memory-grid">{memory.cards.map(card=>{const shown=card.matched||memory.open.includes(card.id);return <button key={card.id} data-symbol={card.symbol} className={'memory-card '+(card.matched?'matched':'')} disabled={card.matched||memory.locked} aria-label={card.matched?`Memory card, matched, ${card.symbol}`:shown?`Memory card, ${card.symbol}`:'Memory card, hidden'} onClick={()=>chooseMemory(card.id)}><span aria-hidden="true">{shown?symbol(card.symbol):'?'}</span></button>})}</div>}
   {level.id===8&&hunt&&<><h2>Find all the letter <strong>{hunt.target}</strong>'s</h2><div className="letter-grid">{hunt.letters.map(item=><button key={item.id} disabled={item.found} className={item.found?'found':''} aria-label={`Letter ${item.letter}${item.found?', found':''}`} onClick={()=>chooseHunt(item.id)}>{item.found?'✓':item.letter}</button>)}</div></>}
   {level.id===9&&order&&<><h2>Put the numbers in order</h2><div className="order-slots" aria-label="Ordered numbers">{order.numbers.map((_,i)=><span key={i}>{order.placed[i]??'?'}</span>)}</div><div className="number-grid">{order.numbers.map(number=><button key={number} disabled={order.placed.includes(number)} aria-label={'Number '+number} onClick={()=>chooseOrder(number)}>{number}</button>)}</div></>}
   {level.id===10&&<><h2>{miniRounds[round].prompt}</h2><div className={'mini-grid mini-'+miniRounds[round].kind}>{miniRounds[round].choices.map(choice=><button key={choice} aria-label={choice} onClick={()=>chooseMini(choice)}>{miniRounds[round].kind==='shape'?<span className={'shape-icon shape-'+choice}/>:symbol(choice)}</button>)}</div></>}
  </div>}{error&&<p role="alert">{error}</p>}
 </GameShell>
}
