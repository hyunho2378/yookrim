// blocks/index.jsx  레고랜드 홈과 하위 화면의 블록을 그대로 옮긴 부품. 내용은 넘겨받은 값만 그린다.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronRight as Arrow, Pause, Play, Check, CalendarDays, Clock, ArrowRight } from 'lucide-react'
import { Btn, Photo } from '../ui'
import { motion } from '../../tokens'

// 첫 화면 사진 넘김. 7초마다 0.8초 동안 겹쳐 바뀐다. 마우스를 올리면 멈추고, 멈춤 단추와 좌우 화살표가 있다
export function Hero({ slides }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const n = slides.length
  const go = useCallback((d) => setI((x) => (x + d + n) % n), [n])
  useEffect(() => {
    if (paused || hover || reduce || n < 2) return
    const t = setTimeout(() => go(1), motion.heroInterval)
    return () => clearTimeout(t)
  }, [i, paused, hover, reduce, go, n])
  return (
    <section className="hero" aria-roledescription="carousel" aria-label="이번 시즌 소식" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      {slides.map((s, k) => (
        <div key={s.title} className={`hero__slide ${k === i ? 'is-on' : ''}`} aria-hidden={k !== i} role="group" aria-roledescription="slide" aria-label={`${k + 1} / ${n}`}>
          <Photo slot={s.slot} fill tone={s.tone} alt={s.alt} />
          <div className="wrap hero__copy">
            <p className="hero__lead t-label">{s.lead}</p>
            <h2 className="t-display">{s.title}</h2>
            <div className="hero__btns">
              <Btn to={s.to} tabIndex={k === i ? 0 : -1}>{s.cta}</Btn>
            </div>
          </div>
        </div>
      ))}
      <button className="hero__arrow hero__arrow--l" onClick={() => go(-1)} aria-label="이전 슬라이드"><ChevronLeft size={32} aria-hidden /></button>
      <button className="hero__arrow hero__arrow--r" onClick={() => go(1)} aria-label="다음 슬라이드"><ChevronRight size={32} aria-hidden /></button>
      <div className="wrap hero__ctrl">
        <span className="t-strong" aria-live="polite">{i + 1} / {n}</span>
        <button onClick={() => setPaused(!paused)} aria-label={paused ? '자동 넘김 다시 시작' : '자동 넘김 멈춤'}>{paused ? <Play size={20} aria-hidden /> : <Pause size={20} aria-hidden />}</button>
      </div>
    </section>
  )
}

