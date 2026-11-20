// plan.js  카테고리와 콘텐츠 카드, 방문자별 안내, 방문 전 질문 답변. 값은 programs, seasons, pricing, site 에서 읽어 만든다.
import catalog from '../data/catalog.json'
import { program, season, seasonStatus, periodText, shortDate, won, site, pricing, bookable, priceFrom, seasons, currentSeason, statusText } from './data'

export const categories = catalog.categories
export const audiences = catalog.audiences
export const items = catalog.items
export const category = (id) => categories.find((c) => c.id === id)
export const itemById = (id) => items.find((i) => i.id === id)

// 카드에 붙는 상태 이름. 시즌 한정 콘텐츠는 시즌 상태를, 늘 여는 콘텐츠는 운영 중을 보인다
export function tagsOf(it) {
  const tags = []
  const s = it.seasonId ? season(it.seasonId) : null
  const st = s ? seasonStatus(s) : 'live'
  if (st === 'soon') tags.push({ text: '오픈 예정', tone: 'soon' })
  else if (st === 'ended') tags.push({ text: '시즌 종료', tone: 'end' })
  else tags.push({ text: '운영 중', tone: 'live' })
  if (st !== 'ended') {
    if (s && st === 'live') tags.push({ text: '시즌 한정', tone: 'season' })
    if (it.booking && st !== 'soon') tags.push({ text: '예약 필요', tone: 'book' })
  }
  return tags
}

const join = (a) => a.join(', ')

// 상세 화면의 "한눈에 보기" 값. 자료가 있는 항목만 돌려준다
export function factsOf(id) {
  const it = itemById(id)
  if (!it) return null
  const p = program(it.programId)
  const s = it.seasonId ? season(it.seasonId) : null
  const f = { rows: [], safety: [] }
  const add = (k, v) => { if (v) f.rows.push([k, v]) }
  if (id === 'gungame') {
    add('소요 시간', '40분에서 50분')
    add('추천 인원', `${p.capacity.min}명부터 회차당 ${p.capacity.perSession}명까지`)
    add('추천 대상', join(p.target))
    add('요금', `1인 ${won(p.price.laser)}부터, ${p.price.groupDiscount} 할인`)
    add('운영일', `${s.season} 시즌 ${periodText(s.period)}, 화요일 휴무`)
    f.safety = p.safety
  } else if (id === 'night-mission') {
    const m = program('gungame').modes.find((x) => x.id === 'night')
    add('소요 시간', m.duration)
    add('추천 인원', `${p.capacity.min}명부터 회차당 ${p.capacity.perSession}명까지`)
    add('추천 대상', m.age)
    add('요금', `1인 ${won(p.price.night)}`)
    add('운영일', `금요일과 토요일 ${p.nightSessions.join(', ')}`)
    f.safety = p.safety
  } else if (id === 'zombie-night') {
    add('추천 인원', `회차당 최대 ${p.capacity.perSession}명`)
    add('추천 대상', join(p.target))
    add('요금', `1인 ${won(p.price.adult)}`)
    add('운영일', `${s.season} 시즌 ${periodText(s.period)}, ${s.time}`)
    f.safety = p.safety
  } else if (id === 'treasure-hunt') {
    add('추천 인원', '자유 참여')
    add('추천 대상', join(p.target))
    add('요금', `미션 키트 ${won(p.price.missionKit)}`)
    add('운영일', `${s.season} 시즌 ${periodText(s.period)}, ${s.time}`)
  } else if (id === 'animal-cafe') {
    add('소요 시간', '한 회차 40분')
    add('추천 대상', join(p.target))
    add('요금', `1인 ${won(p.price.perPerson)}, ${p.price.includes} 포함`)
    add('운영일', `운영일마다 하루 ${p.sessions.length}회차, ${p.sessions[0]}부터 ${p.sessions[p.sessions.length - 1]}까지`)
    f.safety = p.welfareRules
  } else if (id === 'feeding') {
    add('추천 대상', join(p.target))
    add('요금', p.price.note)
    add('운영일', '운영시간 동안')
  } else if (id === 'winter-camp') {
    add('소요 시간', '당일 캠핑 13:00부터 21:00, 숙박은 다음 날 11:00까지')
    add('추천 대상', join(p.target))
    add('요금', p.options.map((o) => `${o.name.replace(/ \(.*\)/, '')} ${o.unit} ${won(o.price)}`).join(', '))
    add('운영일', `${s.season} 시즌 ${periodText(s.period)}`)
    f.safety = p.rules
  } else if (id === 'campground') {
    add('추천 대상', it.forText)
    add('운영일', it.days)
    add('준비물', it.bring)
    f.safety = it.safety
  } else if (id === 'rides') {
    add('추천 대상', it.forText)
    add('요금', `1종 ${won(pricing.rides.options[0].price)}부터`)
    add('운영일', `운영시간 동안, ${site.hours.closedDay} 휴무`)
  }
  return f
}

