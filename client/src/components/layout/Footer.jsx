// Footer.jsx  레고랜드 푸터 구조: 초록 알림 신청 판, 하늘색 줄, 남색 메뉴 줄, 흰 정보 줄.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { menus } from '../../lib/nav'
import { site, currentSeason, seasons, seasonStatus } from '../../lib/data'
import { useStore } from '../../lib/store'
import { useToast } from '../ui'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const store = useStore()
  const [toast, say] = useToast()
  const next = seasons.filter((s) => seasonStatus(s) === 'soon').sort((a, b) => a.period.start.localeCompare(b.period.start))[0] || currentSeason()

  const submit = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('이메일 주소를 다시 확인해 주세요.'); return }
    setErr('')
    if (!store.alerts[next.id]) store.toggleAlert(next.id)
    setEmail('')
    say(`${next.season} 시즌이 열리면 가장 먼저 알려 드릴게요.`)
  }

  return (
    <footer className="ftr">
      <div className="ftr__signup">
        <div className="wrap">
          <form className="ftr__form" onSubmit={submit} noValidate>
            <h2 className="t-label">{next.season} 시즌 오픈 알림</h2>
            <p className="t-body">{next.title}이 열리는 날 이메일로 알려 드려요.</p>
            <div className="field">
              <label htmlFor="ftr-email">이메일</label>
              <input id="ftr-email" className="input input--onColor" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? 'ftr-err' : undefined} />
              {err && <p id="ftr-err" className="field__err ftr__err">{err}</p>}
            </div>
            <button className="btn btn--light btn--block" type="submit">알림 신청</button>
          </form>
        </div>
      </div>
      <div className="ftr__sky">
        <div className="wrap ftr__skyin">
          <a href={site.officialSite} className="ftr__ext t-body" target="_blank" rel="noreferrer"><ArrowRight size={20} aria-hidden />육림랜드 공식 사이트</a>
          <a href={`tel:${site.phone}`} className="ftr__ext t-body"><ArrowRight size={20} aria-hidden />대표 전화 {site.phone}</a>
        </div>
      </div>
      <div className="ftr__nav">
        <div className="wrap">
          <nav className="ftr__cols" aria-label="사이트 전체 메뉴">
            {menus.slice(0, 4).map((m) => (
              <div key={m.id}>
                <h2 className="t-label"><Link to={m.to}>{m.label}</Link></h2>
                <ul className="stack-3">
                  {m.groups.flatMap((g) => g.items).slice(0, 5).map((it) => <li key={it.label}><Link to={it.to} className="t-body">{it.label}</Link></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>
      <div className="ftr__info">
        <div className="wrap stack-3">
          <p className="t-small">{site.address} | {site.name}</p>
          <p className="t-small">대표 전화 {site.phone} | 평일 {site.hours.weekday.replace('-', ' - ')} | 주말 {site.hours.weekend.replace('-', ' - ')} | 매주 {site.hours.closedDay} 휴무({site.hours.closedDayNote})</p>
        </div>
      </div>
      {toast}
    </footer>
  )
}
