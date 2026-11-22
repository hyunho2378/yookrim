// Home.jsx  홈 화면 순서: 영상 첫 화면, 대표 카테고리, 이번 시즌, 전체 콘텐츠 카드, 방문자별 안내, 통합권, 가디,
// 방문 전 확인, 방문 전 질문, 길찾기와 전화와 예약. 값은 data 폴더에서 읽는다.
import { Teaser, CheckList, TileGrid, PackageCards } from '../components/blocks'
import { StageHero, CategoryTiles, ContentGrid, AudienceGrid, VisitInfo, VisitQA, FinalCta } from '../components/blocks/plan'
import { Ticket, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { seasons, seasonStatus, statusText, periodText, dday, currentSeason, withChar, pricing, won } from '../lib/data'
import { items } from '../lib/plan'

export default function Home() {
  const now = currentSeason()
  const st = seasonStatus(now)
  const ordered = [...seasons].sort((a, b) => {
    const rank = (s) => ({ live: 0, soon: 1, ended: 2 }[seasonStatus(s)])
    return rank(a) - rank(b) || a.period.start.localeCompare(b.period.start)
  })
  const lead = st === 'live' ? `${now.season} 시즌 ${periodText(now.period)}` : `${now.season} 시즌 D-${dday(now.period.start)}`

  const tiles = ordered.map((s) => {
    const x = seasonStatus(s)
    return { slot: `poster-${s.id}`, title: `${s.season} ${s.title}`, meta: periodText(s.period), to: `/play/season/${s.id}`, status: x === 'soon' ? `${statusText.soon} D-${dday(s.period.start)}` : statusText[x] }
  })

  const bundles = pricing.bundles.options.map((b) => ({
    slot: b.id, title: b.name, to: '/guide#bundle',
    lines: [
      { icon: Ticket, text: `포함 ${b.includes.join(', ')}` },
      { icon: Wallet, text: b.price.adult ? `성인 ${won(b.price.adult)}` : `4인 ${won(b.price.family4)}` }
    ]
  }))

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
      <TileGrid title="사계절 일정" items={tiles} more={{ to: '/play/season', label: '시즌 이벤트 전체' }} />

      <section id="list" className="wrap section">
        <div className="stack-3 ctiles__head">
          <h2 className="t-band c-primary">전체 놀이</h2>
        </div>
        <ContentGrid list={items} />
        <p className="sec-more"><Link to="/play" className="more t-body">어트랙션 전체 보기</Link></p>
      </section>

      <AudienceGrid title="함께 오는 사람별 코스" />

      <PackageCards title="통합권" items={bundles} more={{ to: '/guide', label: '요금 전체 안내' }} />

      <Teaser slot="character-main" tone={3} title="숲속 친구, 가디" cta="가디 만나기" to="/about/characters">
        <p>육림랜드를 지키는 꼬마 수호대장이에요. 숲은 내가 지킬게, 너는 신나게 놀아!</p>
        <CheckList items={['낮에는 순찰하는 수호대장', '밤에는 총게임을 지휘하는 교관', '리플릿과 포스터에서 만나요']} />
      </Teaser>

      <VisitInfo />
      <VisitQA />
      <FinalCta />
    </>
  )
}
