// Header.jsx  레고랜드 헤더 구조: 운영시간 줄(40) 위에 노란 메뉴 띠(100). 메뉴를 열면 파란 판이 펼쳐진다.
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, Clock, Menu, Ticket, User, X } from 'lucide-react'
import { menus, topLinks } from '../../lib/nav'
import { site, todayHours } from '../../lib/data'
import { Photo } from '../ui'

function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${site.name} 홈`}>
      <span className="logo__ko">{site.name}</span>
      <span className="logo__en">{site.nameEn.toUpperCase()}</span>
    </Link>
  )
}

function MegaPanel({ menu, onClose }) {
  return (
    <div className="mega" role="region" aria-label={`${menu.label} 메뉴`}>
      <div className="mega__cols" style={{ '--cols': menu.groups.length }}>
        <Link to={menu.to} className="mega__top t-menuhead" onClick={onClose}>
          <ArrowRight size={20} className="ico c-action" aria-hidden />{menu.label}
        </Link>
        <div className="mega__groups">
          {menu.groups.map((g) => (
            <div className="mega__group" key={g.title}>
              <Link to={g.to} className="t-menuhead" onClick={onClose}>{g.title}</Link>
              <ul>
                {g.items.map((it) => <li key={it.label}><Link to={it.to} className="t-small" onClick={onClose}>{it.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Link to={menu.promo.to} className="mega__promo" onClick={onClose}>
        <Photo slot={menu.promo.slot} fill tone={1} alt={menu.promo.label} />
        <span className="mega__cap t-body"><b>{menu.promo.label}</b> {menu.promo.text}</span>
      </Link>
    </div>
  )
}

export default function Header() {
  const [open, setOpen] = useState(null)
  const [mobile, setMobile] = useState(false)
  const [macc, setMacc] = useState(null)
  const timer = useRef(null)
  const loc = useLocation()
  const today = todayHours()

  useEffect(() => { setOpen(null); setMobile(false) }, [loc.pathname, loc.search, loc.hash])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(null); setMobile(false) } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('lock', mobile)
    return () => document.documentElement.classList.remove('lock')
  }, [mobile])

  const enter = (id) => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(id), 80) }
  const leave = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(null), 160) }

  return (
    <header className="hdr" onMouseLeave={leave}>
      <div className="hdr__top">
        <div className="wrap hdr__topin">
          <Link to="/guide/calendar" className="hdr__hours t-small"><Clock size={20} className="ico" aria-hidden />{today.label}</Link>
          <nav aria-label="바로가기" className="hdr__toplinks">
            {topLinks.map((l) => <Link key={l.to} to={l.to} className="t-small">{l.label}</Link>)}
            <Link to="/my" className="hdr__icon" aria-label="내 예약과 미션"><User size={20} aria-hidden /></Link>
          </nav>
        </div>
      </div>
      <div className="hdr__bar">
        <div className="wrap hdr__barin">
          <Link to="/reserve" className="hdr__mbtn hdr__mbtn--left" aria-label="예약"><Ticket size={24} aria-hidden /><span className="t-caption">예약</span></Link>
          <Logo />
          <nav aria-label="주 메뉴" className="hdr__nav">
            <ul className="hdr__menu">
              {menus.map((m) => (
                <li key={m.id} onMouseEnter={() => enter(m.id)}>
                  <div className={`hdr__item ${open === m.id ? 'is-open' : ''}`}>
                    <NavLink to={m.to} className="t-nav hdr__link">{m.label}</NavLink>
                    <button className="hdr__caret" aria-expanded={open === m.id} aria-label={`${m.label} 하위 메뉴`} onClick={() => setOpen(open === m.id ? null : m.id)}>
                      <ChevronDown size={20} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
              <li onMouseEnter={leave}><div className="hdr__item"><NavLink to="/map" className="t-nav hdr__link hdr__link--solo">공간 지도</NavLink></div></li>
            </ul>
            <Link to="/reserve" className="hdr__cta t-nav">예약</Link>
          </nav>
          <button className="hdr__mbtn hdr__mbtn--right" aria-expanded={mobile} aria-controls="mmenu" onClick={() => setMobile(!mobile)}>
            {mobile ? <X size={28} aria-hidden /> : <Menu size={28} aria-hidden />}<span className="t-caption">{mobile ? '닫기' : '메뉴'}</span>
          </button>
        </div>
        {open && (
          <div className="wrap hdr__megawrap" onMouseEnter={() => clearTimeout(timer.current)}>
            <MegaPanel menu={menus.find((m) => m.id === open)} onClose={() => setOpen(null)} />
          </div>
        )}
      </div>
      <div id="mmenu" className={`mmenu ${mobile ? 'is-open' : ''}`} hidden={!mobile}>
        <div className="mmenu__in">
          {menus.map((m) => (
            <div key={m.id} className="mmenu__sec">
              <button className="mmenu__head t-label" aria-expanded={macc === m.id} onClick={() => setMacc(macc === m.id ? null : m.id)}>
                {m.label}<ChevronDown size={24} aria-hidden />
              </button>
              {macc === m.id && (
                <div className="mmenu__body">
                  <Link to={m.to} className="t-strong c-action">{m.label} 전체</Link>
                  {m.groups.map((g) => (
                    <div key={g.title} className="stack-2">
                      <p className="t-strong">{g.title}</p>
                      <ul className="stack-2">{g.items.map((it) => <li key={it.label}><Link to={it.to} className="t-body">{it.label}</Link></li>)}</ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mmenu__sec"><Link to="/map" className="mmenu__head t-label">공간 지도</Link></div>
          <div className="mmenu__links">
            {topLinks.map((l) => <Link key={l.to} to={l.to} className="t-body">{l.label}</Link>)}
            <Link to="/my" className="t-body">내 예약과 미션</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
