// Reserve.jsx  예약 3단계와 완료 티켓. 단계 사이를 오가도 고른 값이 그대로 남는다.
import { Fragment, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { Minus, Plus, MapPin, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import Calendar from '../components/Calendar'
import { Btn, CheckBox, Photo, useToast } from '../components/ui'
import { program, season, seasonStatus, isClosedDay, kstDate, ymd, won, pricing, dotDate, statusText, periodText, seatsLeft, shortDate } from '../lib/data'
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
export function ReserveLayout() {
  const [sp] = useSearchParams()
  const [draft, setDraft] = useState(() => {
    const pid = sp.get('program') || 'gungame'
    const p = program(pid)
    return {
      program: pid, mode: sp.get('mode') || (pid === 'gungame' ? 'laser' : pid === 'winter-camp' ? 'day' : null),
      date: null, time: null, people: { adult: sp.get('group') ? 20 : 2, youth: 0, child: 0 }, admission: false, agree: false,
      name: '', phone: '', pay: 'card'
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
              {['프로그램 선택', '예약자 정보', '확인과 결제'].map((t, i) => (
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

const progName = (p, d) => p?.id === 'gungame' && d.mode === 'night' ? '야간 미션전' : `${p?.name || ''}${p?.modes && d.mode !== 'night' ? ` ${p.modes.find((m) => m.id === d.mode)?.name || ''}` : ''}${p?.options ? ` ${p.options.find((o) => o.id === d.mode)?.name || ''}` : ''}`
const DOWK = ['일', '월', '화', '수', '목', '금', '토']
const dateLabel = (k) => { const d = new Date(`${k}T00:00:00`); return `${shortDate(k)}(${DOWK[d.getDay()]})` }

// 아래 고정 줄: 고른 내용과 합계, 다음 단추를 한 줄에 둔다
function ResBar({ hint, children }) {
  const { draft } = useDraft()
  const p = program(draft.program)
  const total = calcTotal(draft)
  const bits = [progName(p, draft), draft.date && dateLabel(draft.date), draft.time, p?.id !== 'winter-camp' && `${total.ppl}명`].filter(Boolean)
  return (
    <div className="rbar" role="region" aria-label="예약 요약">
      <div className="wrap rbar__in">
        <div className="rbar__txt">
          <p className="t-strong rbar__sel">{bits.join('  ')}</p>
          {total.discount > 0 && <p className="t-small">단체 할인 {won(total.discount)} 적용</p>}
          {hint && <p className="t-small rbar__hint">{hint}</p>}
        </div>
        <p className="rbar__sum"><span className="t-small">합계</span><span className="t-card">{won(total.sum)}</span></p>
        <div className="rbar__btns">{children}</div>
      </div>
    </div>
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

const rows = [
  { key: 'gungame', id: 'gungame', name: '숲속 총게임', slot: 'zone-survival', meta: '레이저 배틀 10세 이상, 페인트볼 만 14세 이상', price: '1인 12,000원~' },
  { key: 'night', id: 'gungame', night: true, name: '야간 미션전', slot: 'gungame-zone-overview', meta: '만 19세 이상, 금요일과 토요일 밤', price: '1인 22,000원' },
  { key: 'animal-cafe', id: 'animal-cafe', name: '동물 교감 카페', slot: 'cafe-interior', meta: '음료 1잔 포함', price: '1인 6,000원' },
  { key: 'zombie-night', id: 'zombie-night', name: '한밤의 좀비 숲', slot: 'zombie-night', meta: '여름 시즌 야간 체험', price: '1인 15,000원', season: 'summer' },
  { key: 'winter-camp', id: 'winter-camp', name: '1일 캠핑 데이', slot: 'camp-winter', meta: '사이트 1개 4인 기준', price: '30,000원~', season: 'winter' }
]
const isOn = (r, d) => d.program === r.id && (r.id !== 'gungame' || (r.night ? d.mode === 'night' : d.mode !== 'night'))

function DateStrip({ value, onPick, openOf }) {
  const today = kstDate()
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const [off, setOff] = useState(0)
  const [full, setFull] = useState(false)
  const [month, setMonth] = useState(new Date(base.getFullYear(), base.getMonth(), 1))
  const days = Array.from({ length: 7 }, (_, i) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + off * 7 + i))
  return (
    <div className="rdate">
      <div className="rdate__row">
        <button className="rdate__nav" onClick={() => setOff(off - 1)} disabled={off <= 0} aria-label="앞 주"><ChevronLeft size={22} aria-hidden /></button>
        <div className="rdate__days" role="group" aria-label="방문일">
          {days.map((d) => {
            const k = ymd(d); const it = openOf(d)
            return (
              <button key={k} className="rdate__day" aria-pressed={value === k} disabled={!it.open} onClick={() => onPick(k)} aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일 ${DOWK[d.getDay()]}요일 ${it.text}`}>
                <span className="t-small">{DOWK[d.getDay()]}</span>
                <span className="t-card rdate__n">{d.getDate()}</span>
                <span className="t-caption">{it.open ? (d.getDate() === 1 || i0(d, days) ? `${d.getMonth() + 1}월` : '') : it.text}</span>
              </button>
            )
          })}
        </div>
        <button className="rdate__nav" onClick={() => setOff(off + 1)} disabled={off >= 8} aria-label="뒤 주"><ChevronRight size={22} aria-hidden /></button>
        <button className="rdate__cal" aria-expanded={full} onClick={() => setFull(!full)}><CalendarDays size={20} aria-hidden />달력</button>
      </div>
      {full && <Calendar month={month} onMonth={setMonth} selected={value} onSelect={(k) => { onPick(k); setFull(false) }} info={(d) => openOf(d)} label="예약 날짜" />}
    </div>
  )
}
const i0 = (d, days) => d === days[0]

export function Step1() {
  const { draft, set } = useDraft()
  const nav = useNavigate()
  const p = program(draft.program)
  const dayInfo = (d, r) => {
    const key = ymd(d)
    if (isClosedDay(d)) return { open: false, text: '휴무' }
    const row = r || rows.find((x) => isOn(x, draft))
    const sn = row?.season ? season(row.season) : null
    if (sn && (key < sn.period.start || key > sn.period.end)) return { open: false, text: '기간 밖' }
    if (row?.night && ![5, 6].includes(d.getDay())) return { open: false, text: '금토만' }
    return { open: true, text: '가능' }
  }
  // 처음 들어오면 가장 가까운 예약 가능일을 골라 둔다
  useEffect(() => {
    if (draft.date) return
    const t = kstDate()
    for (let i = 0; i < 60; i++) {
      const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i)
      if (dayInfo(d).open) { set({ date: ymd(d) }); break }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const times = draft.date ? sessionsOf(p, draft.mode, draft.date) : []
  const cap = p?.capacity?.perSession || 20
  const ppl = draft.people.adult + draft.people.youth + draft.people.child
  const setP = (k, v) => set({ people: { ...draft.people, [k]: v }, time: draft.time })
  const pickRow = (r) => {
    const mode = r.id === 'gungame' ? (r.night ? 'night' : draft.mode && draft.mode !== 'night' ? draft.mode : 'laser') : r.id === 'winter-camp' ? 'day' : null
    const nd = { program: r.id, mode, time: null }
    if (draft.date && !dayInfo(new Date(`${draft.date}T00:00:00`), r).open) nd.date = null
    set(nd)
  }
  const ageWarn = p?.id === 'gungame' && ((draft.mode === 'paintball' && draft.people.child > 0) || (draft.mode === 'night' && draft.people.child + draft.people.youth > 0))
  const need = !draft.date ? '방문일을 골라 주세요' : !draft.time ? '회차를 골라 주세요' : ageWarn ? (draft.mode === 'paintball' ? '만 14세 미만은 레이저 배틀을 골라 주세요' : '야간 미션전은 만 19세 이상이에요') : ppl < 1 ? '인원을 1명 이상 넣어 주세요' : ''
  const sn = rows.find((x) => isOn(x, draft))?.season
  return (
    <>
      <section className="wrap rv">
        <DateStrip value={draft.date} onPick={(k) => set({ date: k, time: null })} openOf={(d) => dayInfo(d)} />
        <ul className="rlist2">
          {rows.map((r) => {
            const op = program(r.id)
            const os = r.season ? season(r.season) : null
            const st = os ? seasonStatus(os) : 'live'
            const on = isOn(r, draft)
            const dOk = draft.date ? dayInfo(new Date(`${draft.date}T00:00:00`), r) : { open: true }
            const blocked = st !== 'live' || !dOk.open
            const why = st !== 'live' ? statusText[st] : !dOk.open ? (r.night ? '금토만' : dOk.text) : ''
            return (
              <li key={r.key} className={`rrow ${on ? 'is-on' : ''} ${blocked ? 'is-off' : ''}`}>
                <button className="rrow__head" aria-expanded={on} disabled={blocked} onClick={() => pickRow(r)}>
                  <Photo slot={r.slot} className="rrow__img" ratio="1 / 1" tone={rows.indexOf(r)} />
                  <span className="rrow__txt">
                    <span className="t-card">{r.name}</span>
                    <span className="t-small">{r.meta}</span>
                  </span>
                  <span className="rrow__price"><span className="t-strong">{r.price}</span><span className={`rrow__go ${on ? 'is-on' : ''}`}>{why || (on ? '선택됨' : '선택')}</span></span>
                </button>
                {on && (
                  <div className="rrow__body">
                    {op?.modes && !r.night && (
                      <div className="rrow__line"><span className="t-strong rrow__lab">게임 모드</span>
                        <div className="chips">{op.modes.filter((m) => m.id !== 'night').map((m) => <button key={m.id} className="chip" aria-pressed={draft.mode === m.id} onClick={() => set({ mode: m.id, time: null })}>{m.name}<span className="t-caption">{m.age}</span></button>)}</div>
                      </div>
                    )}
                    {op?.options && (
                      <div className="rrow__line"><span className="t-strong rrow__lab">이용 방식</span>
                        <div className="chips">{op.options.map((o) => <button key={o.id} className="chip" aria-pressed={draft.mode === o.id} onClick={() => set({ mode: o.id })}>{o.name}<span className="t-caption">{won(o.price)}</span></button>)}</div>
                      </div>
                    )}
                    <div className="rrow__line"><span className="t-strong rrow__lab">회차</span>
                      {!draft.date ? <span className="t-small">방문일을 먼저 골라 주세요</span> : !times.length ? <span className="t-small">이 날은 열리는 회차가 없어요</span> : (
                        <div className="chips">{times.map((t) => { const left = seatsLeft(draft.date, t, cap); const full = left < Math.max(1, op?.id === 'winter-camp' ? 1 : ppl); return (
                          <button key={t} className="chip chip--time" aria-pressed={draft.time === t} disabled={full} onClick={() => set({ time: t })}>{t}<span className="t-caption">{left === 0 ? '마감' : full ? '자리 부족' : `${left}자리 남음`}</span></button>) })}</div>
                      )}
                    </div>
                    {op?.id !== 'winter-camp' && (
                      <div className="rrow__line"><span className="t-strong rrow__lab">인원</span>
                        <div className="ppl">
                          {[['adult', '성인', '19세 이상'], ['youth', '청소년', '13세부터 18세'], ['child', '어린이', '12세 이하']].map(([k, l, sub]) => (
                            <div key={k} className="ppl__cell">
                              <span className="ppl__lab"><span className="t-strong">{l}</span><span className="t-caption">{sub}</span></span>
                              <span className="ppl__ctl">
                                <button className="ctr__btn" onClick={() => setP(k, Math.max(0, draft.people[k] - 1))} disabled={draft.people[k] <= 0} aria-label={`${l} 빼기`}><Minus size={18} aria-hidden /></button>
                                <output className="t-label" aria-live="polite">{draft.people[k]}</output>
                                <button className="ctr__btn" onClick={() => setP(k, Math.min(40, draft.people[k] + 1))} disabled={draft.people[k] >= 40} aria-label={`${l} 더하기`}><Plus size={18} aria-hidden /></button>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {op?.id === 'gungame' && <p className="t-small rrow__note">20명 이상이면 단체 할인 10%가 자동으로 적용돼요.</p>}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
      <ResBar hint={need}>
        <Btn disabled={!!need} onClick={() => nav('/reserve/details')}>다음 단계</Btn>
      </ResBar>
    </>
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
  const nameOk = draft.name.trim().length > 0
  const phoneOk = /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(draft.phone.trim())
  const ok = draft.agree && nameOk && phoneOk
  const safety = p?.safety || p?.welfareRules || p?.rules || []
  return (
    <section className="wrap section rsv">
      <div className="rsv__main stack-7">
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
        <div className="stack-3">
          <h2 className="t-label">입장권</h2>
          <CheckBox checked={draft.admission} onChange={(v) => set({ admission: v })}>입장권도 함께 살게요. 성인 {won(pricing.admission.individual.adult)}, 청소년 {won(pricing.admission.individual.youth)}, 어린이 {won(pricing.admission.individual.child)}</CheckBox>
        </div>
        <div className="stack-3 rsv__wide">
          <h2 className="t-label">안전 수칙</h2>
          <ul className="rules">{safety.map((r) => <li key={r} className="t-body">{r}</li>)}</ul>
          <CheckBox checked={draft.agree} onChange={(v) => set({ agree: v })}>안전 수칙을 모두 읽고 지킬게요. (필수)</CheckBox>
          {tried && !draft.agree && <p className="field__err">안전 수칙에 동의해야 다음 단계로 갈 수 있어요.</p>}
        </div>
      </div>
      <ResBar>
        <Btn variant="deep" onClick={() => nav('/reserve')}>이전</Btn>
        <Btn onClick={() => { setTried(true); if (ok) nav('/reserve/confirm') }}>다음 단계</Btn>
      </ResBar>
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
    const nightRsv = p.id === 'gungame' && draft.mode === 'night'
    store.addReservation({ no, program: p.id, name: nightRsv ? '야간 미션전' : p.name, mode: nightRsv ? '' : (modeName || ''), date: draft.date, time: draft.time, people: t.ppl, total: t.sum, at: new Date().toISOString() })
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
