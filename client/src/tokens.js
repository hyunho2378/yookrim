// tokens.js  UI.md 의 값을 실행 코드로 옮긴 유일한 원본이다.
// 색, 글자, 간격, 크기, 반경, 움직임 값은 이 파일에만 쓴다. 화면 CSS 는 아래에서 만든 CSS 변수만 읽는다.
// 기준: 레고랜드 코리아 공식 사이트(2026. 11. 7. 1440 폭 실측). 같은 구조와 치수를 쓰고 내용은 육림랜드 것을 넣는다.
// 레고랜드 화면에서 쓰던 연한 섹션 바탕, 테두리, 슬라이드 점, 왼쪽 파란 장식 띠는 금지 규칙에 따라 뺐다.

export const color = {
  // 브랜드. 쨍한 라임과 먹색, 포인트 하나(주황). 레고랜드의 노랑과 파랑을 총게임 분위기로 바꿨다
  bar: '#C6FF1A',        // 메뉴 띠, 눌린 단추, 강조 면
  lime: '#C6FF1A',
  limePress: '#A8E000',
  ink: '#0E0E10',        // 제목, 단추, 메뉴 판, 푸터
  ink2: '#1A1A1E',       // 푸터 둘째 줄
  barDeep: '#0E0E10',    // 맨 위 운영시간 줄
  action: '#FF4A1C',     // 긴급 공지와 D-day 같은 포인트 면
  actionText: '#D63A0E', // 흰 바탕 위 포인트 글자(대비 4.5 이상)
  actionPress: '#D63A0E',
  primary: '#0E0E10',
  primaryDeep: '#0E0E10',
  primaryPress: '#2A2A2E',
  // 글자
  text: '#0E0E10',
  textSub: '#3A3A40',
  textOnColor: '#FFFFFF',
  textOnBar: '#0E0E10',
  // 면
  page: '#FFFFFF',
  surface: '#F2F2F2',
  focus: '#0E0E10',
  hcText: '#0E0E10',
  hcSurface: '#E0E0E0',
  scrim: 'rgba(0, 0, 0, 0.55)',
  error: '#D63A0E'
}

// 사진 자리 색. 사진이 들어오기 전까지 먹색 한 가지로 채운다
export const slotColors = [color.ink, color.ink, color.ink, color.ink]

// 글자 역할. 크기 px, 행간 배수, 굵기, 자간 em. 모두 역할마다 따로 정한다
export const type = {
  display:  { size: 56, mSize: 32, lh: 1.12, lhM: 1.2,  weight: 800, ls: -0.03 },
  bandTitle:{ size: 40, mSize: 28, lh: 1.15, lhM: 1.25, weight: 800, ls: -0.025 },
  cardTitle:{ size: 28, mSize: 22, lh: 1.25, lhM: 1.3,  weight: 700, ls: -0.02 },
  quick:    { size: 22, mSize: 20, lh: 1.2,  lhM: 1.25, weight: 700, ls: -0.015 },
  label:    { size: 22, mSize: 19, lh: 1.3,  lhM: 1.3,  weight: 700, ls: -0.015 },
  menuHead: { size: 18, mSize: 18, lh: 1.35, lhM: 1.35, weight: 700, ls: -0.005 },
  nav:      { size: 18, mSize: 18, lh: 1.3,  lhM: 1.3,  weight: 600, ls: -0.005 },
  button:   { size: 18, mSize: 18, lh: 1.2,  lhM: 1.2,  weight: 700, ls: -0.005 },
  body:     { size: 16, mSize: 16, lh: 1.6,  lhM: 1.6,  weight: 400, ls: 0 },
  bodyStrong:{ size: 16, mSize: 16, lh: 1.55, lhM: 1.55, weight: 600, ls: 0 },
  small:    { size: 14, mSize: 14, lh: 1.5,  lhM: 1.5,  weight: 400, ls: 0.005 },
  caption:  { size: 13, mSize: 13, lh: 1.45, lhM: 1.45, weight: 400, ls: 0.01 }
}

// 간격 px. 8 배수와 4
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 28, 7: 40, 8: 56, 9: 80, 10: 96 }

// 크기 px
export const size = {
  topbar: 36, nav: 76, navM: 60,
  hero: 640, heroM: 440,
  quick: 88, usp: 60,
  button: 52, buttonSm: 44, buttonW: 220,
  arrow: 56, touch: 44,
  container: 1200, gutter: 32,
  sidePad: 40, sidePadM: 20,
  bookingBar: 68
}

// 3D 지도 장면 색. 현장 스캔 모델이 들어오면 모델의 실제 질감이 이 색을 대신한다
export const scene = {
  sky: '#BFE9FF', ground: '#6FA86A', grass: '#3FA34D', path: '#F2D492', water: '#31A1E0',
  trunk: '#8B5A2B', pine: '#1F7A3A', pineLight: '#2E9E4A',
  zone: { neutral: '#F2D492', autumn: '#FFCF00', spring: '#7ED957', forest: '#2E9E4A', summer: '#D01012' },
  red: '#D01012', yellow: '#FFCF00', blue: '#006DB7', green: '#009D2E', white: '#FFFFFF', wall: '#D3D7DC', roof: '#F2F3F5', dark: '#16161A', lime: '#C6FF1A', side: '#D3D7DC'
}

