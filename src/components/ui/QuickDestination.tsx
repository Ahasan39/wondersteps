import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export function QuickDestination({ to, icon: Icon, title, description, tone }: {
  to: string; icon: LucideIcon; title: string; description: string; tone: 'gold' | 'violet' | 'sky'
}) {
  return <Link className={`quick-destination destination-${tone}`} to={to}>
    <span className="shortcut-icon"><Icon size={25}/></span>
    <span className="destination-copy"><strong>{title}</strong><small>{description}</small></span>
    <ChevronRight size={19} aria-hidden="true"/>
  </Link>
}
