// Layout.jsx  모든 화면 공통 틀. 페이지를 옮기면 스크롤을 맨 위로 올리고, 뒤로 가기만 이전 위치로 돌린다.
import { useEffect, useState } from 'react'
import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import { notices } from '../../lib/data'

function BookingBar() {
  return (
    <div className="bbar" role="region" aria-label="빠른 예약">
      <div className="wrap bbar__in">
        <Link to="/reserve?program=gungame" className="btn bbar__btn">숲속 총게임 예약</Link>
        <Link to="/guide" className="btn bbar__btn bbar__btn--sub">요금과 통합권</Link>
      </div>
    </div>
  )
}

function TopButton() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const f = () => setOn(window.scrollY > 600)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <button className={`topbtn ${on ? 'is-on' : ''}`} aria-label="맨 위로" tabIndex={on ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}>
      <ArrowUp size={24} aria-hidden />
    </button>
  )
}

export function NoticeBand() {
  const n = notices.find((x) => x.urgent)
  if (!n) return null
  return (
    <div className="notice">
      <div className="wrap notice__in">
        <Link to={n.link} className="t-strong">공지 {n.title}</Link>
      </div>
    </div>
  )
}

export default function Layout() {
  const loc = useLocation()
  const inReserve = loc.pathname.startsWith('/reserve')
  useEffect(() => { document.body.classList.toggle('has-bar', !inReserve) }, [inReserve])
  return (
    <>
      <a href="#main" className="skip">본문 바로가기</a>
      <svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute' }}>
        <clipPath id="wave" clipPathUnits="objectBoundingBox"><path d="M0,0.07 Q0.5,-0.05 1,0.07 L1,0.9 C0.82,0.82 0.66,1.01 0.48,0.97 C0.28,0.93 0.12,0.82 0,0.9 Z" /></clipPath>
      </svg>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      {!inReserve && <BookingBar />}
      <TopButton />
      <ScrollRestoration />
    </>
  )
}
