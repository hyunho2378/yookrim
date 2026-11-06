// geo.js 육림랜드 일대 좌표 계산. scripts/bake-yookrim.mjs 가 굽는 영상과 지형, 지물과 같은 값을 쓴다.
// 장면 좌표는 육림랜드 중심을 원점으로 한 미터 단위이고, 동쪽이 +x, 북쪽이 -z, 위쪽이 +y 이다.
export const CENTER = { lat: 37.91837, lon: 127.7202 }
export const MLAT = 110574
export const MLON = 111320 * Math.cos((CENTER.lat * Math.PI) / 180)
// 위성영상과 지형이 덮는 범위(영상 타일 경계에 맞춘 값)
export const EXTENT = { w: 127.71400451660156, e: 127.72636413574219, n: 37.92307614140167, s: 37.913325774991655 }
export const toXZ = (lon, lat) => [(lon - CENTER.lon) * MLON, -(lat - CENTER.lat) * MLAT]
export const toPct = (lon, lat) => ({ x: ((lon - EXTENT.w) / (EXTENT.e - EXTENT.w)) * 100, y: ((EXTENT.n - lat) / (EXTENT.n - EXTENT.s)) * 100 })
export const SOURCES = '영상 국토교통부 브이월드, 지형 AWS Terrain Tiles, 지물 OpenStreetMap 기여자'
// 위성영상(4096px) 안의 점을 경위도로 바꾼다. 영상에서 읽은 구조물 위치에 쓴다
export const SAT = 4096
export const fromSat = (px, py) => [EXTENT.w + (px / SAT) * (EXTENT.e - EXTENT.w), EXTENT.n - (py / SAT) * (EXTENT.n - EXTENT.s)]
export const M_PER_PX = ((EXTENT.e - EXTENT.w) * MLON) / SAT
