// Character.jsx  숲속 친구, 가디. 첫 화면에 가디와 핵심 정보, 이어서 낮과 밤, 사계절, 이야기 순서로 짧게 싣는다.
import { Link } from 'react-router-dom'
import { Btn, Photo } from '../components/ui'

const facts = [
  ['이름', '가디, 지킨다는 뜻의 Guard에서 유래'],
  ['맡은 일', '육림랜드 꼬마 수호대장, 메인 캐릭터'],
  ['모델', '육림랜드에 사는 독수리(천연기념물)'],
  ['잘하는 일', '높은 곳 순찰, 길 잃은 아이 찾기, 바람 타기']
]
const scenes = [
  ['spring', '봄', '지도를 들고 보물을 찾는 가디', '/play/season/spring'],
  ['summer', '여름', '손전등을 들고 좀비 숲을 도는 가디', '/play/season/summer'],
  ['autumn', '가을', '벙커 뒤에서 깃발을 지키는 가디', '/play/season/autumn'],
  ['winter', '겨울', '모닥불 앞에서 쉬어 가는 가디', '/play/season/winter']
]

export default function Character() {
  return (
    <>
      <section className="cg-hero wrap">
        <div className="cg-hero__copy">
          <p className="cg-tag t-strong">숲속 친구</p>
          <h1 className="cg-name">가디</h1>
          <p className="t-card cg-role">육림랜드를 지키는 꼬마 수호대장</p>
          <p className="t-body">천연기념물 독수리를 모델로 한 육림랜드의 메인 캐릭터예요. 낮에는 공원을 순찰하고, 밤에는 총게임을 지휘해요.</p>
          <dl className="cg-facts">
            {facts.map(([k, v]) => <div key={k}><dt className="t-small">{k}</dt><dd className="t-body">{v}</dd></div>)}
          </dl>
          <div className="cg-btns"><Btn to="/leaflet">리플릿 보기</Btn><Btn variant="deep" to="/play/gungame">총게임 안내</Btn></div>
        </div>
        <div className="gd-art"><img src={`${import.meta.env.BASE_URL}images/gadi/cutout.png`} alt="가디" width="574" height="748" /></div>
      </section>

      <section className="wrap cg-sec">
        <h2 className="t-band">낮과 밤의 가디</h2>
        <div className="cg-duo">
          <article className="cg-card">
            <Photo slot="gadi-day" ratio="1 / 1" tone={0} className="cg-card__img" />
            <div className="cg-card__body">
              <p className="t-small">개장 시간</p>
              <h3 className="t-card">낮의 수호대장</h3>
              <p className="t-body">순찰, 안전 안내, 길 잃은 아이 찾기</p>
              <p className="t-strong">"이상 무!"</p>
            </div>
          </article>
          <article className="cg-card">
            <Photo slot="gadi-night" ratio="1 / 1" tone={0} className="cg-card__img" />
            <div className="cg-card__body">
              <p className="t-small">금요일과 토요일 밤</p>
              <h3 className="t-card">밤의 교관</h3>
              <p className="t-body">숲속 총게임 리그 지휘, 야간 미션전 심판</p>
              <p className="t-strong">"작전 개시!"</p>
            </div>
          </article>
        </div>
      </section>

      <section className="wrap cg-sec">
        <h2 className="t-band">사계절의 가디</h2>
        <ul className="cg-scenes">
          {scenes.map(([id, s, t, to], i) => (
            <li key={id}><Link to={to} className="cg-scene"><Photo slot={`gadi-scene-${id}`} ratio="16 / 10" tone={i} /><span className="t-small">{s}</span><span className="t-strong">{t}</span></Link></li>
          ))}
        </ul>
      </section>

      <section className="wrap cg-sec">
        <h2 className="t-band">가디 이야기</h2>
        <div className="cg-story">
          <Photo slot="gadi-badge-color" ratio="1 / 1" tone={2} className="cg-story__img" />
          <div className="cg-story__text">
            <p className="t-body">추운 겨울, 바람을 타고 먼 길을 날아온 작은 독수리가 소나무 숲에 둘러싸인 놀이공원 육림랜드에 내려앉았어요. 아이들 웃음소리를 지켜 주기로 한 독수리에게 아이들이 육림랜드 배지를 달아 주었고, 그 이름이 가디예요.</p>
            <p className="t-body">초록 베레모는 스스로 대장이 되겠다고 쓴 모자이고, 배지는 아이들이 달아 준 선물이에요. 육림랜드 로고의 林은 두 아이가 손을 잡은 모양이에요.</p>
          </div>
        </div>
      </section>
    </>
  )
}
