// Mission.jsx  캐릭터 미션. 스탬프 판, 미션 목록, QR 인증 결과, 보상 받기.
// QR 은 /mission/1?code=YOOKRIM-1 주소를 담는다. 휴대폰 카메라로 찍으면 이 화면이 열리고 바로 인증된다.
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { MapPin, Gauge, Check, QrCode, Gift } from 'lucide-react'
import { EventHero, Teaser, CheckList, CenterTitle } from '../components/blocks'
import { Btn, Dialog, Photo } from '../components/ui'
import { List } from './Play'
import { missions, mission, rewardTiers, facility, withChar, charName, site } from '../lib/data'
import { useStore } from '../lib/store'

function useProgress() {
  const { missions: done } = useStore()
  const n = Object.keys(done).length
  const next = rewardTiers.find((t) => t.count > n)
  const reached = rewardTiers.filter((t) => t.count <= n)
  return { done, n, next, reached }
}

function StampBoard() {
  const { done, n, next } = useProgress()
  return (
    <div className="stamps">
      <div className="stamps__head">
        <p className="t-label">스탬프 {n}/{missions.length}</p>
        <p className="t-body c-sub">{next ? `다음 선물까지 ${next.count - n}개` : '모든 선물을 받을 수 있어요.'}</p>
      </div>
      <div className="stamps__bar" aria-hidden><span style={{ transform: `scaleX(${n / missions.length})` }} /></div>
      <ul className="stamps__grid">
        {missions.map((m) => (
          <li key={m.id}>
            <Link to={`/mission/${m.id}`} className={`stamp ${done[m.id] ? 'is-done' : ''}`} aria-label={`${m.title} ${done[m.id] ? '완료' : '도전 전'}`}>
              <span className="t-strong">{m.id}</span>
              {done[m.id] ? <Check size={32} strokeWidth={3} aria-hidden /> : <span className="t-small">{m.title}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 인증 결과. 성공, 잘못된 QR, 이미 받은 스탬프, 선물 단계 달성
function ResultDialog({ result, onClose }) {
  const nav = useNavigate()
  if (!result) return null
  const { kind, m, tier } = result
  const lines = {
    ok: { title: '스탬프 쾅!', say: withChar(m?.successLine || '') },
    wrong: { title: '다른 곳 같아', say: `${charName()}: 음, 여기는 다른 곳 같아. 힌트를 다시 볼까?` },
    already: { title: '이미 받은 스탬프', say: '이 스탬프는 벌써 받았어! 다른 미션을 찾아보자.' },
    reward: { title: '선물을 받을 수 있어요', say: `스탬프 ${tier?.count}개를 모았어요. ${tier?.place}에서 이 화면을 보여 주세요.` }
  }[kind]
  return (
    <Dialog open onClose={onClose} title={lines.title}>
      <div className="result stack-4">
        <div className={`result__stamp ${kind === 'ok' || kind === 'reward' ? 'is-on' : ''}`} aria-hidden>{kind === 'reward' ? <Gift size={48} /> : kind === 'ok' ? <Check size={48} strokeWidth={3} /> : <QrCode size={48} />}</div>
        <h2 className="t-card">{lines.title}</h2>
        <p className="t-body">{lines.say}</p>
        {kind === 'reward' && <p className="t-label c-primary">{withChar(tier.reward)}</p>}
        <div className="stack-2">
          {kind === 'wrong' && m && <Btn block onClick={onClose}>힌트 다시 확인</Btn>}
          {kind === 'reward' && <Btn block onClick={() => { onClose(); nav('/mission/reward') }}>보상 받는 곳</Btn>}
          {(kind === 'ok' || kind === 'already') && <Btn block onClick={() => { onClose(); nav('/mission#cards') }}>다른 미션 찾기</Btn>}
        </div>
      </div>
    </Dialog>
  )
}

// 인증 창. 카메라 대신 미션 코드를 넣거나 이 자리에서 인증한다
function VerifyDialog({ m, open, onClose, onResult }) {
  const [code, setCode] = useState('')
  const store = useStore()
  const done = store.missions
  const stamp = store.stamp
  const n = Object.keys(done).length
  const check = (value) => {
    const target = m || missions.find((x) => x.qrCode === value.trim().toUpperCase())
    if (!target || (m && value.trim().toUpperCase() !== m.qrCode)) return onResult({ kind: 'wrong', m })
    if (done[target.id]) return onResult({ kind: 'already', m: target })
    stamp(target.id)
    const tier = rewardTiers.find((t) => t.count === n + 1)
    onResult(tier ? { kind: 'reward', m: target, tier } : { kind: 'ok', m: target })
  }
  return (
    <Dialog open={open} onClose={onClose} title="QR 인증">
      <form className="stack-4" onSubmit={(e) => { e.preventDefault(); check(code) }}>
        <h2 className="t-card">QR 인증</h2>
        <p className="t-body">휴대폰 카메라로 현장 QR을 찍으면 이 화면이 열리고 바로 인증돼요. 카메라를 쓰기 어려우면 QR 아래 코드를 넣어 주세요.</p>
        <div className="field">
          <label htmlFor="qr-code">미션 코드</label>
          <input id="qr-code" className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="코드 입력" autoCapitalize="characters" />
        </div>
        <Btn block type="submit">코드 인증</Btn>
        {m && <Btn block variant="deep" onClick={() => check(m.qrCode)}>여기서 인증</Btn>}
      </form>
    </Dialog>
  )
}

export function MissionHub() {
  const [verify, setVerify] = useState(false)
  const [result, setResult] = useState(null)
  const { done } = useProgress()
  const items = missions.map((m) => {
    const f = facility(m.facilityId)
    return { key: m.id, to: `/mission/${m.id}`, slot: `mission-${m.id}`, title: m.title, text: withChar(m.task), meta: [{ icon: Gauge, text: `난이도 ${m.difficulty}` }, { icon: MapPin, text: withChar(f?.name || '') }, { icon: Check, text: done[m.id] ? '완료' : '도전 전' }] }
  })
  return (
    <>
      <EventHero slot="poster-spring" tone={3} tag={`${charName()}의 인사`} title="숲속 미션" text={withChar(site.character.greeting)} cta="QR 찍고 스탬프 받기" onCta={() => setVerify(true)} />
      <section className="wrap section"><StampBoard /></section>
      <section id="cards" className="wrap section">
        <h2 className="t-label tiles__title">미션 카드</h2>
        <List items={items} />
      </section>
      <Teaser slot="goods" tone={1} title="스탬프를 모으면 받는 선물" cta="보상 받는 곳" to="/mission/reward">
        <CheckList items={rewardTiers.map((t) => `스탬프 ${t.count}개 ${withChar(t.reward)}`)} />
        <p className="c-sub">미션 기록은 이 휴대폰에만 저장돼요.</p>
      </Teaser>
      <VerifyDialog open={verify} onClose={() => setVerify(false)} onResult={(r) => { setVerify(false); setResult(r) }} />
      <ResultDialog result={result} onClose={() => setResult(null)} />
    </>
  )
}

export function MissionDetail() {
  const { id } = useParams()
  const [sp, setSp] = useSearchParams()
  const m = mission(id)
  const store = useStore()
  const [verify, setVerify] = useState(false)
  const [result, setResult] = useState(null)
  const [hint, setHint] = useState(false)
  // QR 주소로 들어오면 저장소가 준비된 뒤 한 번 인증한다
  useEffect(() => {
    const code = sp.get('code')
    if (!m || !code || !store.ready) return
    setSp({}, { replace: true })
    if (code.toUpperCase() !== m.qrCode) { setResult({ kind: 'wrong', m }); return }
    if (store.missions[m.id]) { setResult({ kind: 'already', m }); return }
    const n = Object.keys(store.missions).length
    store.stamp(m.id)
    const tier = rewardTiers.find((t) => t.count === n + 1)
    setResult(tier ? { kind: 'reward', m, tier } : { kind: 'ok', m })
  }, [m, sp, store.ready]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <Navigate to="/mission" replace />
  const f = facility(m.facilityId)
  return (
    <>
      <section className="wrap section mdetail">
        <Photo slot={`mission-${m.id}`} ratio="3 / 4" tone={2} round />
        <div className="stack-5">
          <p className="t-label c-primary">난이도 {m.difficulty}</p>
          <h1 className="t-band">{m.title}</h1>
          <p className="t-label">{withChar(m.task)}</p>
          <div className="stack-3">
            <button className="choice" aria-expanded={hint} onClick={() => setHint(!hint)}>{hint ? '힌트 닫기' : '힌트 열기'}</button>
            {hint && <p className="t-body hint">{charName()}: {withChar(m.hint)}</p>}
          </div>
          <p className="t-body"><Link to={`/map?focus=${m.facilityId}`} className="inline-link"><MapPin size={20} aria-hidden />{withChar(f?.name)} 위치</Link></p>
          <p className="t-strong">{store.missions[m.id] ? '스탬프를 받았어요.' : '아직 스탬프를 받지 않았어요.'}</p>
          <div className="stack-2 mdetail__btns">
            <Btn onClick={() => setVerify(true)}>QR 찍고 스탬프 받기</Btn>
            <Btn variant="deep" to="/mission">미션 목록</Btn>
          </div>
        </div>
      </section>
      <VerifyDialog m={m} open={verify} onClose={() => setVerify(false)} onResult={(r) => { setVerify(false); setResult(r) }} />
      <ResultDialog result={result} onClose={() => setResult(null)} />
    </>
  )
}

export function Reward() {
  const { n, reached } = useProgress()
  const code = useMemo(() => `YR-${String(n).padStart(2, '0')}${(n * 7919 % 9000 + 1000)}`, [n])
  return (
    <>
      <EventHero slot="goods" tone={1} tag={`스탬프 ${n}/${missions.length}`} title="보상 받기" text="모은 스탬프 수만큼 안내소에서 선물을 받아요." />
      <section className="wrap section">
        <CenterTitle title={reached.length ? '받을 수 있는 선물' : '스탬프 3개부터 선물을 받아요'} text={reached.length ? `안내소에서 교환 코드 ${code}를 보여 주세요.` : '미션 카드를 골라 첫 스탬프부터 모아 보세요.'} />
        <ul className="rewards">
          {rewardTiers.map((t) => (
            <li key={t.count} className={n >= t.count ? 'is-on' : ''}>
              <Photo slot={`reward-${rewardTiers.indexOf(t) + 1}`} ratio="1 / 1" tone={t.count} round />
              <p className="t-label">스탬프 {t.count}개</p>
              <p className="t-body">{withChar(t.reward)}</p>
              <p className="t-strong">{n >= t.count ? `${t.place}에서 받을 수 있어요` : `${t.count - n}개 더 모으면 받아요`}</p>
            </li>
          ))}
        </ul>
        <div className="sec-more center"><Btn to="/mission">미션 목록</Btn></div>
      </section>
    </>
  )
}
