// data.js  화면 문구와 값은 src/data/*.json 에서만 읽는다. 값을 바꾸면 화면이 바로 바뀐다.
import site from '../data/site.json'
import seasonsData from '../data/seasons.json'
import programsData from '../data/programs.json'
import pricing from '../data/pricing.json'
import facilitiesData from '../data/facilities.json'
import missionsData from '../data/missions.json'
import faqData from '../data/faq.json'
import noticesData from '../data/notices.json'

export { site, pricing }
export const seasons = seasonsData.seasons
export const programs = programsData.programs
export const facilities = facilitiesData.facilities
export const zones = facilitiesData.zones
export const mapFilters = facilitiesData.filters
export const missions = missionsData.missions
export const rewardTiers = missionsData.rewardTiers
export const faq = faqData
export const notices = noticesData.notices

// 캐릭터 이름은 site.json 한 곳에서만 읽는다. 아직 이름이 없으면 "캐릭터"로 읽힌다
export const charName = () => (site.character.name && !site.character.name.includes('{') ? site.character.name : '캐릭터')
export const withChar = (s) => (s || '').split('{캐릭터명}').join(charName())

export const program = (id) => programs.find((p) => p.id === id)
export const season = (id) => seasons.find((s) => s.id === id)
export const facility = (id) => facilities.find((f) => f.id === id)
export const mission = (id) => missions.find((m) => m.id === id)
export const zone = (id) => zones.find((z) => z.id === id)

export const won = (n) => (typeof n === 'number' ? `${n.toLocaleString('ko-KR')}원` : '')

// 한국 시간 기준 날짜 문자열
export function kstDate(d = new Date()) {
  const k = new Date(d.getTime() + (9 * 60 + d.getTimezoneOffset()) * 60000)
  return k
}
export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const dotDate = (s) => { const [y, m, d] = s.split('-'); return `${y}. ${Number(m)}. ${Number(d)}.` }
export const shortDate = (s) => { const [, m, d] = s.split('-'); return `${Number(m)}월 ${Number(d)}일` }

// 오늘 운영 상태. 화요일 휴무, 주말 마감은 site.json 값을 쓴다
export function todayHours(d = kstDate()) {
  const day = d.getDay()
  if (day === 2) return { open: false, label: '오늘은 쉬는 날', hours: null }
  const weekend = day === 0 || day === 6
  const hours = (weekend ? site.hours.weekend : site.hours.weekday).replace('-', ' - ')
  return { open: true, label: `오늘 운영 ${hours}`, hours }
}
export const isClosedDay = (d) => d.getDay() === 2

// 시즌 상태. 오늘이 기간 안이면 운영 중, 앞이면 오픈 예정, 지났으면 종료
export function seasonStatus(s, today = ymd(kstDate())) {
  if (today < s.period.start) return 'soon'
  if (today > s.period.end) return 'ended'
  return 'live'
}
export const statusText = { live: '운영 중', soon: '오픈 예정', ended: '시즌 종료' }
export function currentSeason(today = ymd(kstDate())) {
  const live = seasons.find((s) => seasonStatus(s, today) === 'live')
  if (live) return live
  return [...seasons].sort((a, b) => a.period.start.localeCompare(b.period.start)).find((s) => s.period.start > today) || seasons[0]
}
export function dday(start, today = ymd(kstDate())) {
  const a = new Date(`${today}T00:00:00`), b = new Date(`${start}T00:00:00`)
  return Math.round((b - a) / 86400000)
}
export const periodText = (p) => `${shortDate(p.start)} - ${shortDate(p.end)}`

// 예약할 수 있는 프로그램과 회차
export const bookable = ['gungame', 'animal-cafe', 'zombie-night', 'winter-camp']
export function priceFrom(p) {
  if (!p?.price && !p?.options) return null
  if (p.options) return Math.min(...p.options.map((o) => o.price))
  const nums = Object.values(p.price).filter((v) => typeof v === 'number')
  return nums.length ? Math.min(...nums) : null
}

// 남은 자리. 날짜와 회차로 늘 같은 값을 만든다
export function seatsLeft(dateStr, time, cap = 20) {
  let h = 0
  for (const ch of `${dateStr}${time}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const taken = h % (cap + 4)
  return Math.max(0, cap - taken)
}
