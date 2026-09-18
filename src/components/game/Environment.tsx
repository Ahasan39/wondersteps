import type { World } from '../../types/game'

/** Original, lightweight scenery shared by the home entrance and map regions. */
export function Environment({ theme }: { theme: World['theme'] }) {
  return <svg className={`environment environment-${theme}`} viewBox="0 0 600 360" aria-hidden="true" focusable="false">
    {theme === 'meadow' && <>
      <circle className="scene-sun" cx="470" cy="65" r="35"/>
      <path className="scene-cloud" d="M48 85h110a24 24 0 0 0-20-38 36 36 0 0 0-65-6A23 23 0 0 0 48 85Z"/>
      <path className="scene-back" d="M0 230Q120 100 300 230T600 190V360H0Z"/>
      <path className="scene-front" d="M0 280Q160 200 300 285T600 250V360H0Z"/>
      <path className="scene-trail" d="M280 360Q190 305 285 270T380 213"/>
      <g className="scene-flower"><path d="M85 280v35M500 260v38"/><circle cx="85" cy="275" r="12"/><circle cx="500" cy="255" r="10"/></g>
      <g className="scene-grass"><path d="m40 324 5-16 6 16m385-27 5-16 6 16m104 35 5-16 6 16"/></g>
    </>}
    {theme === 'forest' && <>
      <path className="scene-back" d="M0 270Q170 190 330 270T600 230V360H0Z"/>
      <g className="scene-trunk"><path d="M100 130v210M225 170v150M440 110v235M535 165v165"/></g>
      <g className="scene-canopy"><path d="m100 55-65 165h130Zm125 55-55 150h110ZM440 25l-70 190h140Zm95 80-55 155h110Z"/></g>
      <path className="scene-front" d="M0 320Q60 250 120 310Q200 240 290 315Q400 260 490 310Q560 250 600 300V360H0Z"/>
      <g className="scene-spark"><path d="m320 70 6 15 15 6-15 6-6 15-6-15-15-6 15-6Zm-60 90 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/></g>
    </>}
    {theme === 'cloud' && <>
      <path className="scene-arc" d="M140 210a150 150 0 0 1 300 0"/>
      <g className="scene-cloud"><path d="M0 270Q30 220 80 245Q110 180 170 220Q220 205 245 260Q290 245 310 285V360H0ZM340 160Q355 115 395 132Q430 80 473 120Q520 100 540 147Q580 130 600 170V220H340Z"/></g>
      <path className="scene-front" d="M180 330Q220 270 270 295Q330 230 380 295Q440 265 470 330V360H180Z"/>
      <g className="scene-spark"><path d="m95 95 8 15 16 3-12 12 3 17-15-8-15 8 3-17-12-12 16-3Z"/><circle cx="540" cy="65" r="8"/></g>
    </>}
    {theme === 'galaxy' && <>
      <ellipse className="scene-orbit" cx="300" cy="190" rx="225" ry="100" transform="rotate(-22 300 190)"/>
      <circle className="scene-planet" cx="410" cy="150" r="62"/>
      <ellipse className="scene-ring" cx="410" cy="150" rx="100" ry="21" transform="rotate(-25 410 150)"/>
      <circle className="scene-moon" cx="130" cy="265" r="37"/>
      <g className="scene-spark"><path d="m125 60 8 15 16 3-12 12 3 17-15-8-15 8 3-17-12-12 16-3Zm390 210 6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z"/><circle cx="285" cy="72" r="5"/><circle cx="70" cy="177" r="4"/><circle cx="330" cy="295" r="4"/></g>
    </>}
  </svg>
}
