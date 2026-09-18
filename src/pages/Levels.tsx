import { Compass } from 'lucide-react'
import { worlds, levels } from '../data/worlds'
import { WorldSection } from '../components/map/WorldSection'
import { useProgress } from '../hooks/useProgress'
export default function Levels() {
  const { currentLevel } = useProgress()
  return <><div className="page-heading"><span className="eyebrow"><Compass size={16}/> ONE LITTLE STEP AT A TIME</span><h1>Your adventure awaits</h1><p>Four wonderful worlds. So much to discover.</p><div className="notice">{currentLevel === null ? 'Every step is complete. You can revisit any level.' : `Your next step is Level ${currentLevel}.`} Gameplay is coming in the next implementation phase.</div></div><div className="worlds">{worlds.map((world, index) => <WorldSection key={world.id} world={world} index={index} levels={levels.filter(level => level.worldId === world.id)}/>)}</div></>
}
