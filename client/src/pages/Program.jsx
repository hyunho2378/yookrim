// Program.jsx  총게임, 동물 교감 카페, 시즌 이벤트. 레고랜드 시즌 이벤트 화면 틀(큰 사진 위 색 상자, 사진과 글 띠)을 쓴다.
import { Fragment, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { EventHero, Teaser, CheckList, CenterTitle, TileGrid } from '../components/blocks'
import { Accordion, Btn, useToast } from '../components/ui'
import { program, season, seasons, seasonStatus, statusText, periodText, dday, won, faq, withChar, priceFrom } from '../lib/data'
import { useStore } from '../lib/store'

function Steps({ items }) {
  return (
    <ol className="steps">
      {items.map((t, i) => (
        <li key={t}><span className="steps__no t-band c-primary">{String(i + 1).padStart(2, '0')}</span><span className="t-strong">{t}</span></li>
      ))}
    </ol>
  )
}

function Faq({ cat }) {
  const items = faq.items.filter((f) => f.cat === cat)
  if (!items.length) return null
  return (
    <section className="wrap section">
      <h2 className="t-label tiles__title">자주 묻는 질문</h2>
      <Accordion items={items} />
      <p className="sec-more"><Link to="/guide/faq" className="more t-body">자주 묻는 질문 전체</Link></p>
    </section>
  )
}

export function Gungame() {
  const p = program('gungame')
  const autumn = season('autumn')
  return (
    <>
      <EventHero slot="gungame-zone-overview" tag={`가을 시즌 ${periodText(autumn.period)}`} title={p.name} text="바이킹 뒤에 숨고 회전목마를 돌아 깃발을 뺏어요." cta="총게임 예약" to="/reserve?program=gungame" />
      <section className="wrap section">
        <CenterTitle title="놀이공원 전체가 게임 맵" text="팀을 나눠 미션 카드를 받고 장애물 사이에서 승부를 가려요" />
      </section>
      {p.modes.map((m, i) => (
        <Teaser key={m.id} id={`mode-${m.id}`} slot={i === 0 ? 'gungame-obstacles' : i === 1 ? 'gungame-zone-overview' : 'zombie-night'} tone={i} flip={i % 2 === 1} title={m.name} cta={`${m.name} 예약`} to={`/reserve?program=gungame&mode=${m.id}`}>
          <p>{m.desc}</p>
          <dl className="kv">
            <dt>연령</dt><dd>{m.age}</dd>
            <dt>소요 시간</dt><dd>{m.duration}</dd>
            <dt>요금</dt><dd>1인 {won(p.price[m.id])}</dd>
          </dl>
        </Teaser>
      ))}
      <section className="wrap section">
        <h2 className="t-label tiles__title">진행 순서</h2>
        <Steps items={p.steps} />
      </section>
      <section className="wrap section">
        <h2 className="t-label tiles__title">이용 정보</h2>
        <dl className="kv">
          <dt>대상</dt><dd>{p.target.join(', ')}</dd>
          <dt>인원</dt><dd>회차당 최대 {p.capacity.perSession}명, 최소 {p.capacity.min}명</dd>
          <dt>주간 회차</dt><dd>{p.sessions.join(', ')}</dd>
          <dt>야간 회차</dt><dd>금요일과 토요일 {p.nightSessions.join(', ')}</dd>
          <dt>장소</dt><dd><Link to="/map?focus=gungame-base" className="inline-link"><MapPin size={20} aria-hidden />총게임 집결지</Link></dd>
          <dt>비 오는 날</dt><dd>{p.rainPolicy}</dd>
        </dl>
      </section>
      <Teaser id="safety" slot="gungame-obstacles" tone={3} title="안전 수칙" cta="지도에서 필드 위치" to="/map?focus=gungame-base">
        <p>경기 전 10분 안전 교육을 받고 모든 모드에 같은 수칙이 적용돼요</p>
        <CheckList items={p.safety} />
      </Teaser>
      <section id="group" className="band-blue">
        <div className="wrap band-blue__in">
          <div className="stack-3">
            <h2 className="t-band">단체 예약</h2>
            <p className="t-body">20명 이상 단체는 {p.price.groupDiscount.replace('20인 이상 ', '')} 할인돼요. MT와 워크숍, 생일 파티도 열 수 있어요.</p>
          </div>
          <Btn variant="light" to="/reserve?program=gungame&group=1">단체 예약</Btn>
        </div>
      </section>
      <Faq cat="총게임" />
    </>
  )
}

export function Cafe() {
  const p = program('animal-cafe')
  return (
    <>
      <EventHero slot="cafe-interior" tone={1} tag="상시 운영" title={p.name} text="날씨가 어떻든 작은 친구들은 여기서 기다려요." cta="카페 회차 예약" to="/reserve?program=animal-cafe" />
      <section className="wrap section">
        <CenterTitle title="작은 동물과 가까이" text={p.summary} />
      </section>
      <TileGrid title="카페의 동물 친구들" items={p.animals.map((a, i) => ({ slot: i === 0 ? 'cafe-meerkat' : 'cafe-guineapig', title: a.name, meta: '프로필 카드는 카페 벽에서 확인', to: '/mission/4' }))} />
      <Teaser slot="cafe-interior" tone={2} title="동물 친구들과의 약속" cta="카페 회차 예약" to="/reserve?program=animal-cafe">
        <p>회차 사이 20분은 동물이 쉬는 시간이에요</p>
        <CheckList items={p.welfareRules} />
      </Teaser>
      <section className="wrap section">
        <h2 className="t-label tiles__title">이용 정보</h2>
        <dl className="kv">
          <dt>회차</dt><dd>{p.sessions.join(', ')}</dd>
          <dt>정원</dt><dd>회차당 {p.capacity.perSession}명</dd>
          <dt>요금</dt><dd>1인 {won(p.price.perPerson)}, {p.price.includes} 포함</dd>
          <dt>위치</dt><dd><Link to="/map?focus=animal-cafe" className="inline-link"><MapPin size={20} aria-hidden />동물 교감 카페</Link></dd>
        </dl>
      </section>
      <Faq cat="동물" />
    </>
  )
}

function SeasonCta({ s, big }) {
  const st = seasonStatus(s)
  const store = useStore()
  const [toast, say] = useToast()
  const p = program(s.programIds[0])
  if (st === 'live') return <Btn to={`/reserve?program=${p?.id || 'gungame'}`}>{s.season} 시즌 예약</Btn>
  if (st === 'ended') return <p className="t-strong">올해 시즌은 끝났고 내년에 다시 열려요</p>
  const on = !!store.alerts[s.id]
  return (
    <div className="stack-3">
      <p className={big ? 't-band c-action' : 't-label c-action'}>D-{dday(s.period.start)}</p>
      <Btn variant={on ? 'deep' : undefined} aria-pressed={on} onClick={() => { store.toggleAlert(s.id); say(on ? '알림 신청을 취소했어요.' : '오픈하면 가장 먼저 알려 드릴게요.') }}>{on ? '알림 신청 완료' : '오픈 알림 신청'}</Btn>
      {toast}
    </div>
  )
}

export function SeasonList() {
  const [sel, setSel] = useState(() => (seasons.find((s) => seasonStatus(s) === 'live') || seasons[0]).id)
  const s = season(sel)
  const st = seasonStatus(s)
  return (
    <>
      <EventHero slot={`poster-${s.id}`} tone={2} tag={statusText[st]} title="계절마다 새로 열리는 육림랜드" text="봄 보물찾기와 여름 좀비 숲, 가을 총게임 리그, 겨울 캠핑 데이가 이어져요." />
      <section className="wrap section">
        <div className="choices season-tabs" role="tablist" aria-label="계절">
          {seasons.map((x) => (
            <button key={x.id} role="tab" aria-selected={sel === x.id} className="choice" onClick={() => setSel(x.id)}>
              {x.season} <span className="t-small">{statusText[seasonStatus(x)]}</span>
            </button>
          ))}
        </div>
      </section>
      <Teaser slot={`poster-${s.id}`} tone={1} title={`${s.season} ${s.title}`} cta="시즌 상세 안내" to={`/play/season/${s.id}`}>
        <p>{withChar(s.subtitle)}</p>
        <dl className="kv">
          <dt>기간</dt><dd>{periodText(s.period)}</dd>
          <dt>시간</dt><dd>{s.time}</dd>
          <dt>대상</dt><dd>{s.target.join(', ')}</dd>
          <dt>{s.intensity.label}</dt><dd>{s.intensity.levels.join(', ')}</dd>
        </dl>
        <SeasonCta s={s} />
      </Teaser>
      <TileGrid title="사계절 일정" items={seasons.map((x) => ({ slot: `poster-${x.id}`, title: `${x.season} ${x.title}`, meta: periodText(x.period), to: `/play/season/${x.id}`, status: statusText[seasonStatus(x)] }))} />
    </>
  )
}

const intensityGuide = {
  summer: '무서운 장면이 낯설면 1단계부터, 포기 신호를 보내면 언제든 나갈 수 있어요',
  autumn: '처음이라면 아프지 않은 레이저, 더 거친 승부는 보호복을 입는 페인트볼이에요',
  spring: '새싹 코스는 지도에 그림 힌트가 있고, 나무 코스는 글 힌트만 있어요.',
  winter: '당일 캠핑은 저녁 9시에 끝나고, 1박 숙박은 다음 날 오전 11시에 나가요.'
}

export function SeasonDetail() {
  const { id } = useParams()
  const s = season(id)
  const [lv, setLv] = useState(0)
  if (!s) return <Navigate to="/play/season" replace />
  const p = program(s.programIds[0])
  const st = seasonStatus(s)
  const from = priceFrom(p)
  return (
    <>
      <EventHero slot={`poster-${s.id}`} tone={s.id === 'summer' ? 3 : 0} tag={`${statusText[st]} ${periodText(s.period)}`} title={`${s.season} ${s.title}`} text={withChar(s.subtitle)} />
      <section className="wrap section season-detail">
        <div className="stack-5">
          <h2 className="t-label">{s.intensity.label}</h2>
          <div className="choices" role="radiogroup" aria-label={s.intensity.label}>
            {s.intensity.levels.map((l, i) => <button key={l} role="radio" aria-checked={lv === i} className="choice" onClick={() => setLv(i)}>{l}</button>)}
          </div>
          <p className="t-body c-sub">{intensityGuide[s.id]}</p>
        </div>
        <div className="stack-5">
          <dl className="kv">
            <dt>기간</dt><dd>{periodText(s.period)}</dd>
            <dt>시간</dt><dd>{s.time}</dd>
            <dt>대상</dt><dd>{s.target.join(', ')}</dd>
            {from && <><dt>요금</dt><dd>{won(from)}부터</dd></>}
          </dl>
          <SeasonCta s={s} big />
        </div>
      </section>
      {p && (
        <Teaser slot={s.id === 'winter' ? 'camp-winter' : s.id === 'summer' ? 'zombie-night' : s.id === 'autumn' ? 'gungame-obstacles' : 'missioncard'} tone={2} title={p.name} cta={p.id === 'gungame' ? '총게임 상세 안내' : undefined} to="/play/gungame">
          <p>{p.summary}</p>
          {p.safety && <CheckList items={p.safety} />}
          {p.rules && <CheckList items={p.rules} />}
          {p.options && <dl className="kv">{p.options.map((o) => <Fragment key={o.id}><dt>{o.name}</dt><dd>{o.unit} {won(o.price)}</dd></Fragment>)}</dl>}
        </Teaser>
      )}
    </>
  )
}
