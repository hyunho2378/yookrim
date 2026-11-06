// bake-yookrim.mjs 춘천 육림랜드 일대의 실제 자료를 받아 3D 장면용 파일로 굽는다. 키 없이 열려 있는 공공 자료만 쓴다.
// 영상: 국토교통부 브이월드 위성영상 타일(xdworld.vworld.kr/2d/Satellite) z19
// 지형: AWS Terrain Tiles(Terrarium) z15
// 지물: OpenStreetMap(Overpass API) 건물, 도로, 공원 경계, 지명
// 실행: node scripts/bake-yookrim.mjs   결과: public/scene/ 아래 파일
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const jpeg = require('jpeg-js')
const { PNG } = require('pngjs')

import { fileURLToPath } from 'node:url'
const OUT = fileURLToPath(new URL('../public/scene/', import.meta.url))
await fs.mkdir(OUT, { recursive: true })

// 육림랜드(OSM way 479978913) 중심과 장면 범위
const C = { lat: 37.91837, lon: 127.7202 }
const HALF = 500 // m
const MLAT = 110574
const MLON = 111320 * Math.cos((C.lat * Math.PI) / 180)
const bbox = { w: C.lon - HALF / MLON, e: C.lon + HALF / MLON, s: C.lat - HALF / MLAT, n: C.lat + HALF / MLAT }

const Z = 19
const lon2x = (lon, z) => ((lon + 180) / 360) * 2 ** z
const lat2y = (lat, z) => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z
const x2lon = (x, z) => (x / 2 ** z) * 360 - 180
const y2lat = (y, z) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))) * 180) / Math.PI

async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'yookrim-proto/1.0' } })
      if (r.ok) return Buffer.from(await r.arrayBuffer())
    } catch { /* 다시 시도 */ }
    await new Promise((r) => setTimeout(r, 400 * (i + 1)))
  }
  throw new Error('받지 못함 ' + url)
}
async function pool(items, n, fn) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k) } }))
}

// 1) 위성영상 이어 붙이기
const tx0 = Math.floor(lon2x(bbox.w, Z)), tx1 = Math.floor(lon2x(bbox.e, Z))
const ty0 = Math.floor(lat2y(bbox.n, Z)), ty1 = Math.floor(lat2y(bbox.s, Z))
const cols = tx1 - tx0 + 1, rows = ty1 - ty0 + 1
console.log('위성영상 타일', cols, 'x', rows)
const tiles = []
for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) tiles.push([x, y])
const W = cols * 256, H = rows * 256
const mosaic = new Uint8Array(W * H * 4)
await pool(tiles, 10, async ([x, y]) => {
  const buf = await get(`https://xdworld.vworld.kr/2d/Satellite/service/${Z}/${x}/${y}.jpeg`)
  const img = jpeg.decode(buf, { useTArray: true, formatAsRGBA: true })
  for (let j = 0; j < 256; j++) mosaic.set(img.data.subarray(j * 256 * 4, (j + 1) * 256 * 4), ((y - ty0) * 256 + j) * W * 4 + (x - tx0) * 256 * 4)
})
// 4096 으로 줄여 저장(이중선형)
const SIZE = 4096
const small = new Uint8Array(SIZE * SIZE * 4)
for (let j = 0; j < SIZE; j++) {
  const fy = ((j + 0.5) / SIZE) * H - 0.5, y0 = Math.max(0, Math.min(H - 2, Math.floor(fy))), ty = fy - y0
  for (let i = 0; i < SIZE; i++) {
    const fx = ((i + 0.5) / SIZE) * W - 0.5, x0 = Math.max(0, Math.min(W - 2, Math.floor(fx))), tx = fx - x0
    for (let c = 0; c < 4; c++) {
      const p = (yy, xx) => mosaic[(yy * W + xx) * 4 + c]
      small[(j * SIZE + i) * 4 + c] = p(y0, x0) * (1 - tx) * (1 - ty) + p(y0, x0 + 1) * tx * (1 - ty) + p(y0 + 1, x0) * (1 - tx) * ty + p(y0 + 1, x0 + 1) * tx * ty
    }
  }
}
await fs.writeFile(OUT + 'satellite.jpg', jpeg.encode({ data: small, width: SIZE, height: SIZE }, 84).data)
const ext = { w: x2lon(tx0, Z), e: x2lon(tx1 + 1, Z), n: y2lat(ty0, Z), s: y2lat(ty1 + 1, Z) }
console.log('영상 범위', ext)

// 2) 숲 위치. 영상에서 짙은 녹색 칸을 골라 나무 위치를 만든다
const TS = 1024
const trees = []
const mx = (ext.e - ext.w) * MLON, mz = (ext.n - ext.s) * MLAT
let seed = 1975
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const step = 3
const ox = ((ext.w + ext.e) / 2 - C.lon) * MLON, oz = -((ext.n + ext.s) / 2 - C.lat) * MLAT
for (let j = 0; j < TS; j += step) for (let i = 0; i < TS; i += step) {
  const k = (Math.floor(((j + 0.5) / TS) * SIZE) * SIZE + Math.floor(((i + 0.5) / TS) * SIZE)) * 4
  const r = small[k], g = small[k + 1], b = small[k + 2]
  const lum = 0.3 * r + 0.59 * g + 0.11 * b
  if (g > r * 1.02 && g > b * 1.08 && lum < 92) {
    trees.push([((i + rnd()) / TS - 0.5) * mx + ox, ((j + rnd()) / TS - 0.5) * mz + oz, 0.75 + rnd() * 0.7, lum < 62 ? 1 : 0])
  }
}
await fs.writeFile(OUT + 'trees.bin', Buffer.from(new Float32Array(trees.flat()).buffer))
console.log('나무', trees.length)

