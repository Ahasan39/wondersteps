import type { ReactNode } from 'react'
import { House, Sun, TreePine, Umbrella, Van, Moon } from 'lucide-react'
import type { VisualId } from './types'

const ink = '#342843', green = '#43a960', yellow = '#ffd04f', orange = '#f6a445', pink = '#ef829d'
const eyes = <g fill={ink}><circle cx="39" cy="49" r="3"/><circle cx="61" cy="49" r="3"/><path d="M44 62 Q50 67 56 62" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round"/></g>
const leaf = <path d="M50 24 Q51 8 69 10 Q64 25 50 24" fill={green}/>
const animals: Partial<Record<VisualId, { fill: string; detail: ReactNode }>> = {
 cat:{fill:yellow,detail:<><path d="m24 38-4-25 24 17m32 8 4-25-24 17" fill={yellow}/><path d="m28 60-17-3m18 10-17 4m60-11 17-3m-18 10 17 4" stroke={ink} strokeWidth="2"/><path d="m46 57 4 4 4-4" fill={pink}/></>},
 dog:{fill:'#ca955b',detail:<><ellipse cx="24" cy="44" rx="12" ry="25" fill="#805a39"/><ellipse cx="76" cy="44" rx="12" ry="25" fill="#805a39"/><ellipse cx="50" cy="61" rx="15" ry="12" fill="#ffe6ba"/><ellipse cx="50" cy="58" rx="5" ry="4" fill={ink}/></>},
 lion:{fill:yellow,detail:<circle cx="50" cy="50" r="43" fill="#b56d35"/>},
 tiger:{fill:orange,detail:<><circle cx="27" cy="25" r="10" fill={orange}/><circle cx="73" cy="25" r="10" fill={orange}/><path d="m35 27 6 12m18-12-6 12M20 49l13 4m47-4-13 4M23 65l12-3m42 3-12-3" stroke={ink} strokeWidth="5"/></>},
 elephant:{fill:'#a7b9ce',detail:<><ellipse cx="19" cy="49" rx="17" ry="27" fill="#a7b9ce"/><ellipse cx="81" cy="49" rx="17" ry="27" fill="#a7b9ce"/><path d="M45 58v25q0 15 16 4" fill="none" stroke="#a7b9ce" strokeWidth="14" strokeLinecap="round"/></>},
 rabbit:{fill:'#faf3e9',detail:<><ellipse cx="36" cy="23" rx="9" ry="23" fill="#faf3e9"/><ellipse cx="64" cy="23" rx="9" ry="23" fill="#faf3e9"/><path d="M36 8v23m28-23v23" stroke={pink} strokeWidth="7" strokeLinecap="round"/><circle cx="50" cy="58" r="4" fill={pink}/></>},
 panda:{fill:'#fff',detail:<><circle cx="26" cy="23" r="12" fill={ink}/><circle cx="74" cy="23" r="12" fill={ink}/><ellipse cx="39" cy="49" rx="10" ry="13" fill={ink}/><ellipse cx="61" cy="49" rx="10" ry="13" fill={ink}/><circle cx="39" cy="47" r="3" fill="#fff"/><circle cx="61" cy="47" r="3" fill="#fff"/></>},
 monkey:{fill:'#ba8053',detail:<><circle cx="17" cy="48" r="13" fill="#ba8053"/><circle cx="83" cy="48" r="13" fill="#ba8053"/><path d="M29 44Q28 26 50 39Q72 26 71 44v22Q50 88 29 66Z" fill="#ffe1b1"/></>},
 frog:{fill:green,detail:<><circle cx="32" cy="30" r="14" fill={green}/><circle cx="68" cy="30" r="14" fill={green}/><circle cx="32" cy="30" r="7" fill="#fff"/><circle cx="68" cy="30" r="7" fill="#fff"/><circle cx="32" cy="30" r="3" fill={ink}/><circle cx="68" cy="30" r="3" fill={ink}/><path d="M35 58q15 14 30 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round"/></>},
 horse:{fill:'#b5774a',detail:<><path d="m30 32 2-24 16 23m22 1-2-24-16 23" fill="#b5774a"/><path d="M43 22q7-15 17 0l-5 21" fill="#684329"/><ellipse cx="50" cy="68" rx="23" ry="14" fill="#f6d6ad"/><circle cx="40" cy="68" r="3" fill={ink}/><circle cx="60" cy="68" r="3" fill={ink}/></>},
 cow:{fill:'#fff',detail:<><path d="m26 32-14-10m62 10 14-10" stroke="#be9468" strokeWidth="8" strokeLinecap="round"/><path d="M26 32q17-17 23 4l-4 15H24Z" fill={ink}/><ellipse cx="50" cy="68" rx="23" ry="14" fill={pink}/></>},
 sheep:{fill:'#f7efe0',detail:<>{[20,35,50,65,80].map((x,i)=><circle key={x} cx={x} cy={i%2?25:34} r="13" fill="#f7efe0"/>)}<ellipse cx="50" cy="57" rx="22" ry="28" fill="#a18b80"/></>},
 zebra:{fill:'#fff',detail:<><path d="m30 32 2-24 16 23m22 1-2-24-16 23" fill="#fff"/><path d="M50 19v21m-24 0 13 7m35-7-13 7m-38 13 13 2m41-2-13 2" stroke={ink} strokeWidth="5"/><ellipse cx="50" cy="71" rx="20" ry="10" fill={ink}/></>},
}
const fruit: Partial<Record<VisualId, ReactNode>> = {
 apple:<>{leaf}<path d="M50 29C17 12 8 53 25 77Q39 91 50 83Q63 91 78 73C95 47 79 15 50 29" fill="#ec5664"/></>,
 banana:<><path d="M18 24Q32 79 83 39Q62 99 29 78Q9 62 18 24" fill={yellow} stroke="#c59a22" strokeWidth="3"/><path d="m18 24 3-9m62 24 4-6" stroke="#805a39" strokeWidth="5"/></>,
 orange:<>{leaf}<circle cx="50" cy="57" r="33" fill={orange}/><path d="M29 40q-7 10-7 20" stroke="#ffdb93" strokeWidth="5" fill="none" strokeLinecap="round"/></>,
 mango:<>{leaf}<path d="M56 25Q91 29 77 65Q59 98 28 78Q4 52 56 25" fill={orange}/><path d="M48 39q-24 12-22 25" fill="none" stroke={yellow} strokeWidth="7" strokeLinecap="round"/></>,
 grapes:<>{leaf}<path d="M50 18v15" stroke={green} strokeWidth="4"/>{[[35,39],[55,39],[72,43],[29,57],[49,57],[68,61],[39,74],[57,77],[48,90]].map(([x,y])=><circle key={x+'-'+y} cx={x} cy={y} r="11" fill="#935acc" stroke="#7541b1" strokeWidth="2"/>)}</>,
 watermelon:<><path d="M10 38h80Q84 91 50 91Q16 91 10 38" fill={green}/><path d="M17 39h66Q77 80 50 80Q23 80 17 39" fill="#ed687a"/>{[30,50,70].map(x=><ellipse key={x} cx={x} cy={x===50?66:52} rx="2" ry="4" fill={ink}/>)}</>,
 strawberry:<><path d="M23 34Q50 21 77 34Q85 57 50 91Q15 57 23 34" fill="#ed5665"/><path d="m50 35-24-14 23 5 7-14 4 16 18-5-18 16" fill={green}/>{[[35,46],[58,47],[45,61],[63,61],[50,77]].map(([x,y])=><ellipse key={x+y} cx={x} cy={y} rx="2" ry="3" fill={yellow}/>)}</>,
 pineapple:<><path d="m50 33-17-23 17 10 10-17 2 21 19-9-15 22" fill={green}/><rect x="26" y="31" width="48" height="60" rx="23" fill={yellow}/><path d="m28 45 40 35M26 62l25 24m22-39-40 34m41-17L53 85" stroke="#c39230" strokeWidth="2"/></>,
 pear:<>{leaf}<path d="M38 29Q50 17 61 29L68 49Q92 79 65 89Q15 103 23 68Z" fill="#a6c84a"/></>,
 cherry:<><path d="M27 62q17-15 28-46q4 26 23 47" stroke={green} strokeWidth="4" fill="none"/><circle cx="27" cy="70" r="17" fill="#d8435a"/><circle cx="76" cy="72" r="17" fill="#e45669"/>{leaf}</>,
 peach:<>{leaf}<path d="M50 31Q21 19 14 49Q8 78 50 91Q89 75 86 48Q77 18 50 31" fill="#f89d7d"/><path d="M50 36q-12 24 0 45" fill="none" stroke="#da705f" strokeWidth="3"/></>,
 kiwi:<><circle cx="50" cy="53" r="37" fill="#9c7652"/><circle cx="50" cy="53" r="31" fill="#a6cf59"/><circle cx="50" cy="53" r="12" fill="#f1f5c3"/>{Array.from({length:10},(_,i)=><ellipse key={i} cx="50" cy="31" rx="2" ry="3" fill={ink} transform={'rotate('+i*36+' 50 53)'}/>)}</>,
}
const icons = { house:House, sun:Sun, tree:TreePine, umbrella:Umbrella, van:Van, moon:Moon }
const objects: Partial<Record<VisualId, ReactNode>> = {
 queen:<><path d="M25 44Q50 18 75 44v37H25Z" fill="#a56e3e"/><circle cx="50" cy="54" r="24" fill="#ffe0ba"/>{eyes}<path d="m27 30-4-23 18 12 9-15 10 15 18-12-5 23Z" fill={yellow}/><path d="M23 89q27-31 54 0" fill="#9c79da"/></>,
 xylophone:<><path d="M16 78h69" stroke={ink} strokeWidth="5"/>{[0,1,2,3,4].map((i)=><rect key={i} x={15+i*14} y={26+i*6} width="12" height={48-i*5} rx="3" fill={['#e5687d',orange,yellow,green,'#7d72cb'][i]}/>)}<path d="m15 17 56 38" stroke="#805a39" strokeWidth="4"/><circle cx="15" cy="17" r="7" fill="#805a39"/></>,
 fish:<><path d="m71 49 23-22v49L71 58" fill={orange}/><ellipse cx="43" cy="53" rx="33" ry="23" fill="#58bcd4"/><circle cx="25" cy="48" r="4" fill={ink}/><path d="m42 50 14-11v25Z" fill="#2c91b1"/></>,
 bird:<><ellipse cx="48" cy="57" rx="29" ry="28" fill="#62b9da"/><circle cx="43" cy="32" r="19" fill="#62b9da"/><path d="m60 30 22 8-22 6" fill={yellow}/><circle cx="48" cy="28" r="3" fill={ink}/><path d="M33 51q26-9 22 23" fill="#3893b7"/><path d="m41 82-4 9m23-10 5 10" stroke={orange} strokeWidth="4"/></>,
 duck:<><ellipse cx="48" cy="64" rx="33" ry="21" fill={yellow}/><circle cx="35" cy="32" r="19" fill={yellow}/><path d="m20 29-17 8 18 5" fill={orange}/><circle cx="29" cy="28" r="3" fill={ink}/><path d="M40 57q26-9 22 14" fill={orange}/></>,
 turtle:<><circle cx="84" cy="53" r="12" fill={green}/><path d="m24 66-7 16m44-16 7 16m-42-40-8-14m43 15 9-14" stroke={green} strokeWidth="11" strokeLinecap="round"/><ellipse cx="45" cy="55" rx="32" ry="25" fill="#83b957"/><path d="m45 32-15 22 16 24 15-24Z" fill="none" stroke="#4b843f" strokeWidth="3"/><circle cx="88" cy="50" r="2" fill={ink}/></>,
 whale:<><path d="M13 47Q27 22 61 39Q72 55 84 38l-4-15 16 8-6 17Q80 89 41 82Q12 76 13 47" fill="#68aaca"/><path d="m47 62 14 12-19 3" fill="#4385a6"/><circle cx="27" cy="52" r="3" fill={ink}/><path d="M32 29v-9m0 1-10-6m10 6 10-6" stroke="#68aaca" strokeWidth="4" strokeLinecap="round"/></>,
 ball:<><circle cx="50" cy="53" r="35" fill={yellow}/><path d="M25 28q35 16 41 59M17 59q37 5 62-24" stroke="#ee7e86" strokeWidth="13" fill="none"/></>,
 'ice-cream':<><path d="m29 48 21 45 22-45" fill="#d6a05f"/><circle cx="34" cy="43" r="17" fill={pink}/><circle cx="64" cy="43" r="17" fill={pink}/><circle cx="50" cy="26" r="18" fill={pink}/></>,
 juice:<><path d="m25 32 8 59h35l8-59Z" fill={orange}/><path d="M54 65V16l17-7" fill="none" stroke="#7849b0" strokeWidth="6"/><path d="M32 39h35" stroke={yellow} strokeWidth="5"/></>,
 kite:<><path d="m50 6 29 33-29 32-29-32Z" fill="#9c79da"/><path d="M50 6v65M21 39h58" stroke={yellow} strokeWidth="3"/><path d="M50 71q-15 6 0 12t0 14" stroke="#e8779a" fill="none" strokeWidth="3"/></>,
 nest:<><path d="M10 53q40 60 80 0" fill="#b5824b"/><ellipse cx="50" cy="54" rx="40" ry="13" fill="#825b38"/><ellipse cx="39" cy="47" rx="12" ry="17" fill="#d3e8f0"/><ellipse cx="63" cy="47" rx="12" ry="17" fill="#f4e9bd"/><path d="m18 65 63 3m-56 8h48" stroke="#e2b376" strokeWidth="4"/></>,
 'yo-yo':<><path d="M50 12q-27 8-15 30l15 17" fill="none" stroke={ink} strokeWidth="3"/><circle cx="50" cy="64" r="28" fill="#9c79da"/><circle cx="50" cy="64" r="18" fill="#bca1ee"/><circle cx="50" cy="64" r="6" fill={yellow}/></>,
 star:<path d="m50 8 13 26 29 4-21 21 5 29-26-14-26 14 5-29L8 38l29-4Z" fill={yellow} stroke="#d9a52c" strokeWidth="2"/>,
 flower:<>{[0,60,120,180,240,300].map(deg=><ellipse key={deg} cx="50" cy="28" rx="12" ry="20" fill={pink} transform={'rotate('+deg+' 50 50)'}/>)}<circle cx="50" cy="50" r="15" fill={yellow}/></>,
 circle:<circle cx="50" cy="50" r="35" fill="#8b72d8"/>,
}
/** Original scalable artwork; the surrounding prompt/button supplies its label. */
export function Visual({ id }: { id: VisualId }) {
 const Icon = icons[id as keyof typeof icons]
 if (Icon) return <Icon className="game-visual" aria-hidden="true" strokeWidth={1.8}/>
 const animal = animals[id]
 return <svg className="game-visual" viewBox="0 0 100 100" aria-hidden="true">
  {animal ? <>{id === 'lion' && animal.detail}<circle cx="50" cy="53" r="32" fill={animal.fill} stroke="#34284322" strokeWidth="2"/>{id !== 'lion' && animal.detail}{id !== 'panda' && id !== 'frog' && eyes}</> : fruit[id] ?? objects[id]}
 </svg>
}
