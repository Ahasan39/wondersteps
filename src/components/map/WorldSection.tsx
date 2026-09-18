import { Check, Cloud, LockKeyhole, Play, Star, Sun, Trees } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Level, LevelStatus, World } from '../../types/game'
import { useProgress } from '../../hooks/useProgress'
export function LevelPath() { return <svg className="level-path" viewBox="0 0 300 570" preserveAspectRatio="none" aria-hidden="true"><path d="M150 50 C150 100 230 95 230 160 S70 210 70 275 S230 325 230 390 S150 450 150 510"/></svg> }
export function LevelNode({ level, status }: { level: Level; status: LevelStatus }) {
const reduced = useReducedMotion()
return <div className={`level-stop stop-${(level.id - 1) % 5} ${status}`}><motion.div animate={status === 'current' && !reduced ? { opacity: [1, 0.92, 1] } : undefined} transition={{ duration: 3, repeat: Infinity }}>
{status === 'locked' ? <button className="level-node" disabled aria-label={`Level ${level.id}: ${level.name}, locked`}><LockKeyhole size={22}/><span>{level.id}</span></button> : <Link className="level-node" to={`/play/${level.id}`} aria-label={`Level ${level.id}: ${level.name}, ${status}`}>{status === 'completed' ? <Check size={24}/> : <Play size={24} fill="currentColor"/>}<span>{level.id}</span></Link>}
</motion.div><span className="level-name">{level.name}</span>{status === 'current' && <span className="start-label">Start here</span>}{status === 'completed' && <span className="completed-label">Completed</span>}</div>
}
export function WorldSection({ world, levels, index }: { world: World; levels: Level[]; index: number }) {
const { statusFor } = useProgress()
const Icon = { meadow: Sun, forest: Trees, cloud: Cloud, galaxy: Star }[world.theme]
return <section className={`world-section ${world.theme}`} aria-labelledby={`world-${world.id}`}><header><span className="world-symbol"><Icon size={30}/></span><span className="eyebrow">WORLD {String(index + 1).padStart(2, '0')} · LEVELS {levels[0].id}–{levels[levels.length - 1].id}</span><h2 id={`world-${world.id}`}>{world.name}</h2><p>{world.description}</p>{index > 0 && <span className="world-lock"><LockKeyhole size={14}/> A future part of your journey</span>}</header><div className="world-path"><LevelPath/>{levels.map(level => <LevelNode key={level.id} level={level} status={statusFor(level.id)}/>)}</div></section>
}
