import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
export function ButtonLink({ to, children, secondary = false }: { to: string; children: ReactNode; secondary?: boolean }) {
return <motion.div tabIndex={-1} whileTap={{ scale: 0.97 }} className="button-wrap"><Link className={`button ${secondary ? 'button-secondary' : 'button-primary'}`} to={to}>{children}</Link></motion.div>
}
export function IconButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className="icon-button" {...props}>{children}</button> }
export function Badge({ children }: { children: ReactNode }) { return <span className="badge">{children}</span> }
export function GameCard({ children }: { children: ReactNode }) { return <div className="game-card">{children}</div> }
