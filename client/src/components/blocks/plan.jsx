// plan.jsx  카테고리 타일, 콘텐츠 카드, 방문자별 안내, 한눈에 보기, 다음 행동 띠, 영상 히어로, 방문 전 질문.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Navigation, Pause, Phone, Play, Ticket, Wallet } from 'lucide-react'
import { Btn, Photo, Accordion } from '../ui'
import { site, todayHours, won, pricing } from '../../lib/data'
import { categories, category, audiences, tagsOf, cardPrice, factsOf, visitQA, itemById, items } from '../../lib/plan'
import videos from '../../data/videos.json'

const MAP_URL = `https://map.naver.com/p/search/${encodeURIComponent(site.address)}`

// 영상 한 개. 파일이 없거나 움직임 줄이기, 데이터 절약, 느린 연결이면 그리지 않아 대표 이미지만 남는다
function useCanPlay(src) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    if (!src) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const c = navigator.connection
    const slow = c && (c.saveData || /(^|-)2g$|3g/.test(c.effectiveType || ''))
    setOk(!reduce && !slow)
  }, [src])
  return ok
}

export function LoopVideo({ src, mobile, label, controls = true, className = '' }) {
  const [small, setSmall] = useState(false)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const f = () => setSmall(mq.matches)
    f(); mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  const file = small ? (mobile || src) : src
  const can = useCanPlay(file)
  const [ref, setRef] = useState(null)
  useEffect(() => { if (ref) { paused ? ref.pause() : ref.play().catch(() => {}) } }, [paused, ref])
  if (!file || !can) return null
  return (
    <>
      <video ref={setRef} className={`loopv ${className}`} src={`${import.meta.env.BASE_URL}videos/${file}`} muted loop playsInline autoPlay preload="metadata" aria-label={label} />
      {controls && (
        <button className="loopv__ctl" onClick={() => setPaused(!paused)} aria-label={paused ? '영상 재생' : '영상 멈춤'}>
          {paused ? <Play size={20} aria-hidden /> : <Pause size={20} aria-hidden />}
        </button>
      )}
    </>
  )
}

// 홈 첫 화면. 영상(없으면 대표 이미지) 위에 핵심 문장과 행동 단추 둘
export function StageHero({ title, lead, primary, secondary }) {
  const v = videos.hero
  return (
    <section className="stage" aria-label="육림랜드 소개">
      <Photo slot={v.poster} fill tone={1} alt="" />
      <LoopVideo src={v.src} mobile={v.mobile} label={v.label} />
      <div className="stage__shade" aria-hidden />
      <div className="wrap stage__copy">
        {lead && <p className="stage__lead t-label">{lead}</p>}
        <h1 className="t-display"><span className="clause">{title[0]}</span> <span className="clause">{title[1]}</span></h1>
        <div className="stage__btns">
          <Btn to={primary.to}>{primary.label}</Btn>
          <Btn to={secondary.to} variant="light">{secondary.label}</Btn>
        </div>
      </div>
    </section>
  )
}

export function StatusTags({ item, all }) {
  const tags = tagsOf(item).slice(0, all ? 4 : 2)
  return <span className="stags">{tags.map((t) => <span key={t.text} className={`stag stag--${t.tone} t-small`}>{t.text}</span>)}</span>
}

