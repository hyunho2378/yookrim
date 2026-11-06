// Play.jsx  즐길거리 목록과 놀이동산, 동물원. 레고랜드 라이드 화면 틀: 사진 띠, 키 고르기 막대, 3열 목록.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, MapPin, ArrowRight, Clock } from 'lucide-react'
import { SubHero, Teaser, CheckList } from '../components/blocks'
import { Photo } from '../components/ui'
import { programs, facilities, zone, program, won, priceFrom } from '../lib/data'

// 프로그램마다 최소 나이. 연령 문구에서 숫자를 읽는다
const minAge = (p) => {
  if (p.modes) return Math.min(...p.modes.map((m) => parseInt(m.age.replace(/\D+/g, ''), 10) || 0))
  if (p.id === 'zombie-night') return 15
  return 0
}
const link = (p) => ({ gungame: '/play/gungame', 'animal-cafe': '/play/cafe', 'zombie-night': '/play/season/summer', 'treasure-hunt': '/play/season/spring', 'winter-camp': '/play/season/winter', feeding: '/play/attractions#zoo', rides: '/play/attractions#rides', campground: '/play/attractions#camp' }[p.id] || '/play')
const slotOf = (p) => ({ gungame: 'gungame-zone-overview', 'animal-cafe': 'cafe-interior', 'zombie-night': 'zombie-night', 'treasure-hunt': 'poster-spring', 'winter-camp': 'camp-winter', feeding: 'site-feeding', rides: 'site-rides', campground: 'site-camp' }[p.id] || 'site-rides')
const cats = ['전체', '체험', '시즌', '상시']

export function List({ items }) {
  return (
    <ul className="rlist">
      {items.map((it, i) => (
        <li key={it.key}>
          <Link to={it.to} className="rlist__item">
            <Photo slot={it.slot} ratio="4 / 3" tone={i} round />
            <h3 className="t-card">{it.title}</h3>
            <p className="t-body rlist__desc">{it.text}</p>
            {it.meta.map(({ icon: I, text }) => <p key={text} className="t-small rlist__meta"><I size={20} className="ico" aria-hidden />{text}</p>)}
            <ArrowRight size={24} className="ico c-action rlist__go" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function PlayList() {
  const [age, setAge] = useState(20)
  const [cat, setCat] = useState('전체')
  const items = useMemo(() => programs
    .filter((p) => (cat === '전체' || p.category === cat))
    .filter((p) => minAge(p) <= age)
    .map((p) => ({
      key: p.id, to: link(p), slot: slotOf(p), title: p.name, text: p.summary,
      meta: [
        { icon: Users, text: p.modes ? p.modes.map((m) => m.age).join(', ') : (p.target ? p.target.join(', ') : '누구나') },
        ...(priceFrom(p) ? [{ icon: Clock, text: `${won(priceFrom(p))}부터` }] : [])
      ]
    })), [age, cat])
  return (
    <>
      <SubHero slot="site-rides" title="즐길거리" text="나이를 고르면 함께 즐길 수 있는 프로그램만 보여요." />
      <section className="wrap filterbar">
        <div className="filterbar__row">
          <label htmlFor="age" className="t-strong">나이를 골라 주세요</label>
          <div className="range">
            <span className="t-small">5세</span>
            <input id="age" type="range" min="5" max="40" step="1" value={age} onChange={(e) => setAge(Number(e.target.value))} aria-valuetext={`${age}세`} style={{ '--pct': `${((age - 5) / 35) * 100}%` }} />
            <span className="t-small">40세</span>
            <output htmlFor="age" className="range__out t-strong">{age}세</output>
          </div>
        </div>
        <div className="choices" role="tablist" aria-label="분류">
          {cats.map((c) => <button key={c} role="tab" aria-selected={cat === c} className="choice" onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </section>
      <section className="wrap section">
        {items.length ? <List items={items} /> : <p className="t-label empty">이 나이에 맞는 프로그램이 없어 나이를 바꿔 보면 돼요</p>}
      </section>
    </>
  )
}

export function Attractions() {
  const rides = facilities.filter((f) => f.type.includes('ride'))
  const feed = program('feeding')
  const camp = program('campground')
  return (
    <>
      <SubHero slot="site-rides" tone={1} title="놀이동산과 동물원" text="1975년부터 자리를 지켜 온 놀이기구와 동물 친구들이에요." />
      <section id="rides" className="wrap section">
        <h2 className="t-label tiles__title">놀이기구</h2>
        <List items={rides.map((r) => ({ key: r.id, to: `/map?focus=${r.id}`, slot: { viking: 'ride-viking', bumper: 'ride-bumper', swing: 'ride-swing', carousel: 'ride-carousel', train: 'site-train' }[r.id] || 'site-rides', title: r.name, text: `${zone(r.zone).name}에 있어요.`, meta: [{ icon: MapPin, text: '지도에서 위치 보기' }] }))} />
      </section>
      <Teaser id="zoo" slot="site-feeding" tone={2} title="동물원과 먹이 주기 체험" cta="지도에서 위치" to="/map?focus=feeding">
        <p>{feed.summary}</p>
        <p>동물원에는 {facilities.find((f) => f.id === 'zoo').desc}</p>
      </Teaser>
      <Teaser id="camp" slot="site-camp" tone={0} flip title="소나무 숲 캠프촌" cta="겨울 캠핑 데이" to="/play/season/winter">
        <p>{camp.summary}</p>
        <CheckList items={['개장 시간 동안 자유 이용', '텐트와 취사 장비 직접 준비', '가스버너만 사용']} />
      </Teaser>
    </>
  )
}
