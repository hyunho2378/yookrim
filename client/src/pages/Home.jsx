// Home.jsx  홈 화면 순서: 영상 첫 화면, 놀이 종류, 이번 시즌, 가디, 방문 안내 띠. 나머지는 각 메뉴 화면에 있다.
import { Teaser, CheckList } from '../components/blocks'
import { StageHero, CategoryTiles, InfoBand } from '../components/blocks/plan'
import { seasonStatus, periodText, dday, currentSeason, withChar } from '../lib/data'

export default function Home() {
  const now = currentSeason()
  const st = seasonStatus(now)
  const lead = st === 'live' ? `${now.season} 시즌 ${periodText(now.period)}` : `${now.season} 시즌 D-${dday(now.period.start)}`
  return (
    <>
      <StageHero
        lead={lead}
        title={['new!! 육림랜드', '50년 숲속 놀이공원에 새 놀이가 생겼어요']}
        primary={{ label: '예약하기', to: '/reserve' }}
        secondary={{ label: '이번 시즌 보기', to: '/play/season' }}
      />
      <CategoryTiles title="놀이 종류" text="종류별로 둘러보세요." />
      <Teaser slot={`poster-${now.id}`} tone={0} title={`${now.season} ${now.title}`} cta="시즌 상세 안내" to={`/play/season/${now.id}`}>
        <p>{withChar(now.subtitle)}</p>
        <p><b>기간</b> {periodText(now.period)}</p>
        <p><b>대상</b> {now.target.join(', ')}</p>
        <p><b>{now.intensity.label}</b> {now.intensity.levels.join(', ')}</p>
        <p><b>시간</b> {now.time}</p>
      </Teaser>
      <Teaser slot="character-main" tone={3} flip title="숲속 친구, 가디" cta="가디 만나기" to="/about/characters">
        <p>육림랜드를 지키는 꼬마 수호대장이에요. 숲은 내가 지킬게, 너는 신나게 놀아!</p>
        <CheckList items={['낮에는 순찰하는 수호대장', '밤에는 총게임을 지휘하는 교관']} />
      </Teaser>
      <InfoBand />
    </>
  )
}
