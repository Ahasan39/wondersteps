import { motion,useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
const offsets=[[-32,-22],[28,-28],[-24,23],[35,20],[-58,-8],[55,2],[-14,-40],[15,40]]
export function GameSparkles({celebration=false}:{celebration?:boolean}){
 const reduced=useReducedMotion()
 if(reduced)return null
 return <span className={celebration?'game-sparkles celebration-sparkles':'game-sparkles'} aria-hidden="true">{offsets.slice(0,celebration?8:4).map(([x,y],i)=><motion.span key={i} className="game-spark" initial={{x:0,y:0,opacity:0,scale:.4}} animate={{x:x*(celebration?2.1:1),y:y*(celebration?2.1:1),opacity:[0,1,0],scale:[.4,1,.7]}} transition={{duration:celebration?1.7:.6,delay:celebration?i*.04:0,ease:'easeOut'}}><Star size={celebration?16:10}/></motion.span>)}</span>
}
