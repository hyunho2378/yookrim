// Guide.jsx  이용안내. 요금(레고랜드 이용권 화면 틀), 운영 캘린더, 오시는 길, 자주 묻는 질문.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, MapPin, Phone, Car, Bus, TriangleAlert } from 'lucide-react'
import { SubHero, CenterTitle, Teaser, CheckList, PlainHero } from '../components/blocks'
import { Accordion, Btn, Photo } from '../components/ui'
import { NoticeBand } from '../components/layout/Layout'
import Calendar from '../components/Calendar'
import { site, pricing, won, faq, kstDate, isClosedDay, notices } from '../lib/data'

function Product({ slot, tone, title, items, price, note, cta, to }) {
  return (
    <article className="prod">
      <Photo slot={slot} ratio="16 / 9" tone={tone} round />
      <div className="prod__body stack-4">
        <h3 className="t-card">{title}</h3>
        <ul className="prod__list">{items.map((t) => <li key={t} className="t-body"><Check size={20} strokeWidth={2.5} className="ico c-action" aria-hidden />{t}</li>)}</ul>
        <div className="prod__price">
          {price.map((p) => <p key={p.k}><span className="t-small c-sub">{p.k}</span><span className="t-card">{p.v}</span></p>)}
        </div>
        {note && <p className="t-small c-sub">{note}</p>}
        {cta && <Btn to={to} block>{cta}</Btn>}
      </div>
    </article>
  )
}

export function Fees() {
  const a = pricing.admission
  return (
    <>
      <NoticeBand />
      <SubHero slot="site-entrance" title="요금과 통합권" text="입장권과 놀이기구 이용권, 한 장으로 다 되는 통합권을 비교해 보세요." />
      <section className="wrap section">
        <CenterTitle title="입장권과 이용권" text={`${a.freeUnder}. ${a.discountNote}.`} />
        <div className="prods">
          <Product slot="site-entrance" tone={0} title="입장권" items={['공원 입장', '20인 이상 단체 할인']}
            price={[{ k: '성인', v: won(a.individual.adult) }, { k: '청소년', v: won(a.individual.youth) }, { k: '어린이', v: won(a.individual.child) }]}
            note={`20인 이상 단체 성인 ${won(a.group20plus.adult)}, 청소년 ${won(a.group20plus.youth)}, 어린이 ${won(a.group20plus.child)}`} />
          <Product slot="site-rides" tone={1} title="놀이기구 이용권" items={pricing.rides.options.map((o) => o.name)}
            price={pricing.rides.options.map((o) => ({ k: o.name, v: won(o.price) }))} />
          <Product slot="goods" tone={2} title="연간 회원권" items={['1년 이용', '가족 4인 묶음']}
            price={[{ k: '1인', v: won(a.annualPass.perPerson) }, { k: '가족 4인', v: won(a.annualPass.family4) }]} />
        </div>
      </section>
      <section id="bundle" className="wrap section">
        <CenterTitle title="한 장으로 다 되는 통합권" text="입장권과 놀이기구 이용권을 따로 사던 것을 한 장으로 묶었어요" />
        <div className="prods">
          {pricing.bundles.options.map((b, i) => (
            <Product key={b.id} slot={b.id} tone={i + 1} title={b.name} items={b.includes}
              price={Object.entries(b.price).map(([k, v]) => ({ k: { adult: '성인', youth: '청소년', child: '어린이', family4: '가족 4인' }[k], v: won(v) }))}
              note={b.badge} cta={i === 1 ? '총게임 예약' : undefined} to="/reserve?program=gungame" />
          ))}
        </div>
      </section>
    </>
  )
}

export function OpsCalendar() {
  const now = kstDate()
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const info = (d) => {
    if (isClosedDay(d)) return { open: false, text: '휴무' }
    const weekend = d.getDay() === 0 || d.getDay() === 6
    return { open: true, text: (weekend ? site.hours.weekend : site.hours.weekday).replace('-', ' - ') }
  }
  return (
    <>
      <PlainHero title="운영 캘린더" text={`매주 ${site.hours.closedDay} 휴무, ${site.hours.closedDayNote}. 입장 마감 ${site.hours.lastEntry}.`} />
      <section className="wrap section">
        <Calendar month={month} onMonth={setMonth} info={info} minDate="0000-00-00" />
        <p className="t-small c-sub cal__note">야간 시즌 프로그램은 예약 시간에 맞춰 입장해요.</p>
      </section>
    </>
  )
}

export function Directions() {
  const control = notices.find((n) => n.urgent)
  return (
    <>
      <NoticeBand />
      <SubHero slot="site-entrance" tone={2} title="오시는 길" text={site.address} />
      <section className="wrap section dir">
        <div className="stack-5">
          <h2 className="t-label">주소와 연락처</h2>
          <p className="t-body inline-link"><MapPin size={20} aria-hidden />{site.address}</p>
          <p className="t-body"><a className="inline-link" href={`tel:${site.phone}`}><Phone size={20} aria-hidden />{site.phone}</a></p>
          <Btn to="/map" variant="deep">공간 지도</Btn>
        </div>
        <Photo slot="map-aerial" ratio="4 / 3" tone={0} round />
      </section>
      <Teaser slot="site-entrance" tone={1} title="자가용" >
        <p className="inline-link"><Car size={20} aria-hidden />주차장이 있고 내비게이션에 육림랜드를 넣으면 돼요</p>
      </Teaser>
      <Teaser slot="site-rides" tone={3} flip title="대중교통과 셔틀">
        <p className="inline-link"><Bus size={20} aria-hidden />춘천역과 육림랜드를 잇는 순환 셔틀을 주말과 시즌 기간에 운영해요.</p>
        <CheckList items={['주말과 시즌 기간 운영', '행사 날 정류장과 우회 경로는 공지로 안내']} />
      </Teaser>
      <section id="control" className="band-red">
        <div className="wrap stack-4">
          <h2 className="t-band inline-link"><TriangleAlert size={32} aria-hidden />행사로 길이 막히는 날</h2>
          <p className="t-body">{control ? control.body : '행사가 잡히면 이곳에 통제 시간과 구간, 우회 경로를 올려 둬요.'}</p>
          <CheckList items={['통제 시간과 구간', '우회 경로와 춘천역 셔틀 정류장', '당일 예약 변경과 취소 방법']} />
          <div><Btn variant="light" to="/my">내 예약 변경</Btn></div>
        </div>
      </section>
    </>
  )
}

export function Faq() {
  const [cat, setCat] = useState(faq.categories[0])
  return (
    <>
      <PlainHero title="자주 묻는 질문" text="운영과 요금, 프로그램 질문을 모았어요." />
      <section className="wrap section">
        <div className="choices faq__tabs" role="tablist" aria-label="질문 분류">
          {faq.categories.map((c) => <button key={c} role="tab" aria-selected={cat === c} className="choice" onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <Accordion key={cat} items={faq.items.filter((f) => f.cat === cat)} defaultOpen={0} />
        <p className="sec-more t-body c-sub">원하는 답이 없으면 대표 전화 <a className="c-primary" href={`tel:${site.phone}`}>{site.phone}</a>로 물어봐 주세요.</p>
      </section>
    </>
  )
}
