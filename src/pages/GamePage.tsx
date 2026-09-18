import { Navigate, useParams } from 'react-router-dom'
import { levels, worlds } from '../data/worlds'
import { useProgress } from '../hooks/useProgress'
import { GameShell } from '../components/game/GameShell'

export default function GamePage() {
  const { levelId } = useParams()
  const { isLevelUnlocked, getLevelProgress } = useProgress()
  const id = levelId && /^[1-9]\d*$/.test(levelId) ? Number(levelId) : NaN
  const level = levels.find(item => item.id === id)
  if (!level || !isLevelUnlocked(id)) return <Navigate to="/levels" replace/>
  const world = worlds.find(item => item.id === level.worldId)!
  return <GameShell level={level} world={world} progress={getLevelProgress(id)!} status="not-ready"/>
}
