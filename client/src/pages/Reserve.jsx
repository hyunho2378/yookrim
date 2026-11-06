// Reserve.jsx  예약 3단계와 완료 티켓. 단계 사이를 오가도 고른 값이 그대로 남는다.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { Minus, Plus, Ticket, MapPin, CalendarDays, Users, Clock } from 'lucide-react'
import Calendar from '../components/Calendar'
import { Btn, CheckBox, useToast } from '../components/ui'
import { program, season, seasonStatus, isClosedDay, kstDate, ymd, seatsLeft, won, pricing, dotDate, statusText, periodText } from '../lib/data'
import { useStore } from '../lib/store'

const Ctx = createContext(null)
const useDraft = () => useContext(Ctx)

const options = [
  { id: 'gungame', season: 'autumn' },
  { id: 'animal-cafe' },
  { id: 'zombie-night', season: 'summer' },
  { id: 'winter-camp', season: 'winter' }
]

function sessionsOf(p, mode, dateStr) {
  if (!p) return []
  if (p.id === 'gungame') {
    if (mode === 'night') { const d = new Date(`${dateStr}T00:00:00`); return [5, 6].includes(d.getDay()) ? p.nightSessions : [] }
    return p.sessions
  }
  if (p.id === 'winter-camp') return ['13:00']
  return p.sessions || []
}
function unitPrice(p, mode) {
  if (!p) return 0
  if (p.id === 'gungame') return p.price[mode] || 0
  if (p.id === 'animal-cafe') return p.price.perPerson
  if (p.id === 'zombie-night') return p.price.adult
  if (p.id === 'winter-camp') return p.options.find((o) => o.id === mode)?.price || p.options[0].price
  return 0
}
const capOf = (p) => p?.capacity?.perSession || 8

