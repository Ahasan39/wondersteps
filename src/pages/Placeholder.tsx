import { Compass, Gift, Rocket, Settings, Trophy, Volume2, VolumeX } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { levels } from '../data/worlds'
import { usePreferences } from '../store/PreferencesContext'
import { Badge, ButtonLink, GameCard } from '../components/ui/Primitives'
export default function Placeholder() {
const { pathname } = useLocation()
const { levelId } = useParams()
const { soundEnabled, toggleSound } = usePreferences()
const level = levels.find(item => String(item.id) === levelId)
const isPlay = pathname.startsWith('/play/')
const isResults = pathname.startsWith('/results/')
const isSettings = pathname === '/settings'
const isAchievements = pathname === '/achievements'
const isRewards = pathname === '/rewards'
const Icon = isSettings ? Settings : isAchievements ? Trophy : isRewards ? Gift : Rocket
const title = isSettings ? 'Just your way' : isAchievements ? 'Little victories await' : isRewards ? 'A pocket full of surprises' : (isPlay || isResults) && !level ? 'This step is still a mystery' : isResults ? 'Your story is just beginning' : isPlay ? level!.name : 'Let’s find your way'
const description = isSettings ? 'A cozy little corner for your preferences.' : isAchievements ? 'You haven’t earned any achievements yet. Your discoveries will appear here when the games arrive.' : isRewards ? 'No rewards collected yet. This space is ready for future treasures.' : isResults ? 'No results yet. Scores and stars will appear after gameplay is added.' : isPlay && level ? level.id === 1 ? 'Pip is getting this adventure ready! Color Match gameplay is coming in a future phase.' : 'This level is locked. Your adventure will begin with Level 1 when gameplay arrives.' : 'This page doesn’t exist. Pip can help you get back home.'
return <div className="empty-page"><GameCard><span className="empty-icon"><Icon size={44}/></span><Badge>{isSettings ? 'YOUR PREFERENCES' : 'THE ADVENTURE IS GROWING'}</Badge><h1>{title}</h1><p>{description}</p>{isSettings && <div className="preference-row"><span><strong>Sound preference</strong><small>Session only · game audio is not added yet</small></span><button className="sound-switch" aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>} {soundEnabled ? 'On' : 'Off'}</button></div>}<ButtonLink to={isPlay || isResults ? '/levels' : '/'}><Compass size={20}/>{isPlay || isResults ? 'Explore the map' : 'Back to home'}</ButtonLink>{isAchievements && <ButtonLink to="/rewards" secondary><Gift size={20}/> Visit rewards</ButtonLink>}</GameCard></div>
}