// 첫 화면 아래 흰 바로가기 4칸. 사진 아래쪽에 겹쳐 놓는다
export function QuickLinks({ items }) {
  return (
    <div className="wrap quick">
      <ul className="quick__list">
        {items.map(({ icon: Icon, title, text, to }) => (
          <li key={title}>
            <Link to={to} className="quick__link">
              <Icon size={48} strokeWidth={1.5} className="ico c-primary" aria-hidden />
              <span className="quick__txt">
                <span className="t-quick c-primary">{title}</span>
                <span className="t-caption c-primary">{text}</span>
              </span>
              <Arrow size={20} className="ico c-action" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 파란 띠에 핵심 안내 3개
export function UspBand({ items }) {
  return (
    <section className="usp" aria-label="방문 전 안내">
      <ul className="wrap usp__list">
        {items.map(({ icon: Icon, text, to }) => (
          <li key={text}><Link to={to} className="t-strong"><Icon size={32} strokeWidth={1.75} aria-hidden />{text}</Link></li>
        ))}
      </ul>
    </section>
  )
}

// 사진 위, 제목, 설명, 맨 아래 남색 단추가 있는 4열
export function PromoCols({ items }) {
  return (
    <section className="wrap section promo" aria-label="대표 즐길거리">
      <ul className="promo__list">
        {items.map((it, k) => (
          <li key={it.title} className="promo__item">
            <Photo slot={it.slot} ratio="356 / 273" tone={k} round />
            <h2 className="t-card">{it.title}</h2>
            <p className="t-body">{it.text}</p>
            <Btn to={it.to} variant="deep" block className="promo__btn">{it.cta}</Btn>
          </li>
        ))}
      </ul>
    </section>
  )
}

// 왼쪽 사진 594 x 396, 오른쪽 파란 큰 제목과 설명, 빨간 단추
export function Teaser({ id, slot, tone = 0, title, children, cta, to, flip }) {
  return (
    <section id={id} className={`wrap section teaser ${flip ? 'teaser--flip' : ''}`}>
      <div className="teaser__media">
        <Photo slot={slot} ratio="3 / 2" tone={tone} round>
          </Photo>
      </div>
      <div className="teaser__body stack-4">
        <h2 className="t-band c-primary">{title}</h2>
        <div className="teaser__text stack-3 t-body">{children}</div>
        {cta && <div className="teaser__cta"><Btn to={to}>{cta}</Btn></div>}
      </div>
    </section>
  )
}

export function CheckList({ items }) {
  return <ul className="checks">{items.map((t) => <li key={t} className="t-body"><Check size={20} strokeWidth={2.5} className="ico c-action" aria-hidden />{t}</li>)}</ul>
}

// 정사각 사진 위에 제목과 기간. "이 시즌 축제/이벤트" 블록
export function TileGrid({ title, items, more }) {
  return (
    <section className="wrap section tiles">
      <h2 className="t-label tiles__title">{title}</h2>
      <ul className="tiles__list">
        {items.map((it, k) => (
          <li key={it.title}>
            <Link to={it.to} className="tiles__item">
              <Photo slot={it.slot} ratio="1 / 1" tone={k + 1} round />
              <h3 className="t-card">{it.title}</h3>
              <p className="t-small tiles__meta"><CalendarDays size={20} className="ico" aria-hidden />{it.meta}</p>
              {it.status && <p className="t-strong c-action">{it.status}</p>}
            </Link>
          </li>
        ))}
      </ul>
      {more && <div className="tiles__more"><Link to={more.to} className="more t-body"><ArrowRight size={20} aria-hidden />{more.label}</Link></div>}
    </section>
  )
}

// 3열 상품 블록. 사진, 제목, 아이콘 줄 두 개
export function PackageCards({ title, items, more }) {
  return (
    <section className="wrap section pkgs">
      <h2 className="t-label tiles__title">{title}</h2>
      <ul className="pkgs__list">
        {items.map((it, k) => (
          <li key={it.title}>
            <Link to={it.to} className="pkgs__item">
              <Photo slot={it.slot} ratio="1 / 1" tone={k + 2} round />
              <h3 className="t-card">{it.title}</h3>
              {it.lines.map(({ icon: I = CalendarDays, text }) => <p key={text} className="t-small pkgs__meta"><I size={20} className="ico" aria-hidden />{text}</p>)}
            </Link>
          </li>
        ))}
      </ul>
      {more && <div className="tiles__more"><Link to={more.to} className="more t-body"><ArrowRight size={20} aria-hidden />{more.label}</Link></div>}
    </section>
  )
}

// 사진 5칸 모자이크. 왼쪽 위 초록 이름표, 마우스를 올리면 설명이 보인다
export function Mosaic({ title, items }) {
  return (
    <section className="wrap section mosaic">
      <h2 className="t-card c-primary mosaic__title">{title}</h2>
      <ul className="mosaic__grid">
        {items.map((it, k) => (
          <li key={it.label} className={`mosaic__cell mosaic__cell--${k}`}>
            <Link to={it.to} className="mosaic__link">
              <Photo slot={it.slot} fill tone={k} />
              <span className="mosaic__tag t-strong">{it.label}</span>
              <span className="mosaic__hover t-body">{it.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// 하위 화면 첫 띠. 사진 위 가운데 큰 제목과 한두 줄 설명(레고랜드 라이드 화면)
export function SubHero({ slot, tone = 0, title, text }) {
  return (
    <section className="subhero">
      <Photo slot={slot} fill tone={tone} />
      <div className="wrap subhero__in">
        <h1 className="t-display">{title}</h1>
        {text && <p className="t-label subhero__text">{text}</p>}
      </div>
    </section>
  )
}

// 행사 화면 첫 띠. 큰 사진 위 왼쪽 아래 색 상자에 기간과 제목, 단추(레고랜드 시즌 이벤트 화면)
export function EventHero({ slot, tone = 1, tag, title, text, cta, to, onCta }) {
  // 파란 상자와 사진 자리 색이 겹치지 않게 초록이나 빨강 자리만 쓴다
  const t = [1, 1, 2, 2][tone % 4]
  return (
    <section className="ehero">
      <Photo slot={slot} fill tone={t} />
      <div className="wrap ehero__in">
        <div className="ehero__box stack-4">
          {tag && <p className="ehero__tag t-strong">{tag}</p>}
          <h1 className="t-band">{title}</h1>
          {text && <p className="t-body">{text}</p>}
          {cta && (onCta ? <Btn variant="light" onClick={onCta}>{cta}</Btn> : <Btn variant="light" to={to}>{cta}</Btn>)}
        </div>
      </div>
    </section>
  )
}

// 가운데 파란 제목과 짧은 설명(레고랜드 이용권 화면)
export function CenterTitle({ title, text, as: H = 'h2' }) {
  return (
    <div className="ctitle stack-3">
      <H className="t-band c-primary">{title}</H>
      {text && <p className="t-body c-sub">{text}</p>}
    </div>
  )
}

// 회색 띠 위 가운데 제목(레고랜드 자주 묻는 질문 화면)
export function PlainHero({ title, text }) {
  return (
    <section className="phero">
      <div className="wrap phero__in stack-3">
        <h1 className="t-display">{title}</h1>
        {text && <p className="t-label c-sub">{text}</p>}
      </div>
    </section>
  )
}