// 큰 카테고리 타일
export function CategoryTiles({ title, text }) {
  return (
    <section className="wrap section ctiles" aria-labelledby="ctiles-h">
      <div className="stack-3 ctiles__head">
        <h2 id="ctiles-h" className="t-band c-primary">{title}</h2>
        {text && <p className="t-body c-sub">{text}</p>}
      </div>
      <ul className="ctiles__list">
        {categories.map((c, i) => (
          <li key={c.id}>
            <Link to={`/play?cat=${c.id}#list`} className={`ctile ctile--${c.tone}`}>
              <Photo slot={c.slot} fill tone={i} />
              <span className="ctile__shade" aria-hidden />
              <span className="ctile__txt">
                <span className="t-card">{c.name}</span>
                <span className="t-small">{c.text}</span>
              </span>
              <ArrowRight size={24} className="ctile__go" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// 콘텐츠 카드 한 장. 짧은 영상이 있으면 이미지 위에 겹쳐 보인다
export function ContentCard({ item, i = 0 }) {
  const cat = category(item.cat)
  const price = cardPrice(item)
  const vid = videos.cards[item.id]
  return (
    <Link to={item.to} className="ccard">
      <span className="ccard__media">
        <Photo slot={item.slot} ratio="4 / 3" tone={i} />
        {vid && <LoopVideo src={vid.src} mobile={vid.mobile} label={`${item.name} 영상`} controls={false} />}
        <StatusTags item={item} />
      </span>
      <span className="ccard__body">
        <span className="ccard__cat t-small">{cat.name}</span>
        <span className="ccard__name t-card">{item.name}</span>
        <span className="ccard__line t-body">{item.line}</span>
        <span className="ccard__for t-small"><b>추천</b> {item.forText}{price ? `, ${price}` : ''}</span>
        <span className="ccard__more t-strong">자세히 보기<ArrowRight size={20} aria-hidden /></span>
      </span>
    </Link>
  )
}

export function ContentGrid({ list }) {
  return <ul className="cgrid">{list.map((it, i) => <li key={it.id}><ContentCard item={it} i={i} /></li>)}</ul>
}

// 방문자별 안내
export function AudienceGrid({ title, text, active, onPick }) {
  return (
    <section id="audience" className="wrap section aud">
      <div className="stack-3 ctiles__head">
        <h2 className="t-band c-primary">{title}</h2>
        {text && <p className="t-body c-sub">{text}</p>}
      </div>
      <ul className="aud__list">
        {audiences.map((a) => {
          const picks = (a.id === 'first' ? ['rides', 'feeding', 'animal-cafe'] : items.filter((it) => it.for.includes(a.id)).map((it) => it.id)).map(itemById)
          const body = (
            <>
              <span className="aud__name t-card">{a.name}</span>
              <span className="aud__check t-body">{a.check}</span>
              <span className="aud__picks t-small">{picks.map((p) => p.name).join(', ')}</span>
            </>
          )
          return (
            <li key={a.id}>
              {onPick
                ? <button className={`aud__item ${active === a.id ? 'is-on' : ''}`} aria-pressed={active === a.id} onClick={() => onPick(active === a.id ? '' : a.id)}>{body}</button>
                : <Link to={`/play?for=${a.id}#list`} className="aud__item">{body}</Link>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// 상세 화면 "한눈에 보기". 자료가 있는 항목만 보인다
export function FactSheet({ id, title = '이용 정보' }) {
  const it = itemById(id)
  const f = factsOf(id)
  if (!it || !f) return null
  return (
    <section className="wrap section fact" aria-labelledby={`fact-${id}`}>
      <div className="fact__box">
        <div className="stack-3">
          <h2 id={`fact-${id}`} className="t-band c-primary">{title}</h2>
          <StatusTags item={it} all />
          <p className="t-body c-sub">{it.line}</p>
        </div>
        <dl className="fact__list">
          {f.rows.map(([k, v]) => <div key={k} className="fact__row"><dt className="t-strong">{k}</dt><dd className="t-body">{v}</dd></div>)}
          {f.safety.length > 0 && (
            <div className="fact__row fact__row--wide"><dt className="t-strong">안전과 주의</dt><dd><ul className="fact__safe">{f.safety.map((s) => <li key={s} className="t-body">{s}</li>)}</ul></dd></div>
          )}
        </dl>
      </div>
    </section>
  )
}

// 상세 화면 맨 아래. 메뉴로 돌아가지 않고 바로 다음 행동으로 이어진다
export function NextActions({ program: pid, noBook, title = '예약과 문의' }) {
  const book = pid ? `/reserve?program=${pid}` : '/reserve'
  return (
    <section className="nact">
      <div className="wrap nact__in">
        <h2 className="t-band">{title}</h2>
        <div className="nact__btns">
          {!noBook && <Btn to={book}>예약하기</Btn>}
          <a className="btn btn--light" href={`tel:${site.phone}`}><Phone size={20} aria-hidden />전화 문의</a>
          <Btn to="/guide" variant="light">이용 안내</Btn>
          <a className="btn btn--light" href={MAP_URL} target="_blank" rel="noreferrer"><Navigation size={20} aria-hidden />길찾기</a>
        </div>
      </div>
    </section>
  )
}

// 방문 전 확인 네 칸
export function VisitInfo() {
  const t = todayHours()
  const a = pricing.admission
  const cells = [
    { icon: Clock, title: '운영시간', lines: [`평일 ${site.hours.weekday.replace('-', ' - ')}`, `주말 ${site.hours.weekend.replace('-', ' - ')}`, `${site.hours.closedDay} 휴무`], to: '/guide/calendar', cta: '운영 캘린더' },
    { icon: Wallet, title: '요금', lines: [`성인 ${won(a.individual.adult)}`, `청소년 ${won(a.individual.youth)}`, `어린이 ${won(a.individual.child)}`], to: '/guide', cta: '요금과 통합권' },
    { icon: MapPin, title: '위치와 주차', lines: [site.address, '주차장 이용 가능'], to: '/guide/directions', cta: '오시는 길' },
    { icon: Ticket, title: '예약이 필요한 놀이', lines: ['총게임, 동물 교감 카페', '좀비 숲, 1일 캠핑', '나머지는 현장에서 바로 이용'], to: '/reserve', cta: '예약하기' }
  ]
  return (
    <section className="wrap section vinfo" aria-labelledby="vinfo-h">
      <div className="stack-3 ctiles__head">
        <h2 id="vinfo-h" className="t-band c-primary">방문 안내</h2>
        <p className="t-body c-sub">{t.label}</p>
      </div>
      <ul className="vinfo__list">
        {cells.map(({ icon: I, title, lines, to, cta }) => (
          <li key={title} className="vinfo__cell">
            <I size={32} className="ico c-primary" aria-hidden />
            <h3 className="t-card">{title}</h3>
            <p className="t-body">{lines.map((l) => <span key={l} className="vinfo__ln">{l}</span>)}</p>
            <Link to={to} className="more t-body"><ArrowRight size={20} aria-hidden />{cta}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function VisitQA({ title = '자주 찾는 안내' }) {
  const qa = visitQA().map((x) => ({ q: x.q, a: <>{x.a} <Link to={x.to} className="inline-link">{x.cta}</Link></> }))
  return (
    <section id="visit-qa" className="wrap section">
      <h2 className="t-band c-primary tiles__title">{title}</h2>
      <Accordion items={qa} />
    </section>
  )
}

// 홈 맨 아래. 길찾기와 전화, 예약을 한 줄에
export function FinalCta() {
  return (
    <section className="nact nact--final">
      <div className="wrap nact__in">
        <div className="stack-3">
          <h2 className="t-band">오시는 길</h2>
          <p className="t-body">길찾기와 전화, 예약을 바로 할 수 있어요.</p>
        </div>
        <div className="nact__btns">
          <a className="btn" href={MAP_URL} target="_blank" rel="noreferrer"><Navigation size={20} aria-hidden />길찾기</a>
          <a className="btn btn--light" href={`tel:${site.phone}`}><Phone size={20} aria-hidden />{site.phone}</a>
          <Btn to="/reserve" variant="light">예약하기</Btn>
        </div>
      </div>
    </section>
  )
}

// 홈 맨 아래 한 줄 띠. 운영시간과 요금, 주소를 글로만 적고 길찾기와 전화, 예약 단추를 둔다
export function InfoBand() {
  const a = pricing.admission
  return (
    <section className="nact nact--final ibar" aria-label="방문 안내">
      <div className="wrap ibar__in">
        <dl className="ibar__list">
          <div><dt className="t-small">운영시간</dt><dd className="t-strong">평일 {site.hours.weekday.replace('-', ' - ')}, 주말 {site.hours.weekend.replace('-', ' - ')}, {site.hours.closedDay} 휴무</dd></div>
          <div><dt className="t-small">입장권</dt><dd className="t-strong">성인 {won(a.individual.adult)}, 청소년 {won(a.individual.youth)}, 어린이 {won(a.individual.child)}</dd></div>
          <div><dt className="t-small">주소</dt><dd className="t-strong">{site.address}</dd></div>
        </dl>
        <div className="nact__btns">
          <a className="btn" href={MAP_URL} target="_blank" rel="noreferrer"><Navigation size={20} aria-hidden />길찾기</a>
          <a className="btn btn--light" href={`tel:${site.phone}`}><Phone size={20} aria-hidden />{site.phone}</a>
          <Btn to="/guide" variant="light">요금 안내</Btn>
        </div>
      </div>
    </section>
  )
}

// 목록 위 방문자 걸러내기 단추
export function AudienceChips({ active, onPick }) {
  return (
    <div>
      <span className="t-strong pfilter__label">함께 오는 사람</span>
      <div className="pfilter" role="group" aria-label="함께 오는 사람">
        <button className="pfilter__btn" aria-pressed={!active} onClick={() => onPick('')}>전체</button>
        {audiences.map((a) => <button key={a.id} className="pfilter__btn" aria-pressed={active === a.id} onClick={() => onPick(active === a.id ? '' : a.id)}>{a.name}</button>)}
      </div>
    </div>
  )
}
