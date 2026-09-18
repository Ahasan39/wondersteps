import { Compass, Play, RotateCcw, ArrowRight } from 'lucide-react'
import { useCallback } from 'react'
import type { Level, World } from '../../types/game'
import type { GameDefinition } from './types'
import { useProgress } from '../../hooks/useProgress'
import { GameShell } from '../../components/game/GameShell'
import { Mascot } from '../../components/game/Mascot'
import { StarDisplay } from '../../components/game/StarDisplay'
import { ButtonLink } from '../../components/ui/Primitives'
import { ChoiceGrid, FeedbackMessage, QuestionPrompt, RoundProgress } from './GameUI'
import { useGameSession } from './useGameSession'

export function LearningGame({ level,world,game }: {level:Level;world:World;game:GameDefinition}) {
 const {getLevelProgress}=useProgress()
 const saved=getLevelProgress(level.id)!
 const {session,outcome,error,start,answer,replay,retrySave}=useGameSession(level,game)
 const focusResult=useCallback((node:HTMLHeadingElement|null)=>node?.focus({preventScroll:true}),[])
 const focusStart=useCallback((node:HTMLButtonElement|null)=>node?.focus({preventScroll:true}),[])
 return <GameShell level={level} world={world} progress={saved} status={!session?'ready':outcome?'finished':'playing'}>
  {!session ? <div className="game-intro"><Mascot/><h2>{game.intro}</h2><p>10 little challenges</p><button ref={focusStart} className="game-button" onClick={start}><Play size={20} aria-hidden="true"/> Start</button><ButtonLink to="/levels" secondary><Compass size={20}/> Back to adventure</ButtonLink></div>
   : outcome ? <div className="level-result" aria-labelledby="result-title"><Mascot/><h2 id="result-title" tabIndex={-1} ref={focusResult}>Level Complete!</h2><p>You did it! Every little challenge is complete.</p>
    <StarDisplay stars={outcome.stars}/><div className="result-stats"><span>Final score <strong>{outcome.score}</strong></span><span>Correct answers <strong>{session.correctAnswers} / {session.questions.length}</strong></span><span>Coins earned <strong>+{outcome.coins}</strong></span></div>
    {outcome.newBest && <p className="new-best">New best!</p>}
    <p className="saved-best">Saved best: {saved.bestScore} points · {saved.stars} stars</p>
    {outcome.firstCompletion && level.id<5 && <p className="unlock-message">Level {level.id+1} Unlocked!</p>}
    {outcome.firstCompletion && level.id===5 && <p className="unlock-message">World 1 complete! Level 6 is unlocked and coming soon.</p>}
    {!outcome.persisted && <p role="status">Progress is saved for this visit. Browser storage is unavailable.</p>}
    <div className="result-actions">{level.id<5 ? <ButtonLink to={'/play/'+(level.id+1)}><ArrowRight size={20}/> Next Level</ButtonLink> : <ButtonLink to="/levels"><Compass size={20}/> Back to Adventure</ButtonLink>}
    <button className="game-button secondary" onClick={replay}><RotateCcw size={20} aria-hidden="true"/> Replay Level</button><ButtonLink to="/levels" secondary><Compass size={20}/> Level Map</ButtonLink></div>
   </div>
   : <div className="learning-stage"><RoundProgress session={session}/><QuestionPrompt question={session.questions[session.roundIndex]}/><ChoiceGrid session={session} onAnswer={answer}/><FeedbackMessage session={session}/></div>}
  {error && <div role="alert"><p>{error}</p>{session?.status==='level-complete' && <button className="game-button" onClick={retrySave}>Try saving again</button>}</div>}
 </GameShell>
}
