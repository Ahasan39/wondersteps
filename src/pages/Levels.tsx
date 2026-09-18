import { Compass } from 'lucide-react'
import { worlds, levels } from '../data/worlds'
import { WorldSection } from '../components/map/WorldSection'
export default function Levels() { return <><div className="page-heading"><span className="eyebrow"><Compass size={16}/> ONE LITTLE STEP AT A TIME</span><h1>Your adventure awaits</h1><p>Four wonderful worlds. So much to discover.</p><div className="notice">Your journey starts at Level 1. Games and unlocking arrive in a future phase.</div></div><div className="worlds">{worlds.map((world, index) => <WorldSection key={world.id} world={world} index={index} levels={levels.filter(level => level.worldId === world.id)}/>)}</div></> }

