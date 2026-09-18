import { Compass, Gift, Rocket, Settings, Sparkles, Star, Trophy, Volume2, VolumeX } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { levels } from '../data/worlds'
import { usePreferences } from '../store/PreferencesContext'
import { Badge, ButtonLink, GameCard } from '../components/ui/Primitives'
import { ResetProgress } from '../components/game/ResetProgress'

export default function Placeholder() {
  const { pathname } = useLocation()
  const { levelId } = useParams()
  const { soundEnabled,toggleSound,musicEnabled,sfxEnabled,toggleMusic,toggleSfx,preferencesPersisted } = usePreferences()
  const level = levels.find(item => String(item.id) === levelId)
  const isResults = pathname.startsWith('/results/')
  const isSettings = pathname === '/settings'
  const isAchievements = pathname === '/achievements'
  const isRewards = pathname === '/rewards'
  const adventureDestination = isResults || isAchievements || isRewards
  const Icon = isSettings ? Settings : isAchievements ? Trophy : isRewards ? Gift : Rocket
  const title = isSettings ? 'Just your way' : isAchievements ? 'Little victories await' : isRewards ? 'Pip’s treasure nook' : isResults && !level ? 'This step is still a mystery' : isResults ? 'Your story is just beginning' : 'Let’s find your way'
  const description = isSettings ? 'A cozy little corner for your preferences.' : isAchievements ? 'Every little discovery will be worth celebrating. When gameplay arrives, your achievements will find a home here.' : isRewards ? 'A new hat? A cozy scarf? Future adventures may bring little outfits for Pip. Rewards will become available through play.' : isResults ? 'The game results screen is coming with gameplay. Your saved best scores and stars are shown on completed map steps.' : 'This page doesn’t exist. Pip can help you get back home.'
  return <div className={`empty-page ${isAchievements ? 'achievements-page' : isRewards ? 'rewards-page' : ''}`}>
    <GameCard>
      <div className="empty-illustration"><span className="empty-spark spark-left" aria-hidden="true"><Star size={25}/></span><span className="empty-icon"><Icon size={46}/></span><span className="empty-spark spark-right" aria-hidden="true"><Sparkles size={29}/></span></div>
      <Badge>{isSettings ? 'YOUR COZY CORNER' : isAchievements ? 'BIG SMILES FOR LITTLE MILESTONES' : isRewards ? 'A LITTLE MAGIC FOR PIP' : 'THE ADVENTURE IS GROWING'}</Badge>
      <h1>{title}</h1><p>{description}</p>
      {(isAchievements || isRewards) && <div className="empty-state-note">{isAchievements ? 'No achievements earned yet' : 'No treasures collected yet'}<small>Your adventure is still at the beginning.</small></div>}
      {isSettings && <><div className="preference-row"><span><strong>All audio</strong><small>Music and sound effects · saved on this device</small></span><button className="sound-switch" aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>} {soundEnabled ? 'On' : 'Off'}</button></div>
      <div className="preference-row"><span><strong>Music</strong><small>Soft adventure melody during play</small></span><button className="sound-switch" aria-label={musicEnabled?'Disable music':'Enable music'} aria-pressed={musicEnabled} onClick={toggleMusic}>{musicEnabled?'On':'Off'}</button></div>
      <div className="preference-row"><span><strong>Sound effects</strong><small>Gentle taps, answers and celebrations</small></span><button className="sound-switch" aria-label={sfxEnabled?'Disable sound effects':'Enable sound effects'} aria-pressed={sfxEnabled} onClick={toggleSfx}>{sfxEnabled?'On':'Off'}</button></div>
      <p className="audio-note">Audio begins after a tap. Music stays quieter than sound effects.</p>{!preferencesPersisted&&<p role="status">Audio settings work for this visit, but your browser could not save them.</p>}
      <div className="motion-note"><Sparkles size={18}/><span>Animations follow your device’s reduced-motion setting.</span></div></>}
      <ButtonLink to={adventureDestination ? '/levels' : '/'}><Compass size={20}/>{adventureDestination ? 'Back to adventure' : 'Back to home'}</ButtonLink>
      {isAchievements && <ButtonLink to="/rewards" secondary><Gift size={20}/> Visit rewards</ButtonLink>}
      {isSettings && <ResetProgress/>}
    </GameCard>
  </div>
}