// 높이 단계. 면이 떠 있는 정도를 그림자 두 겹(맞닿은 그림자와 퍼지는 그림자)으로 만든다
// 0 목록 줄과 입력칸, 1 카드와 사진, 2 떠 있는 판(메뉴 판, 사진 위 상자), 3 손을 올렸을 때 떠오른 카드, btn 누를 수 있는 단추
export const shadow = {
  0: '0 1px 2px rgba(17, 17, 17, 0.08), 0 2px 8px rgba(17, 17, 17, 0.06)',
  1: '0 1px 3px rgba(17, 17, 17, 0.10), 0 8px 24px rgba(17, 17, 17, 0.12)',
  2: '0 2px 6px rgba(17, 17, 17, 0.12), 0 18px 44px rgba(17, 17, 17, 0.22)',
  3: '0 4px 10px rgba(17, 17, 17, 0.14), 0 26px 56px rgba(17, 17, 17, 0.26)',
  btn: '0 2px 4px rgba(17, 17, 17, 0.22), 0 8px 18px rgba(17, 17, 17, 0.16)',
  header: '0 6px 20px rgba(17, 17, 17, 0.22)',
  text: '0 2px 14px rgba(0, 0, 0, 0.55)',
  inset: 'inset 0 1px 3px rgba(17, 17, 17, 0.14)',
  hairline: 'inset 0 -1px 0 rgba(17, 17, 17, 0.10)',
  bar: '0 -8px 24px rgba(17, 17, 17, 0.22)'
}

// 사진 위 어둠막. 글자 쪽을 어둡게 하고 반대쪽은 사진이 그대로 보이게 한다
export const gradient = {
  heroSide: 'linear-gradient(90deg, rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.18) 55%, transparent 100%)',
  heroBottom: 'linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 70%, transparent 100%)',
  sub: 'linear-gradient(0deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45))',
  event: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, transparent 60%)',
  hover: 'linear-gradient(0deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.5) 100%)',
  slot: 'linear-gradient(0deg, rgba(0, 0, 0, 0.35), transparent)'
}

// 글자 로고 크기
export const logo = { ko: 32, koM: 26, en: 12, enM: 10, lh: 1.05, weight: 800, ls: -0.04, enLs: 0.18 }

// 반경 단계. 40px 이상 요소는 base, 그보다 작은 이름표와 번호 칸은 sm. 작은 요소에 base 를 쓰면 알약 모양이 되기 때문이다
export const radius = { base: 12, sm: 6 }

export const motion = {
  fast: 160, base: 240, slide: 800, menu: 200, stamp: 300,
  ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
  heroInterval: 7000
}

export const z = { content: 1, sticky: 20, header: 40, menu: 50, bar: 60, dialog: 80, toast: 90 }

// 1920 폭을 넘으면 기준 글자 크기를 화면 폭에 맞춰 키운다. rem 으로 쓴 모든 값이 함께 커진다
export const fluid = { from: 1920, to: 3840, baseMin: 16, baseMax: 32 }

const rem = (px) => `${px / 16}rem`

// CSS 변수로 펼친다. main.jsx 가 첫 그림 전에 한 번 넣는다
export function cssVariables() {
  const v = {}
  for (const [k, val] of Object.entries(color)) v[`--c-${k}`] = val
  slotColors.forEach((c, i) => { v[`--slot-${i}`] = c })
  for (const [k, t] of Object.entries(type)) {
    v[`--t-${k}-size`] = rem(t.size)
    v[`--t-${k}-msize`] = rem(t.mSize)
    v[`--t-${k}-lh`] = String(t.lh)
    v[`--t-${k}-lhm`] = String(t.lhM)
    v[`--t-${k}-weight`] = String(t.weight)
    v[`--t-${k}-ls`] = `${t.ls}em`
  }
  for (const [k, val] of Object.entries(space)) v[`--s-${k}`] = rem(val)
  for (const [k, val] of Object.entries(size)) v[`--z-${k}`] = rem(val)
  v['--r'] = rem(radius.base)
  v['--r-sm'] = rem(radius.sm)
  for (const [k, val] of Object.entries(shadow)) v[`--shadow-${k}`] = val
  for (const [k, val] of Object.entries(gradient)) v[`--g-${k}`] = val
  v['--logo-ko'] = rem(logo.ko); v['--logo-koM'] = rem(logo.koM); v['--logo-en'] = rem(logo.en); v['--logo-enM'] = rem(logo.enM)
  v['--logo-lh'] = String(logo.lh); v['--logo-weight'] = String(logo.weight); v['--logo-ls'] = `${logo.ls}em`; v['--logo-enls'] = `${logo.enLs}em`
  v['--m-fast'] = `${motion.fast}ms`
  v['--m-base'] = `${motion.base}ms`
  v['--m-slide'] = `${motion.slide}ms`
  v['--m-menu'] = `${motion.menu}ms`
  v['--m-stamp'] = `${motion.stamp}ms`
  v['--ease'] = motion.ease
  for (const [k, val] of Object.entries(z)) v[`--layer-${k}`] = String(val)
  v['--fluid-base'] = `clamp(${fluid.baseMin}px, ${(fluid.baseMin / fluid.from) * 100}vw, ${fluid.baseMax}px)`
  return v
}

export default { color, scene, gradient, slotColors, type, space, size, shadow, logo, radius, motion, z, fluid, cssVariables }
