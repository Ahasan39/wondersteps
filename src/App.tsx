import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { PreferencesProvider } from './store/Preferences'
import Home from './pages/Home'
const Levels = lazy(() => import('./pages/Levels'))
const Placeholder = lazy(() => import('./pages/Placeholder'))
export default function App() {
return <MotionConfig reducedMotion="user"><PreferencesProvider><HashRouter><Suspense fallback={<div className="loading" role="status">A little wonder is on its way…</div>}><Routes><Route element={<AppShell/>}><Route index element={<Home/>}/><Route path="levels" element={<Levels/>}/>{['play/:levelId', 'results/:levelId', 'achievements', 'rewards', 'settings', '*'].map(path => <Route key={path} path={path} element={<Placeholder/>}/>)}</Route></Routes></Suspense></HashRouter></PreferencesProvider></MotionConfig>
}

