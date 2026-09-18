import { ArrowRight, Cloud, Compass, Gift, Heart, Leaf, Play, Settings, Sparkles, Star, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Mascot } from '../components/game/Mascot'
import { Environment } from '../components/game/Environment'
import { Badge, ButtonLink } from '../components/ui/Primitives'
import { QuickDestination } from '../components/ui/QuickDestination'

export default function Home() {
  return <div className="home">
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <Badge><Sparkles size={15}/> A LITTLE WONDER, EVERY DAY</Badge>
        <h1 id="home-title">Small steps.<br/><span>Big discoveries.</span></h1>
        <p>Follow your curiosity into a world of colors, numbers, and wonderful little surprises.</p>
      </div>
      <div className="hero-art">
        <div className="orbit orbit-one" aria-hidden="true"/><div className="orbit orbit-two" aria-hidden="true"/>
        <div className="hero-scenery"><Environment theme="meadow"/></div>
        <div className="hero-decoration" aria-hidden="true"><Cloud className="art-cloud cloud-one"/><Cloud className="art-cloud cloud-two"/><Star className="art-star star-one" fill="currentColor"/><Star className="art-star star-two" fill="currentColor"/><span className="art-dot dot-one"/><span className="art-dot dot-two"/><Leaf className="art-leaf"/></div>
        <div className="mascot-stage"><Mascot/></div>
        <span className="mascot-greeting">Hi, I’m Pip! <span aria-hidden="true">✦</span></span>
      </div>
      <div className="hero-controls">
        <div className="hero-actions"><ButtonLink to="/levels"><Play size={23} fill="currentColor"/> Let’s play <ArrowRight size={20}/></ButtonLink><ButtonLink secondary to="/levels"><Compass size={21}/> Explore levels</ButtonLink></div>
        <span className="hero-note"><Heart size={15}/> Made for curious minds, ages 4–8</span>
      </div>
    </section>
    <section className="journey-preview" aria-labelledby="journey-title">
      <div className="section-heading"><div><span className="eyebrow">YOUR ADVENTURE BEGINS HERE</span><h2 id="journey-title">A whole world of wonder</h2></div><Link className="text-link" to="/levels">See the map <ArrowRight size={17}/></Link></div>
      <div className="adventure-preview">
        <Link className="preview-scene" to="/levels" aria-label="Explore Sunny Meadow"><Environment theme="meadow"/><span className="map-start-marker" aria-hidden="true"><span>1</span>Start here</span></Link>
        <div className="world-preview-copy"><Badge>WORLD 01 · LEVELS 1–5</Badge><h3>Sunny Meadow</h3><p>Sunshine, little discoveries, and a path full of possibilities.</p><span className="world-start"><Sparkles size={16}/> First stop: Color Match</span><ButtonLink to="/levels">Start journey <ArrowRight size={20}/></ButtonLink></div>
      </div>
    </section>
    <nav className="home-shortcuts" aria-label="More to explore">
      <QuickDestination to="/achievements" icon={Trophy} title="Little victories" description="A home for future milestones" tone="gold"/>
      <QuickDestination to="/rewards" icon={Gift} title="Pip’s treasures" description="Little surprises ahead" tone="violet"/>
      <QuickDestination to="/settings" icon={Settings} title="Just your way" description="Make yourself at home" tone="sky"/>
    </nav>
  </div>
}
