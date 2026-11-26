// nav.js  메뉴 구조. 메뉴마다 묶음 열과 오른쪽 사진 안내를 둔다.
export const menus = [
  {
    id: 'about', label: '육림랜드 소개', to: '/about',
    groups: [
      { title: '육림랜드 이야기', to: '/about', items: [
        { label: '1975년부터 지금까지', to: '/about#history' },
        { label: '낮과 밤 두 얼굴', to: '/about#daynight' },
        { label: '계절마다 새로 열려요', to: '/about#seasons' }
      ] },
      { title: '캐릭터', to: '/about/characters', items: [
        { label: '숲속 친구, 가디', to: '/about/characters' },
        { label: '리플릿', to: '/leaflet' }
      ] }
    ],
    promo: { slot: 'map-aerial', label: '육림랜드 전체 조감도', text: '숲속 놀이공원을 3D 지도로 둘러보세요.', to: '/map' }
  },
  {
    id: 'play', label: '어트랙션', to: '/play',
    groups: [
      { title: '어드벤처', to: '/play?cat=adventure#list', items: [
        { label: '숲속 총게임', to: '/play/gungame' },
        { label: '숲속 보물찾기', to: '/play/season/spring' }
      ] },
      { title: '나이트', to: '/play?cat=night#list', items: [
        { label: '한밤의 좀비 숲', to: '/play/season/summer' },
        { label: '야간 미션전', to: '/play/night-mission' }
      ] },
      { title: '동물 체험', to: '/play?cat=animal#list', items: [
        { label: '동물 교감 카페', to: '/play/cafe' },
        { label: '동물원과 먹이 주기', to: '/play/attractions#zoo' }
      ] },
      { title: '캠핑 숙박', to: '/play?cat=stay#list', items: [
        { label: '1일 캠핑', to: '/play/season/winter' },
        { label: '캠프촌', to: '/play/attractions#camp' }
      ] },
      { title: '놀이동산', to: '/play/attractions', items: [
        { label: '놀이기구', to: '/play/attractions#rides' }
      ] },
      { title: '사계절 프로그램', to: '/play/season', items: [
        { label: '봄 숲속 보물찾기', to: '/play/season/spring' },
        { label: '여름 좀비 숲', to: '/play/season/summer' },
        { label: '가을 총게임 리그', to: '/play/season/autumn' },
        { label: '겨울 캠핑 데이', to: '/play/season/winter' }
      ] }
    ],
    promo: { slot: 'gungame-zone-overview', label: '숲속 총게임 리그', text: '가을 시즌 11월 30일까지 열려요.', to: '/play/gungame' }
  },
  {
    id: 'season', label: '사계절 프로그램', to: '/play/season',
    groups: [
      { title: '사계절 프로그램', to: '/play/season', items: [
        { label: '봄 숲속 보물찾기', to: '/play/season/spring' },
        { label: '여름 좀비 숲', to: '/play/season/summer' },
        { label: '가을 총게임 리그', to: '/play/season/autumn' },
        { label: '겨울 캠핑 데이', to: '/play/season/winter' }
      ] }
    ],
    promo: { slot: 'poster-winter', label: '겨울 1일 캠핑 데이', text: '오픈 알림을 신청하면 가장 먼저 알려 드려요.', to: '/play/season/winter' }
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
        { label: '편의시설', to: '/map?focus=start' },
        { label: '리플릿', to: '/leaflet' }
      ] },
      { title: '고객 지원', to: '/guide/faq', items: [
        { label: '자주 묻는 질문', to: '/guide/faq' },
        { label: '내 예약', to: '/my' }
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
  { label: '소식', to: '/news' },
  { label: '단체 예약', to: '/play/gungame#group' },
  { label: '자주 묻는 질문', to: '/guide/faq' }
]
