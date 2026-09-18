import { ArrowLeft, Coins, Footprints, Settings, Star, Volume2, VolumeX } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { usePreferences } from '../../store/PreferencesContext'
import { useProgress } from '../../hooks/useProgress'
import { IconButton } from '../ui/Primitives'
export function AppShell() {
const { pathname } = useLocation()
const main = useRef<HTMLElement>(null)
const { soundEnabled, toggleSound } = usePreferences()
const { progress } = useProgress()
useEffect(() => { window.scrollTo(0, 0); main.current?.focus() }, [pathname])
return <div className="app-shell"><a className="skip-link" href="#main" onClick={event => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
<header className="game-header"><Link to="/" className="brand" aria-label="WonderSteps home"><span className="brand-icon"><Footprints size={25}/></span><span>Wonder<span className="brand-accent">Steps</span></span></Link>
<div className="hud"><span className="counter" aria-label={`${progress.stars} stars, no stars earned yet`}><Star className="star-icon" size={20}/>{progress.stars}</span><span className="counter" aria-label={`${progress.coins} coins, no coins earned yet`}><Coins className="coin-icon" size={20}/>{progress.coins}</span><span className="hud-divider"/><IconButton aria-label={soundEnabled ? 'Turn sound preference off' : 'Turn sound preference on'} aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled ? <Volume2 size={21}/> : <VolumeX size={21}/>}</IconButton><Link className="icon-button" to="/settings" aria-label="Settings"><Settings size={21}/></Link></div></header>
<main ref={main} id="main" tabIndex={-1} className="page-container">{pathname !== '/' && <Link className="back-link" to={pathname.startsWith('/play') || pathname.startsWith('/results') ? '/levels' : '/'}><ArrowLeft size={18}/> {pathname.startsWith('/play') || pathname.startsWith('/results') ? 'Back to levels' : 'Back home'}</Link>}<Outlet/></main>
<footer className="app-footer"><Footprints size={15}/><span>Little steps. Wonderful discoveries.</span><span className="footer-phase">Foundation preview · Phase 1</span></footer></div>
}