// 3) 지형
const z15 = 15
const dx0 = Math.floor(lon2x(ext.w, z15)), dx1 = Math.floor(lon2x(ext.e, z15))
const dy0 = Math.floor(lat2y(ext.n, z15)), dy1 = Math.floor(lat2y(ext.s, z15))
const dem = { w: (dx1 - dx0 + 1) * 256, h: (dy1 - dy0 + 1) * 256, data: null }
dem.data = new Float32Array(dem.w * dem.h)
for (let y = dy0; y <= dy1; y++) for (let x = dx0; x <= dx1; x++) {
  const buf = await get(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z15}/${x}/${y}.png`)
  const px = PNG.sync.read(buf)
  for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) {
    const k = (j * 256 + i) * 4
    dem.data[((y - dy0) * 256 + j) * dem.w + (x - dx0) * 256 + i] = px.data[k] * 256 + px.data[k + 1] + px.data[k + 2] / 256 - 32768
  }
}
const sample = (lon, lat) => {
  const fx = (lon2x(lon, z15) - dx0) * 256 - 0.5, fy = (lat2y(lat, z15) - dy0) * 256 - 0.5
  const x0 = Math.max(0, Math.min(dem.w - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(dem.h - 2, Math.floor(fy)))
  const tx = fx - x0, ty = fy - y0
  const a = dem.data[y0 * dem.w + x0], b = dem.data[y0 * dem.w + x0 + 1], c = dem.data[(y0 + 1) * dem.w + x0], d = dem.data[(y0 + 1) * dem.w + x0 + 1]
  return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty
}
const N = 161
const grid = new Float32Array(N * N)
let lo = 1e9, hi = -1e9
for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
  const lon = ext.w + ((ext.e - ext.w) * i) / (N - 1), lat = ext.n - ((ext.n - ext.s) * j) / (N - 1)
  const h = sample(lon, lat); grid[j * N + i] = h; lo = Math.min(lo, h); hi = Math.max(hi, h)
}
await fs.writeFile(OUT + 'dem.bin', Buffer.from(grid.buffer))
console.log('고도', lo.toFixed(1), '~', hi.toFixed(1), 'm')

// 4) 지물(OpenStreetMap)
const bb = `${ext.s},${ext.w},${ext.n},${ext.e}`
const q = `[out:json][timeout:90];(way["building"](${bb});way["highway"](${bb});way["tourism"](${bb});way["leisure"](${bb});way["landuse"](${bb});way["natural"](${bb});way["waterway"](${bb});way["man_made"="bridge"](${bb});way["barrier"](${bb});way["railway"](${bb});way["amenity"](${bb});node["name"](${bb});node["tourism"](${bb});node["natural"="tree"](${bb}););out body geom;`
let osm = null
for (const url of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'yookrim-proto/1.0' }, body: 'data=' + encodeURIComponent(q) })
    console.log('OSM', url, r.status)
    if (r.ok) { osm = await r.json(); break }
  } catch (e) { console.log('OSM 오류', String(e).slice(0, 100)) }
}
if (!osm) throw new Error('OSM 자료를 받지 못함')
const to = (g) => g.map((p) => [Number(p.lon.toFixed(6)), Number(p.lat.toFixed(6))])
const out = { buildings: [], roads: [], areas: [], places: [], bridges: [], rails: [], fences: [] }
for (const e of osm.elements) {
  const t = e.tags || {}
  if (e.type === 'node') { if (t.name && !t.highway) out.places.push({ name: t.name, lon: e.lon, lat: e.lat, kind: t.tourism || t.amenity || t.shop || t.leisure || t.place || 'place' }); continue }
  if (!e.geometry) continue
  const g = to(e.geometry)
  if (t.building && t.building !== 'roof') out.buildings.push({ id: e.id, name: t.name || '', levels: Number(t['building:levels']) || 0, kind: t.building, ring: g })
  else if (t.building === 'roof') out.areas.push({ id: e.id, kind: 'roof', name: t.name || '', ring: g })
  else if (t.highway) out.roads.push({ id: e.id, kind: t.highway, name: t.name || '', bridge: !!t.bridge, pts: g })
  else if (t.railway) out.rails.push({ id: e.id, pts: g })
  else if (t.barrier) out.fences.push({ id: e.id, pts: g })
  else if (t.waterway) out.areas.push({ id: e.id, kind: 'waterway:' + t.waterway, name: t.name || '', ring: g })
  else if (t.man_made === 'bridge') continue
  else {
    const kind = t.tourism ? 'tourism:' + t.tourism : t.leisure ? 'leisure:' + t.leisure : t.landuse ? 'landuse:' + t.landuse : t.natural ? 'natural:' + t.natural : t.amenity ? 'amenity:' + t.amenity : 'other'
    out.areas.push({ id: e.id, kind, name: t.name || '', ring: g })
  }
}
await fs.writeFile(OUT + 'osm.json', JSON.stringify(out))
const meta = { center: C, extent: ext, half: HALF, mlon: MLON, mlat: MLAT, dem: { n: N, min: lo, max: hi }, satellite: { size: SIZE, z: Z }, trees: trees.length, osm: { buildings: out.buildings.length, roads: out.roads.length, areas: out.areas.length, places: out.places.length }, bakedAt: new Date().toISOString().slice(0, 10) }
await fs.writeFile(OUT + 'meta.json', JSON.stringify(meta, null, 1))
console.log(JSON.stringify(meta))
