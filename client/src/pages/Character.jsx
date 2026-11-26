// Character.jsx  숲속 친구, 가디. 가디를 만나고 함께 즐기는 방법을 먼저 보여 주고, 사계절 프로그램과 짧은 소개를 잇는다.
import { Link } from 'react-router-dom'
import { Stamp, Camera, Gift, CalendarDays, ArrowRight } from 'lucide-react'
import { Btn, Photo } from '../components/ui'

const BASE = import.meta.env.BASE_URL
const ways = [
  { icon: Stamp, title: '미션 스탬프 챌린지', text: '도장 다섯 개를 모으면 받는 굿즈', to: '/leaflet', img: 'goods/mission-sheet.jpg' },
  { icon: Camera, title: '가디 포토존', text: '정문 광장에서 찍는 기념 사진', to: '/map?focus=start', slot: 'zone-start' },
  { icon: Gift, title: '가디 굿즈', text: 'L자 파일, 마우스패드, 텀블러', to: '/leaflet#goods', img: 'goods/mousepad.jpg' },
  { icon: CalendarDays, title: '사계절 프로그램', text: '계절마다 새로 열리는 체험', to: '/play/season', slot: 'poster-autumn' }
]
const scenes = [
  ['spring', '봄', '숲속 보물찾기', '/play/season/spring'],
  ['summer', '여름', '한밤의 좀비 숲', '/play/season/summer'],
  ['autumn', '가을', '숲속 총게임 리그', '/play/season/autumn'],
  ['winter', '겨울', '소나무 숲 1일 캠핑 데이', '/play/season/winter']
]

export default function Character() {
  return (
    <>
      <section className="cg-hero wrap">
        <div className="cg-hero__copy">
          <p className="cg-tag t-strong">숲속 친구</p>
          <h1 className="cg-name">가디</h1>
          <p className="t-card cg-role">육림랜드를 지키는 꼬마 수호대장</p>
          <p className="t-body">낮에는 공원을 순찰하고, 밤에는 총게임을 지휘해요. 정문 광장과 미션 스탬프 챌린지, 계절 프로그램에서 가디를 만날 수 있어요.</p>
          <p className="cg-says"><span className="t-strong">"이상 무!"</span><span className="t-strong">"작전 개시!"</span></p>
          <div className="cg-btns"><Btn to="/leaflet">미션 스탬프 시작</Btn><Btn variant="deep" to="/map?focus=start">포토존 위치</Btn></div>
        </div>
        <div className="gd-art"><img src={`${BASE}images/gadi/cutout.png`} alt="가디" width="574" height="748" /></div>
      </section>

      <section className="wrap cg-sec">
        <h2 className="t-band">가디와 함께 즐기기</h2>
        <ul className="cg-ways">
          {ways.map((w, i) => (
            <li key={w.title}>
              <Link to={w.to} className="cg-way">
                {w.img ? <div className="cg-way__img"><img src={`${BASE}images/${w.img}`} alt={w.title} /></div> : <Photo slot={w.slot} ratio="4 / 3" tone={i} alt={w.title} className="cg-way__img" />}
                <span className="cg-way__txt"><w.icon size={22} aria-hidden /><span className="t-card">{w.title}</span></span>
                <span className="t-body cg-way__sub">{w.text}</span>
                <span className="cg-way__go t-strong">바로가기<ArrowRight size={18} aria-hidden /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap cg-sec">
        <h2 className="t-band">사계절의 가디</h2>
        <ul className="cg-scenes">
          {scenes.map(([id, s, t, to], i) => (
            <li key={id}><Link to={to} className="cg-scene"><Photo slot={`gadi-scene-${id}`} ratio="16 / 10" tone={i} alt={t} /><span className="t-small">{s}</span><span className="t-strong">{t}</span></Link></li>
          ))}
        </ul>
      </section>

      <section className="wrap cg-sec">
        <h2 className="t-band">가디 소개</h2>
        <div className="cg-about">
          <p className="t-body">천연기념물 독수리를 모델로 한 육림랜드의 메인 캐릭터예요. 이름은 지킨다는 뜻의 Guard에서 왔고, 초록 베레모에 단 배지는 육림랜드 로고예요. 로고의 林은 두 아이가 손을 잡은 모양이에요.</p>
          <p className="t-body">높은 곳 순찰과 길 잃은 아이 찾기를 잘하고, 아이들 웃음소리와 따뜻한 바람을 좋아해요.</p>
        </div>
      </section>
    </>
  )
}