export function ReserveLayout() {
  const [sp] = useSearchParams()
  const [draft, setDraft] = useState(() => {
    const pid = sp.get('program') || 'gungame'
    const p = program(pid)
    return {
      program: pid, mode: sp.get('mode') || (pid === 'gungame' ? 'laser' : pid === 'winter-camp' ? 'day' : null),
      date: null, time: null, people: { adult: sp.get('group') ? 20 : 2, youth: 0, child: 0 }, admission: false, agree: false,
      name: '', phone: '', pay: 'card', _cap: capOf(p)
    }
  })
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const loc = useLocation()
  const step = loc.pathname.endsWith('/details') ? 2 : loc.pathname.endsWith('/confirm') ? 3 : loc.pathname.endsWith('/done') ? 4 : 1
  return (
    <Ctx.Provider value={{ draft, set }}>
      <section className="rsv-head">
        <div className="wrap">
          <h1 className="t-band">예약</h1>
          {step < 4 && (
            <ol className="stepper" aria-label="예약 단계">
              {['프로그램과 날짜', '인원과 동의', '확인과 결제'].map((t, i) => (
                <li key={t} className={step === i + 1 ? 'is-on' : step > i + 1 ? 'is-done' : ''} aria-current={step === i + 1 ? 'step' : undefined}>
                  <span className="stepper__no t-label">{i + 1}</span><span className="t-strong">{t}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      <Outlet />
    </Ctx.Provider>
  )
}

function Summary() {
  const { draft } = useDraft()
  const p = program(draft.program)
  const total = calcTotal(draft)
  const ppl = draft.people.adult + draft.people.youth + draft.people.child
  return (
    <aside className="rsv-sum">
      <h2 className="t-label">예약 요약</h2>
      <dl className="rsv-sum__list">
        <div><dt className="t-small"><Ticket size={20} aria-hidden />프로그램</dt><dd className="t-strong">{p?.name}{draft.mode && p?.modes ? ` ${p.modes.find((m) => m.id === draft.mode)?.name}` : ''}{p?.options ? ` ${p.options.find((o) => o.id === draft.mode)?.name || ''}` : ''}</dd></div>
        <div><dt className="t-small"><CalendarDays size={20} aria-hidden />날짜</dt><dd className="t-strong">{draft.date ? dotDate(draft.date) : '선택 전'}</dd></div>
        <div><dt className="t-small"><Clock size={20} aria-hidden />회차</dt><dd className="t-strong">{draft.time || '선택 전'}</dd></div>
        <div><dt className="t-small"><Users size={20} aria-hidden />인원</dt><dd className="t-strong">{ppl}명</dd></div>
      </dl>
      <p className="rsv-sum__total"><span className="t-small">합계</span><span className="t-card">{won(total.sum)}</span></p>
      {total.discount > 0 && <p className="t-small c-action">단체 할인 {won(total.discount)} 적용</p>}
    </aside>
  )
}

export function calcTotal(d) {
  const p = program(d.program)
  const ppl = d.people.adult + d.people.youth + d.people.child
  const unit = unitPrice(p, d.mode)
  const base = p?.id === 'winter-camp' ? unit : unit * ppl
  const adm = d.admission ? d.people.adult * pricing.admission.individual.adult + d.people.youth * pricing.admission.individual.youth + d.people.child * pricing.admission.individual.child : 0
  const discount = p?.id === 'gungame' && ppl >= 20 ? Math.round(base * 0.1) : 0
  return { base, adm, discount, sum: base + adm - discount, ppl }
}

export function Step1() {
  const { draft, set } = useDraft()
  const nav = useNavigate()
  const p = program(draft.program)
  const now = kstDate()
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const opt = options.find((o) => o.id === draft.program)
  const s = opt?.season ? season(opt.season) : null
  const info = (d) => {
    const key = ymd(d)
    if (isClosedDay(d)) return { open: false, text: '휴무' }
    if (s && (key < s.period.start || key > s.period.end)) return { open: false, text: '기간 밖' }
    if (draft.mode === 'night' && ![5, 6].includes(d.getDay())) return { open: false, text: '주간만' }
    return { open: true, text: '예약 가능' }
  }
  const times = draft.date ? sessionsOf(p, draft.mode, draft.date) : []
  const need = draft.people.adult + draft.people.youth + draft.people.child
  const pick = (patch) => set({ ...patch, time: null, ...(patch.program ? { date: null } : {}) })
  return (
    <section className="wrap section rsv">
      <div className="rsv__main stack-7">
        <div className="stack-4">
          <h2 className="t-label">프로그램</h2>
          <div className="choices">
            {options.map((o) => {
              const op = program(o.id)
              const os = o.season ? season(o.season) : null
              const st = os ? seasonStatus(os) : 'live'
              return (
                <button key={o.id} className="choice" aria-pressed={draft.program === o.id} disabled={st !== 'live'} onClick={() => pick({ program: o.id, mode: o.id === 'gungame' ? 'laser' : o.id === 'winter-camp' ? 'day' : null, _cap: capOf(op) })}>
                  {op.name}{st !== 'live' && <span className="t-small">{statusText[st]}</span>}
                </button>
              )
            })}
          </div>
          {s && <p className="t-small c-sub">{s.season} 시즌 {periodText(s.period)}에만 예약할 수 있어요.</p>}
        </div>
        {p?.modes && (
          <div className="stack-4">
            <h2 className="t-label">게임 모드</h2>
            <div className="choices">
              {p.modes.map((m) => <button key={m.id} className="choice" aria-pressed={draft.mode === m.id} onClick={() => pick({ mode: m.id, date: draft.mode === 'night' || m.id === 'night' ? null : draft.date })}>{m.name} <span className="t-small">{m.age}</span></button>)}
            </div>
          </div>
        )}
        <div className="stack-4">
          <h2 className="t-label">날짜</h2>
          <p className="t-small c-sub">화요일은 쉬는 날이에요.</p>
          <Calendar month={month} onMonth={setMonth} selected={draft.date} onSelect={(k) => set({ date: k, time: null })} info={info} label="예약 날짜" />
        </div>
        <div className="stack-4" id="times">
          <h2 className="t-label">회차</h2>
          {!draft.date && <p className="t-body c-sub">날짜를 고르면 회차가 보여요.</p>}
          {draft.date && !times.length && <p className="t-body c-sub">이 날은 열리는 회차가 없어요.</p>}
          <div className="sess">
            {times.map((t) => {
              const left = seatsLeft(draft.date, t, draft._cap)
              const short = left < need
              return (
                <button key={t} className="sess__btn" aria-pressed={draft.time === t} disabled={left === 0} onClick={() => set({ time: t })}>
                  <span className="t-label">{t}</span>
                  <span className="t-small">{left === 0 ? '마감' : `남은 자리 ${left}석`}</span>
                  {short && left > 0 && <span className="t-caption c-action">인원 {need}명보다 적어요</span>}
                </button>
              )
            })}
          </div>
          {draft.time && seatsLeft(draft.date, draft.time, draft._cap) < need && (() => {
            const alt = times.find((t) => seatsLeft(draft.date, t, draft._cap) >= need)
            return <p className="t-body c-action">자리가 모자라요. {alt ? `${alt} 회차는 ${need}명이 함께 들어갈 수 있어요.` : '다른 날짜를 골라 주세요.'}</p>
          })()}
        </div>
        <div className="rsv__next">
          <Btn disabled={!draft.date || !draft.time || seatsLeft(draft.date, draft.time, draft._cap) < 1} onClick={() => nav('/reserve/details')}>다음 단계</Btn>
        </div>
      </div>
      <Summary />
    </section>
  )
}

function Counter({ label, sub, value, onChange, min = 0, max = 40 }) {
  return (
    <div className="ctr">
      <div><p className="t-strong">{label}</p>{sub && <p className="t-small c-sub">{sub}</p>}</div>
      <div className="ctr__ctl">
        <button className="ctr__btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} 한 명 빼기`}><Minus size={20} aria-hidden /></button>
        <output className="t-label" aria-live="polite">{value}</output>
        <button className="ctr__btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} 한 명 더하기`}><Plus size={20} aria-hidden /></button>
      </div>
    </div>
  )
}

export function Step2() {
  const { draft, set } = useDraft()
  const nav = useNavigate()
  const [toast, say] = useToast()
  const p = program(draft.program)
  const [tried, setTried] = useState(false)
  const total = calcTotal(draft)
  useEffect(() => { if (total.discount > 0) say(`단체 할인 적용 ${won(total.discount)}`) }, [total.discount > 0]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!draft.date || !draft.time) return <Navigate to="/reserve" replace />
  const setP = (k, v) => set({ people: { ...draft.people, [k]: v } })
  const ageWarn = p?.id === 'gungame' && ((draft.mode === 'paintball' && draft.people.child > 0) || (draft.mode === 'night' && (draft.people.child + draft.people.youth) > 0))
  const left = seatsLeft(draft.date, draft.time, draft._cap)
  const nameOk = draft.name.trim().length > 0
  const phoneOk = /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(draft.phone.trim())
  const ok = draft.agree && nameOk && phoneOk && total.ppl > 0 && total.ppl <= left && !ageWarn
  const safety = p?.safety || p?.welfareRules || p?.rules || []
  return (
    <section className="wrap section rsv">
      <div className="rsv__main stack-7">
        <div className="stack-4">
          <h2 className="t-label">인원</h2>
          <Counter label="성인" sub="만 19세 이상" value={draft.people.adult} onChange={(v) => setP('adult', v)} />
          <Counter label="청소년" sub="만 13세부터 18세" value={draft.people.youth} onChange={(v) => setP('youth', v)} />
          <Counter label="어린이" sub="만 12세 이하" value={draft.people.child} onChange={(v) => setP('child', v)} />
          {total.ppl > left && <p className="t-body c-action">이 회차는 {left}명까지 들어갈 수 있어요.</p>}
          {ageWarn && <p className="t-body c-action">{draft.mode === 'paintball' ? '만 14세 미만은 페인트볼 대신 레이저 배틀을 골라 주세요' : '야간 미션전은 만 19세 이상이라 주간 레이저 배틀을 골라 주세요'}</p>}
          {p?.id === 'gungame' && <p className="t-small c-sub">20명 이상이면 단체 할인 10%가 자동으로 적용돼요.</p>}
        </div>
        <div className="stack-3">
          <h2 className="t-label">입장권</h2>
          <CheckBox checked={draft.admission} onChange={(v) => set({ admission: v })}>입장권도 함께 살게요. 성인 {won(pricing.admission.individual.adult)}, 청소년 {won(pricing.admission.individual.youth)}, 어린이 {won(pricing.admission.individual.child)}</CheckBox>
        </div>
        <div className="stack-3">
          <h2 className="t-label">안전 수칙</h2>
          <ul className="rules">{safety.map((r) => <li key={r} className="t-body">{r}</li>)}</ul>
          <CheckBox checked={draft.agree} onChange={(v) => set({ agree: v })}>안전 수칙을 모두 읽고 지킬게요. (필수)</CheckBox>
          {tried && !draft.agree && <p className="field__err">안전 수칙에 동의해야 다음 단계로 갈 수 있어요.</p>}
        </div>
        <div className="stack-4">
          <h2 className="t-label">예약자</h2>
          <div className="rsv__fields">
            <div className="field">
              <label htmlFor="r-name">이름</label>
              <input id="r-name" className="input" autoComplete="name" value={draft.name} onChange={(e) => set({ name: e.target.value })} aria-invalid={tried && !nameOk} />
              {tried && !nameOk && <p className="field__err">이름을 넣어 주세요.</p>}
            </div>
            <div className="field">
              <label htmlFor="r-phone">휴대폰 번호</label>
              <input id="r-phone" className="input" inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} aria-invalid={tried && !phoneOk} />
              {tried && !phoneOk && <p className="field__err">휴대폰 번호를 다시 확인해 주세요.</p>}
            </div>
          </div>
        </div>
        <div className="rsv__next">
          <Btn variant="deep" onClick={() => nav('/reserve')}>이전 단계</Btn>
          <Btn onClick={() => { setTried(true); if (ok) nav("/reserve/confirm") }}>다음 단계</Btn>
        </div>
      </div>
      <Summary />
      {toast}
    </section>
  )
}

export function Step3() {
  const { draft, set } = useDraft()
  const nav = useNavigate()
  const store = useStore()
  const [busy, setBusy] = useState(false)
  if (!draft.date || !draft.time || !draft.agree) return <Navigate to="/reserve" replace />
  const p = program(draft.program)
  const t = calcTotal(draft)
  const pay = () => {
    setBusy(true)
    const no = `YR${draft.date.replace(/-/g, '').slice(2)}${String(Math.floor(Math.random() * 9000) + 1000)}`
    const modeName = p.modes ? p.modes.find((m) => m.id === draft.mode)?.name : p.options ? p.options.find((o) => o.id === draft.mode)?.name : ''
    store.addReservation({ no, program: p.id, name: p.name, mode: modeName || '', date: draft.date, time: draft.time, people: t.ppl, total: t.sum, at: new Date().toISOString() })
    setTimeout(() => nav(`/reserve/done?no=${no}`), 400)
  }
  return (
    <section className="wrap section rsv">
      <div className="rsv__main stack-7">
        <div className="stack-4">
          <h2 className="t-label">예약 내용 확인</h2>
          <dl className="kv">
            <dt>프로그램</dt><dd>{p.name}</dd>
            <dt>날짜와 회차</dt><dd>{dotDate(draft.date)} {draft.time}</dd>
            <dt>인원</dt><dd>성인 {draft.people.adult}명, 청소년 {draft.people.youth}명, 어린이 {draft.people.child}명</dd>
            <dt>예약자</dt><dd>{draft.name} {draft.phone}</dd>
            <dt>프로그램 요금</dt><dd>{won(t.base)}</dd>
            {t.adm > 0 && <><dt>입장권</dt><dd>{won(t.adm)}</dd></>}
            {t.discount > 0 && <><dt>단체 할인</dt><dd>-{won(t.discount)}</dd></>}
            <dt>합계</dt><dd className="t-strong">{won(t.sum)}</dd>
          </dl>
        </div>
        <div className="stack-4">
          <h2 className="t-label">결제 수단</h2>
          <div className="choices" role="radiogroup" aria-label="결제 수단">
            {[['card', '신용카드'], ['bank', '계좌이체'], ['site', '현장 결제']].map(([k, l]) => <button key={k} role="radio" aria-checked={draft.pay === k} className="choice" onClick={() => set({ pay: k })}>{l}</button>)}
          </div>
        </div>
        <div className="rsv__next">
          <Btn variant="deep" onClick={() => nav('/reserve/details')}>이전 단계</Btn>
          <Btn onClick={pay} disabled={busy}>{busy ? '결제 중' : `${won(t.sum)} 결제`}</Btn>
        </div>
      </div>
      <Summary />
    </section>
  )
}

export function Done() {
  const [sp] = useSearchParams()
  const store = useStore()
  const r = store.reservations.find((x) => x.no === sp.get('no'))
  if (!r) return store.ready ? <Navigate to="/my" replace /> : null
  return (
    <section className="wrap section done">
      <div className="ticket">
        <div className="ticket__top">
          <p className="t-small">예약 번호</p>
          <p className="t-band">{r.no}</p>
        </div>
        <div className="ticket__body stack-3">
          <h2 className="t-card">{r.name} {r.mode}</h2>
          <p className="t-label">{dotDate(r.date)} {r.time}</p>
          <p className="t-body">{r.people}명, {won(r.total)}</p>
        </div>
      </div>
      <div className="stack-5">
        <h1 className="t-band c-primary">예약 완료</h1>
        <p className="t-body">입장할 때 이 티켓을 보여 주세요, 마이 화면에서 다시 볼 수 있어요</p>
        <div className="stack-3">
          <h2 className="t-label">방문 전 확인</h2>
          <ul className="rules">
            <li className="t-body">운영시간과 휴무일</li>
            <li className="t-body">편한 신발</li>
            {r.program === 'gungame' && <li className="t-body">갈아입을 옷</li>}
          </ul>
        </div>
        <div className="done__btns">
          <Btn to={`/map?focus=${r.program === 'gungame' ? 'gungame-base' : r.program}`}><MapPin size={20} aria-hidden />집결지 위치</Btn>
          <Btn variant="deep" to="/guide/directions">오시는 길</Btn>
          <Btn variant="deep" to="/my">내 예약</Btn>
        </div>
      </div>
    </section>
  )
}
