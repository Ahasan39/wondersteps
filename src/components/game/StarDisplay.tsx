import { Star } from 'lucide-react'
import type { Stars } from '../../types/game'
export function StarDisplay({ stars }: { stars: Stars }) {
  return <span className="star-display" role="img" aria-label={`${stars} of 3 stars`}>
    {[1, 2, 3].map(index => <Star key={index} size={14} aria-hidden="true" className={index <= stars ? 'earned-star' : 'empty-star'}/>)}
  </span>
}
