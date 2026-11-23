// Leaflet.jsx  포스터 QR로 들어오는 리플릿 화면. 리플릿 앞뒤 면을 크게 보여 주고, 가디 대원 미션지를 인쇄해 쓸 수 있게 한다.
import { Printer, Download, MapPin } from 'lucide-react'
import { Btn, Photo } from '../components/ui'
import { facility, missions, rewardTiers, withChar, zone } from '../lib/data'

const base = import.meta.env.BASE_URL
const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

export default function Leaflet() {
  return (
    <>
      <section className="lf-hero noprint">
        <div className="wrap lf-hero__in">
          <div className="stack-4">
            <p className="gd-tag t-strong">한 장 안내</p>
            <h1 className="t-display">육림랜드 리플릿</h1>
            <p className="t-label">육림랜드를 한 장에 담았어요. 미션지는 인쇄해서 도장을 모아요.</p>
            <div className="lf-hero__btns">
              <Btn onClick={() => go('leaflet')}>리플릿 보기</Btn>
              <Btn variant="deep" onClick={() => go('sheet')}>미션지 보기</Btn>
            </div>
          </div>
          <Photo slot="gadi-main" ratio="1 / 1" tone={0} className="lf-hero__img" />
        </div>
      </section>

      <section id="leaflet" className="wrap section noprint">
        <header className="gd-head"><h2 className="t-band">리플릿</h2><p className="t-body c-sub">앞면은 사계절 체험, 뒷면은 공원 지도와 이용 안내예요.</p></header>
        <div className="lf-pages">
          <figure className="lf-page">
            <a href={`${base}images/leaflet-front.jpg`} target="_blank" rel="noreferrer"><Photo slot="leaflet-front" ratio="991 / 1400" tone={1} /></a>
            <figcaption><span className="t-label">앞면</span><a className="more t-body" href={`${base}images/leaflet-front.jpg`} download="육림랜드-리플릿-앞면.jpg"><Download size={20} aria-hidden />이미지 저장</a></figcaption>
          </figure>
          <figure className="lf-page">
            <a href={`${base}images/leaflet-back.jpg`} target="_blank" rel="noreferrer"><Photo slot="leaflet-back" ratio="991 / 1400" tone={2} /></a>
            <figcaption><span className="t-label">뒷면</span><a className="more t-body" href={`${base}images/leaflet-back.jpg`} download="육림랜드-리플릿-뒷면.jpg"><Download size={20} aria-hidden />이미지 저장</a></figcaption>
          </figure>
        </div>
      </section>

      <section id="sheet" className="wrap section lf-sheet">
        <header className="gd-head noprint">
          <h2 className="t-band">가디 대원 미션지</h2>
          <p className="t-body c-sub">정문에 들어오는 순간 누구나 가디의 대원이에요. 공원 곳곳을 돌며 미션을 끝내고 도장을 모아요.</p>
          <div className="lf-sheet__btns"><Btn onClick={() => window.print()}><Printer size={20} aria-hidden />미션지 인쇄</Btn></div>
        </header>

        <div className="lf-paper">
          <div className="lf-paper__top">
            <Photo slot="gadi-stamp-color" ratio="1 / 1" tone={3} className="lf-paper__logo" />
            <div className="stack-2">
              <h2 className="t-band">가디 대원 미션지</h2>
              <p className="t-body">이름 ______________________</p>
            </div>
          </div>
          <ol className="lf-missions">
            {missions.map((m) => {
              const f = facility(m.facilityId)
              return (
                <li key={m.id} className="lf-mission">
                  <span className="lf-mission__no t-card">{m.id}</span>
                  <div className="lf-mission__txt stack-2">
                    <p className="t-label">{m.title}</p>
                    <p className="t-body">{withChar(m.task)}</p>
                    <p className="t-small c-sub"><MapPin size={16} aria-hidden /> {zone(f?.zone)?.name} {withChar(f?.name)}. 힌트: {m.hint}</p>
                  </div>
                  <span className="lf-mission__stamp" aria-label="도장 찍는 칸" />
                </li>
              )
            })}
          </ol>
          <ul className="lf-reward">
            {rewardTiers.map((t) => <li key={t.count} className="t-body"><b className="t-strong">도장 {t.count}개</b> {withChar(t.reward)}, {t.place}에서 받아요</li>)}
          </ul>
        </div>
      </section>
    </>
  )
}
