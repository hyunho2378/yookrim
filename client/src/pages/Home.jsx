// Home.jsx  레고랜드 홈의 블록 순서 그대로: 사진 넘김, 바로가기 4칸, 파란 안내 띠, 4열 대표, 사진 띠 3개,
// 시즌 타일, 이야기 띠, 통합권 3열, 모자이크. 이용 후기와 SNS 사진 줄은 아직 우리 자료가 없어 넣지 않았다.
import { Crosshair, CalendarRange, PawPrint, CalendarClock, Ticket, CalendarX, Map, Wallet } from 'lucide-react'
import { Hero, QuickLinks, UspBand, PromoCols, Teaser, CheckList, TileGrid, PackageCards, Mosaic } from '../components/blocks'
import { NoticeBand } from '../components/layout/Layout'
import { program, seasons, seasonStatus, statusText, periodText, dday, currentSeason, rewardTiers, withChar, charName, pricing, won } from '../lib/data'

export default function Home() {
  const gun = program('gungame')
  const cafe = program('animal-cafe')
  const now = currentSeason()
  const ordered = [...seasons].sort((a, b) => {
    const rank = (s) => ({ live: 0, soon: 1, ended: 2 }[seasonStatus(s)])
    return rank(a) - rank(b) || a.period.start.localeCompare(b.period.start)
  })

  const autumn = seasons.find((s) => s.id === 'autumn')
  const slides = [
    { slot: 'poster-autumn', tone: 0, lead: `가을 시즌 ${periodText(autumn.period)}`, title: '놀이공원 전체가 게임 맵이 돼요.', cta: '총게임 예약', to: '/reserve?program=gungame', alt: '바이킹 앞 장애물 사이로 팀원들이 레이저 총을 들고 달리는 모습' },
    { slot: 'site-history', tone: 3, lead: '1975년부터 춘천과 함께한 숲', title: '숲을 기르는 놀이공원, 육림', cta: '육림랜드 이야기', to: '/about' },
    { slot: 'cafe-interior', tone: 1, lead: '날씨와 상관없이 열리는 실내 카페', title: '미어캣과 기니피그가 기다려요.', cta: '카페 회차 예약', to: '/reserve?program=animal-cafe', alt: '실내 카페 유리 울타리 안에서 미어캣 두 마리가 서 있는 모습' },
    { slot: 'poster-winter', tone: 0, lead: '12월 15일 오픈 예정', title: '소나무 숲에서 보내는 하룻밤', cta: '오픈 알림 신청', to: '/play/season/winter' }
  ]

  const quick = [
    { icon: Crosshair, title: '숲속 총게임', text: '팀 대항 서바이벌', to: '/play/gungame' },
    { icon: CalendarRange, title: '시즌 이벤트', text: '계절마다 새 프로그램', to: '/play/season' },
    { icon: PawPrint, title: '동물 교감 카페', text: '작은 동물을 만나는 카페', to: '/play/cafe' },
    { icon: CalendarClock, title: '운영 안내', text: '캘린더와 요금', to: '/guide/calendar' }
  ]

  const usp = [
    { icon: Ticket, text: '통합권 하나로 입장부터 체험까지', to: '/guide' },
    { icon: CalendarX, text: '매주 화요일 휴무, 국경일은 정상 운영', to: '/guide/calendar' },
    { icon: Map, text: '3D 공간 지도에서 시설 위치 확인', to: '/map' }
  ]

  const promos = [
    { slot: 'gungame-zone-overview', title: gun.name, text: gun.summary, cta: '총게임 예약', to: '/reserve?program=gungame' },
    { slot: 'poster-autumn', title: '시즌 이벤트', text: `계절마다 공원 전체가 새 무대로 바뀌어요. 지금은 ${now.season} ${now.title}가 열려 있어요.`, cta: '시즌 일정', to: '/play/season' },
    { slot: 'cafe-interior', title: cafe.name, text: cafe.summary, cta: '카페 회차 예약', to: '/reserve?program=animal-cafe' },
    { slot: 'character-main', title: `${charName()} 미션`, text: '공원 곳곳의 QR을 찾아 스탬프를 모으면 3개부터 선물이 있어요', cta: '미션 시작', to: '/mission' }
  ]

  const tiles = ordered.map((s) => {
    const st = seasonStatus(s)
    return { slot: `poster-${s.id}`, title: `${s.season} ${s.title}`, meta: periodText(s.period), to: `/play/season/${s.id}`, status: st === 'soon' ? `${statusText.soon} D-${dday(s.period.start)}` : statusText[st] }
  })

  const bundles = pricing.bundles.options.map((b) => ({
    slot: { 'bundle-day': 'bundle-day', 'bundle-play': 'bundle-play', 'bundle-family': 'bundle-family' }[b.id], title: b.name, to: '/guide#bundle',
    lines: [
      { icon: Ticket, text: `포함 ${b.includes.join(', ')}` },
      { icon: Wallet, text: b.price.adult ? `성인 ${won(b.price.adult)}` : `4인 ${won(b.price.family4)}` }
    ]
  }))

  return (
    <>
      <NoticeBand />
      <Hero slides={slides} />
      <QuickLinks items={quick} />
      <UspBand items={usp} />
      <PromoCols items={promos} />

      <Teaser slot="gungame-obstacles" tone={0} title={`${autumn.title}`} cta="총게임 상세 안내" to="/play/gungame">
        <p>낮에는 청소년과 단체 리그, 금요일과 토요일 밤에는 불 꺼진 놀이공원에서 야간 미션전이 열려요</p>
        <p><b>기간</b> {periodText(autumn.period)}</p>
        <p><b>대상</b> {autumn.target.join(', ')}</p>
        <p><b>게임 모드</b> {autumn.intensity.levels.join(', ')}</p>
      </Teaser>

      <Teaser slot="cafe-interior" tone={1} title="날씨와 상관없는 동물 교감 카페" cta="카페 회차 예약" to="/reserve?program=animal-cafe">
        <p>{cafe.summary}</p>
        <CheckList items={[`하루 ${cafe.sessions.length}회차, ${cafe.sessions[0]}부터 ${cafe.sessions[cafe.sessions.length - 1]}까지`, `1인 ${won(cafe.price.perPerson)}, ${cafe.price.includes} 포함`, '회차 사이 20분은 동물 휴식 시간']} />
      </Teaser>

      <Teaser slot="character-main" tone={3} title={withChar('{캐릭터명}와 함께하는 숲속 미션')} cta="미션 시작" to="/mission">
        <p>숨은 QR을 찍어 스탬프를 모으면 안내소에서 선물을 받아요</p>
        <CheckList items={rewardTiers.map((t) => `스탬프 ${t.count}개 ${withChar(t.reward)}`)} />
      </Teaser>

      <TileGrid title="이번 시즌 축제와 이벤트" items={tiles} more={{ to: '/play/season', label: '시즌 이벤트 전체' }} />

      <Teaser slot="promo-video" tone={2} title="1975년부터, 같은 숲에서" cta="육림랜드 이야기" to="/about">
        <p>육림(育林)은 숲을 기른다는 뜻이고 1975년 춘천의 첫 놀이공원으로 문을 열었어요</p>
        
        <CheckList items={['낮에는 아이들의 보물찾기 숲', '밤에는 어른들의 모험 무대', '계절마다 바뀌는 시즌 프로그램']} />
      </Teaser>

      <PackageCards title="한 장으로 다 되는 통합권" items={bundles} more={{ to: '/guide', label: '요금 전체 안내' }} />

      <Mosaic title="육림랜드를 더 재미있게" items={[
        { slot: 'site-feeding', label: '먹이 주기 체험', text: '양과 사슴, 염소, 토끼에게 직접 먹이를 줘요.', to: '/play/attractions#zoo' },
        { slot: 'site-camp', label: '소나무 숲 캠프촌', text: '숲 그늘 아래 텐트를 치고 쉬어요.', to: '/play/attractions#camp' },
        { slot: 'site-photozone', label: '레트로 포토존', text: '50년 된 놀이공원 간판 앞에서 한 장 남겨요.', to: '/map?focus=photo-retro' },
        { slot: 'site-train', label: '기차', text: '공원을 한 바퀴 도는 기차를 타요.', to: '/play/attractions#rides' },
        { slot: 'site-zoo', label: '동물원', text: '호랑이와 곰, 수리부엉이를 만나요.', to: '/play/attractions#zoo' }
      ]} />
    </>
  )
}
