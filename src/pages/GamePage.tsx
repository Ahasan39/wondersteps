import { Navigate, useParams } from 'react-router-dom'
import { levels, worlds } from '../data/worlds'
import { useProgress } from '../hooks/useProgress'
import { GameShell } from '../components/game/GameShell'
import { resolveGame } from '../games/registry'
import { LearningGame } from '../games/shared/LearningGame'

export default function GamePage() {
  const { levelId } = useParams()
  const { isLevelUnlocked, getLevelProgress } = useProgress()
  const id = levelId && /^[1-9]\d*$/.test(levelId) ? Number(levelId) : NaN
  const level = levels.find(item => item.id === id)
  if (!level || !isLevelUnlocked(id)) return <Navigate to="/levels" replace/>
  const world = worlds.find(item => item.id === level.worldId)!
  const game = resolveGame(id)
  if (game) return <LearningGame key={id} level={level} world={world} game={game}/>
  return <GameShell level={level} world={world} progress={getLevelProgress(id)!} status="not-ready"/>
}
