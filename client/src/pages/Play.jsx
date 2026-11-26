// Play.jsx  어트랙션 목록(카테고리, 방문자, 나이로 걸러 보기)과 놀이동산, 동물원, 캠프촌 안내.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Users, MapPin, ArrowRight, Clock } from 'lucide-react'
import { SubHero, Teaser, CheckList } from '../components/blocks'
import { Btn, Photo } from '../components/ui'
import { ContentGrid, AudienceChips, FactSheet, NextActions } from '../components/blocks/plan'
import { categories, items } from '../lib/plan'
import { programs, facilities, zone, program, won, priceFrom } from '../lib/data'

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

// 콘텐츠마다 이용할 수 있는 최소 나이
const minAge = (it) => {
  if (it.id === 'night-mission') return 19
  if (it.id === 'zombie-night') return 15
  const p = program(it.programId)
  if (p?.modes) return Math.min(...p.modes.map((m) => parseInt(m.age.replace(/\D+/g, ''), 10) || 0))
  return 0
}

export function PlayList() {
  const [sp, setSp] = useSearchParams()
  const cat = sp.get('cat') || ''
  const who = sp.get('for') || ''
  const [age, setAge] = useState(20)
  const set = (k, v) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true, preventScrollReset: true }) }
  const shown = items.filter((it) => (!cat || it.cat === cat) && (!who || it.for.includes(who)) && minAge(it) <= age)
  const groups = categories.map((c) => ({ ...c, list: shown.filter((it) => it.cat === c.id) })).filter((g) => g.list.length)
  return (
    <>
      <SubHero slot="site-rides" title="어트랙션" text="놀이 종류와 함께 오는 사람에 맞춰 찾아보세요." />
      <section id="list" className="wrap section plist__tools">
        <AudienceChips active={who} onPick={(v) => set('for', v)} />
        <div>
          <span className="t-strong pfilter__label">체험 종류</span>
          <div className="pfilter" role="group" aria-label="체험 종류">
            <button className="pfilter__btn" aria-pressed={!cat} onClick={() => set('cat', '')}>전체</button>
            {categories.map((c) => <button key={c.id} className="pfilter__btn" aria-pressed={cat === c.id} onClick={() => set('cat', cat === c.id ? '' : c.id)}>{c.name}</button>)}
          </div>
        </div>
        <div className="filterbar__row">
          <label htmlFor="age" className="t-strong">나이를 골라 주세요</label>
          <div className="range">
            <span className="t-small">5세</span>
            <input id="age" type="range" min="5" max="40" step="1" value={age} onChange={(e) => setAge(Number(e.target.value))} aria-valuetext={`${age}세`} style={{ '--pct': `${((age - 5) / 35) * 100}%` }} />
            <span className="t-small">40세</span>
            <output htmlFor="age" className="range__out t-strong">{age}세</output>
          </div>
        </div>
      </section>
      <section className="wrap section lp-groups" aria-live="polite">
        {groups.map((g) => (
          <div key={g.id} className="lp-cat">
            <h2 className="lp-cat__title t-card">{g.name}<span className="t-body c-sub">{g.text}</span></h2>
            <ContentGrid list={g.list} />
          </div>
        ))}
        {!groups.length && <p className="t-label empty">맞는 놀이가 없어요. 조건을 바꿔 보세요.</p>}
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
      <FactSheet id="rides" title="놀이기구 이용 정보" />
      <Teaser id="zoo" slot="site-feeding" tone={2} title="동물원과 먹이 주기 체험" cta="지도에서 위치" to="/map?focus=feeding">
        <p>{feed.summary}</p>
        <p>동물원에는 {facilities.find((f) => f.id === 'zoo').desc}</p>
        <p><Link to="/play/animals" className="inline-link">동물 친구들 사진 보기</Link></p>
      </Teaser>
      <FactSheet id="feeding" title="동물원과 먹이 주기 이용 정보" />
      <Teaser id="camp" slot="site-camp" tone={0} flip title="소나무 숲 캠프촌" cta="겨울 캠핑 데이" to="/play/season/winter">
        <p>{camp.summary}</p>
        <CheckList items={['개장 시간 동안 자유 이용', '텐트와 취사 장비 직접 준비', '가스버너만 사용']} />
      </Teaser>
      <FactSheet id="campground" title="캠프촌 이용 정보" />
      <NextActions />
    </>
  )
}
