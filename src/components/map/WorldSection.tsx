import { Check, Cloud, LockKeyhole, Play, Star, Sun, Trees } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Level, LevelStatus, Stars, World } from '../../types/game'
import { useProgress } from '../../hooks/useProgress'
import { Environment } from '../game/Environment'
import { StarDisplay } from '../game/StarDisplay'

export function LevelPath() {
  return <div className="level-path" aria-hidden="true">
    <svg className="path-vertical" viewBox="0 0 300 600" preserveAspectRatio="none"><path d="M150 45C150 115 225 100 225 165S75 225 75 285S225 345 225 405S150 465 150 525"/></svg>
    <svg className="path-horizontal" viewBox="0 0 1000 300" preserveAspectRatio="none"><path d="M100 160C180 160 200 80 300 80S400 190 500 190S620 85 700 85S800 160 900 160"/></svg>
  </div>
}

export function LevelNode({ level, status, stars = 0 }: { level: Level; status: LevelStatus; stars?: Stars }) {
  return <div className={`level-stop stop-${(level.id - 1) % 5} ${status}`}>
    {status === 'locked'
      ? <button className="level-node" disabled title="Complete the previous level to unlock" aria-label={`Level ${level.id}: ${level.name}, locked`}><LockKeyhole size={20}/><span>{level.id}</span></button>
      : <Link className="level-node" to={`/play/${level.id}`} aria-label={`Level ${level.id}: ${level.name}, ${status}`}>{status === 'completed' ? <Check size={22}/> : <Play size={22} fill="currentColor"/>}<span>{level.id}</span></Link>}
    <span className="level-name">{level.name}</span>
    {status === 'current' && <span className="start-label">Play · {level.id === 1 ? 'start here' : 'next step'}</span>}
    {status === 'completed' && <><StarDisplay stars={stars}/><span className="completed-label">Completed · replay</span></>}
  </div>
}

export function WorldSection({ world, levels, index }: { world: World; levels: Level[]; index: number }) {
  const { statusFor, getLevelStars, isLevelUnlocked } = useProgress()
  const Icon = { meadow: Sun, forest: Trees, cloud: Cloud, galaxy: Star }[world.theme]
  return <section className={`world-section ${world.theme}`} aria-labelledby={`world-${world.id}`}>
    <div className="region-scene"><Environment theme={world.theme}/></div>
    <header className="world-heading">
      <span className="world-symbol"><Icon size={27}/></span>
      <span className="eyebrow">WORLD {String(index + 1).padStart(2, '0')} · LEVELS {levels[0].id}–{levels[levels.length - 1].id}</span>
      <h2 id={`world-${world.id}`}>{world.name}</h2><p>{world.description}</p>
      {!isLevelUnlocked(levels[0].id) && <span className="world-lock"><LockKeyhole size={14}/> Complete the previous world to unlock</span>}
    </header>
    <div className="world-path"><LevelPath/>{levels.map(level => <LevelNode key={level.id} level={level} status={statusFor(level.id)} stars={getLevelStars(level.id)}/>)}</div>
  </section>
}
