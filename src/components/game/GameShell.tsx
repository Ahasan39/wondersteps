import { Compass, Rocket } from 'lucide-react'
import type { GameStatus, Level, LevelProgress, World } from '../../types/game'
import { Badge, ButtonLink } from '../ui/Primitives'
import { StarDisplay } from './StarDisplay'

export function GameShell({ level, world, progress, status }: {
  level: Level; world: World; progress: LevelProgress; status: Extract<GameStatus, 'not-ready'>
}) {
  return <section className="game-shell" aria-labelledby="game-title" data-game-status={status}>
    <header className="game-shell-header"><Badge>LEVEL {level.id} · {world.name}</Badge><h1 id="game-title">{level.name}</h1>
      <p>{progress.completed ? 'A familiar step, ready to revisit.' : 'A new little discovery is on its way.'}</p>
      {progress.completed && <div className="game-saved-result"><StarDisplay stars={progress.stars}/><span>Best score: {progress.bestScore}</span></div>}
    </header>
    <div className="rounds-foundation" aria-label="Future round progress">Rounds will appear here when the game is ready.</div>
    <div className="game-stage"><Rocket size={48} aria-hidden="true"/><h2>Pip is getting things ready!</h2><p>{level.name} gameplay is coming in the next implementation phase.</p><p className="stage-note">Visiting this page does not start an attempt.</p></div>
    <ButtonLink to="/levels" secondary><Compass size={20}/> Back to adventure</ButtonLink>
  </section>
}
