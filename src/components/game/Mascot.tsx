import { motion, useReducedMotion } from 'framer-motion'
export function Mascot() {
const reduced = useReducedMotion()
return <motion.svg className="mascot" viewBox="0 0 360 360" role="img" aria-label="Pip, a friendly purple explorer, waving hello" animate={reduced ? { y: 0 } : { y: [0, -8, 0] }} transition={reduced ? { duration: 0 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
<defs><linearGradient id="pip-body" x2="0.8" y2="1"><stop stopColor="var(--mascot-light)"/><stop offset="1" stopColor="var(--primary)"/></linearGradient></defs>
<ellipse cx="180" cy="322" rx="91" ry="13" fill="var(--mascot-shadow)"/>
<path d="M112 281 Q76 319 118 324 L150 311 M213 307 Q233 331 258 316 Q271 299 245 280" fill="var(--primary-dark)"/>
<path d="M93 204 Q53 192 57 224 Q61 244 96 251 M268 198 Q303 181 295 157 Q291 140 307 138 Q332 143 324 175 Q315 213 271 239" fill="var(--primary)"/>
<path d="M83 178 Q78 97 129 78 Q127 44 148 43 Q168 45 174 72 Q221 63 240 40 Q252 35 259 49 Q263 73 248 92 Q283 119 277 192 L272 253 Q266 307 183 310 Q92 308 88 255Z" fill="url(#pip-body)"/>
<ellipse cx="181" cy="215" rx="72" ry="67" fill="var(--mascot-face)"/>
<ellipse cx="151" cy="192" rx="9" ry="13" fill="var(--text-primary)"/><ellipse cx="214" cy="192" rx="9" ry="13" fill="var(--text-primary)"/>
<circle cx="154" cy="188" r="3" fill="var(--surface)"/><circle cx="217" cy="188" r="3" fill="var(--surface)"/>
<ellipse cx="128" cy="218" rx="13" ry="8" fill="var(--coral-soft)"/><ellipse cx="237" cy="218" rx="13" ry="8" fill="var(--coral-soft)"/>
<path d="M164 220 Q182 245 201 220" fill="none" stroke="var(--text-primary)" strokeWidth="5" strokeLinecap="round"/>
<path d="M111 273 Q180 295 253 271 L244 297 Q185 317 121 296Z" fill="var(--accent)"/>
<path d="m181 265 5 10 12 2-9 8 2 12-10-6-11 6 2-12-9-8 12-2Z" fill="var(--surface)"/>
</motion.svg>
}
