// nav.js  메뉴 구조. 레고랜드처럼 메뉴마다 묶음 열과 오른쪽 사진 안내를 둔다.
export const menus = [
  {
    id: 'about', label: '육림랜드 소개', to: '/about',
    groups: [
      { title: '육림랜드 이야기', to: '/about', items: [
        { label: '1975년부터 지금까지', to: '/about#history' },
        { label: '낮과 밤 두 얼굴', to: '/about#daynight' },
        { label: '되살리기 프로젝트', to: '/about#project' }
      ] },
      { title: '캐릭터', to: '/about/characters', items: [
        { label: '캐릭터와 친구들', to: '/about/characters' },
        { label: '숲속 미션', to: '/mission' }
      ] }
    ],
    promo: { slot: 'map-aerial', label: '육림랜드 전체 조감도', text: '숲속 놀이공원을 3D 지도로 둘러보세요.', to: '/map' }
  },
  {
    id: 'play', label: '즐길거리', to: '/play',
    groups: [
      { title: '체험 프로그램', to: '/play', items: [
        { label: '숲속 총게임', to: '/play/gungame' },
        { label: '동물 교감 카페', to: '/play/cafe' }
      ] },
      { title: '시즌 이벤트', to: '/play/season', items: [
        { label: '봄 숲속 보물찾기', to: '/play/season/spring' },
        { label: '여름 좀비 숲', to: '/play/season/summer' },
        { label: '가을 총게임 리그', to: '/play/season/autumn' },
        { label: '겨울 캠핑 데이', to: '/play/season/winter' }
      ] },
      { title: '놀이동산과 동물원', to: '/play/attractions', items: [
        { label: '놀이기구', to: '/play/attractions#rides' },
        { label: '동물원과 먹이 주기', to: '/play/attractions#zoo' },
        { label: '캠프촌', to: '/play/attractions#camp' }
      ] }
    ],
    promo: { slot: 'gungame-zone-overview', label: '숲속 총게임 리그', text: '가을 시즌 11월 30일까지 열려요.', to: '/play/gungame' }
  },
  {
    id: 'mission', label: '미션', to: '/mission',
    groups: [
      { title: '캐릭터 미션', to: '/mission', items: [
        { label: '미션 안내', to: '/mission' },
        { label: '미션 카드와 스탬프', to: '/mission#cards' },
        { label: '보상 받기', to: '/mission/reward' }
      ] }
    ],
    promo: { slot: 'character-main', label: '숲속 미션', text: '스탬프 3개만 모아도 선물을 받아요.', to: '/mission' }
  },
  {
    id: 'guide', label: '이용안내', to: '/guide',
    groups: [
      { title: '방문 계획', to: '/guide', items: [
        { label: '운영 캘린더', to: '/guide/calendar' },
        { label: '요금과 통합권', to: '/guide' },
        { label: '오시는 길', to: '/guide/directions' }
      ] },
      { title: '방문 중 안내', to: '/map', items: [
        { label: '공간 지도', to: '/map' },
        { label: '편의시설', to: '/map?filter=amenity' }
      ] },
      { title: '고객 지원', to: '/guide/faq', items: [
        { label: '자주 묻는 질문', to: '/guide/faq' },
        { label: '내 예약과 미션', to: '/my' }
      ] }
    ],
    promo: { slot: 'site-entrance', label: '행사 날 오시는 길', text: '춘천마라톤 통제 구간과 우회 경로를 미리 확인하세요.', to: '/guide/directions#control' }
  },
  {
    id: 'news', label: '소식', to: '/news',
    groups: [
      { title: '소식', to: '/news', items: [
        { label: '공지사항', to: '/news?type=notice' },
        { label: '이벤트', to: '/news?type=event' }
      ] }
    ],
    promo: { slot: 'poster-winter', label: '겨울 1일 캠핑 데이', text: '오픈 알림을 신청하면 가장 먼저 알려 드려요.', to: '/play/season/winter' }
  }
]

export const topLinks = [
  { label: '오시는 길', to: '/guide/directions' },
  { label: '단체 예약', to: '/play/gungame#group' },
  { label: '자주 묻는 질문', to: '/guide/faq' }
]