export function cardPrice(it) {
  const p = program(it.programId)
  const n = p ? priceFrom(p) : null
  if (it.id === 'night-mission') return `${won(p.price.night)}`
  if (it.id === 'rides') return `${won(pricing.rides.options[0].price)}부터`
  if (it.id === 'treasure-hunt') return `${won(p.price.missionKit)}`
  return n ? `${won(n)}부터` : ''
}

// 방문 전에 가장 많이 묻는 여덟 가지
export function visitQA() {
  const now = currentSeason()
  const st = seasonStatus(now)
  const a = pricing.admission
  const gun = program('gungame')
  const open = seasons.filter((s) => seasonStatus(s) !== 'ended')
  return [
    { q: '육림랜드는 어떤 곳인가요?', a: `1975년 춘천에서 문을 연 숲속 놀이공원이에요. 낮에는 놀이기구와 동물, 밤에는 야간 체험과 캠핑이 열리고 계절마다 새 프로그램이 시작돼요.`, to: '/about', cta: '육림랜드 이야기' },
    { q: '오늘이나 이번 시즌에는 무엇을 할 수 있나요?', a: `놀이기구와 동물원, 먹이 주기, 동물 교감 카페는 운영일마다 이용해요. 시즌 프로그램은 ${now.season} ${now.title}가 ${statusText[st]} 상태이고 ${periodText(now.period)}에 열려요.`, to: '/play/season', cta: '이번 시즌 보기' },
    { q: '함께 오는 사람에게 어떤 콘텐츠가 맞나요?', a: '아이와 함께라면 동물 체험과 놀이기구, 친구나 연인과는 총게임과 야간 체험, 단체라면 총게임 단체 예약을 추천해요. 처음이라면 놀이기구와 동물원, 동물 교감 카페부터 둘러보세요.', to: '/play#audience', cta: '방문자별 추천 보기' },
    { q: '얼마나 걸리고 비용은 얼마인가요?', a: `총게임은 모드에 따라 40분에서 60분이 걸리고 1인 ${won(gun.price.laser)}부터예요. 입장권은 성인 ${won(a.individual.adult)}, 청소년 ${won(a.individual.youth)}, 어린이 ${won(a.individual.child)}이고 ${a.freeUnder}예요.`, to: '/guide', cta: '요금 보기' },
    { q: '예약이 필요한가요?', a: '숲속 총게임, 동물 교감 카페, 한밤의 좀비 숲, 1일 캠핑은 예약이 필요해요. 입장과 놀이기구, 동물원은 현장에서 바로 이용해요.', to: '/reserve', cta: '예약하기' },
    { q: '어디에 있고 주차할 수 있나요?', a: `${site.address}에 있어요. 주차장이 있고 가는 길은 대중교통과 자가용으로 나눠 안내해요.`, to: '/guide/directions', cta: '오시는 길 보기' },
    { q: '안전하게 이용할 수 있나요?', a: '총게임은 경기 전 10분 안전 교육을 하고 보호 장비를 꼭 착용해요. 좀비 숲은 포기 신호를 보내면 언제든 나갈 수 있고, 동물 체험은 손 소독 뒤 입장해요.', to: '/play/gungame#safety', cta: '안전 수칙 보기' },
    { q: '다음 시즌에도 다시 올 이유가 있나요?', a: `계절마다 프로그램이 바뀌어요. ${open.map((s) => `${s.season} ${s.title}(${shortDate(s.period.start)} 시작)`).join(', ')}이 이어져요.`, to: '/play/season', cta: '사계절 일정 보기' }
  ]
}
