import { ArrowLeft, Coins, Footprints, Settings, Star, Volume2, VolumeX } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { usePreferences } from '../../store/PreferencesContext'
import { IconButton } from '../ui/Primitives'

export function AppShell() {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  const { soundEnabled, toggleSound } = usePreferences()
  const reduced = useReducedMotion()
  useEffect(() => { window.scrollTo(0, 0); main.current?.focus() }, [pathname])
  return <div className="app-shell">
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
    <header className="game-header">
      <Link to="/" className="brand" aria-label="WonderSteps home"><span className="brand-icon"><Footprints size={25}/></span><span>Wonder<span className="brand-accent">Steps</span></span></Link>
      <div className="hud">
        <div className="hud-counters" aria-label="Progress is not available yet"><span className="counter" title="Stars will arrive with gameplay" aria-label="Stars: not available yet"><Star className="star-icon" size={20}/><span aria-hidden="true">—</span></span><span className="counter" title="Coins will arrive with gameplay" aria-label="Coins: not available yet"><Coins className="coin-icon" size={20}/><span aria-hidden="true">—</span></span></div>
        <IconButton title="Session sound preference · audio coming later" aria-label={soundEnabled ? 'Turn sound preference off' : 'Turn sound preference on'} aria-pressed={soundEnabled} onClick={toggleSound}>{soundEnabled ? <Volume2 size={21}/> : <VolumeX size={21}/>}</IconButton>
        <Link className="icon-button" to="/settings" title="Settings" aria-label="Settings"><Settings size={21}/></Link>
      </div>
    </header>
    <main ref={main} id="main" tabIndex={-1} className="page-container">
      {pathname !== '/' && <Link className="back-link" to={pathname.startsWith('/play') || pathname.startsWith('/results') ? '/levels' : '/'}><ArrowLeft size={18}/> {pathname.startsWith('/play') || pathname.startsWith('/results') ? 'Back to levels' : 'Back home'}</Link>}
      <motion.div key={pathname} className="route-content" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.18 }}><Outlet/></motion.div>
    </main>
    <footer className="app-footer"><Footprints size={15}/><span>Little steps. Wonderful discoveries.</span><span className="footer-phase">Adventure preview · Phase 2</span></footer>
  </div>
}
