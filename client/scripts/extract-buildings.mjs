// extract-buildings.mjs 국토교통부 GIS건물통합정보(브이월드 데이터마켓, 강원특별자치도 전체 SHP)에서 육림랜드 일대 건물만 뽑는다.
// 쓰는 법: node scripts/extract-buildings.mjs <압축 푼 폴더>/AL_D010_51_YYYYMMDD
// 결과: public/scene/buildings.json  [{ ring: [[경도, 위도]...], h: 높이(m), fl: 지상층수, use: 주용도코드, gu: 구분 }]
// 좌표계 EPSG:5186(중부원점). 필드 A16 높이(m), A26 지상층수, A8 주용도코드, A23 시군구코드.
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const proj4 = require('proj4')

const base = process.argv[2]
if (!base) { console.error('사용법: node scripts/extract-buildings.mjs <AL_D010_51_YYYYMMDD 경로(확장자 없이)>'); process.exit(1) }
const OUT = fileURLToPath(new URL('../public/scene/', import.meta.url))
const EXT = { w: 127.71400451660156, e: 127.72636413574219, n: 37.92307614140167, s: 37.913325774991655 }
proj4.defs('EPSG:5186', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
const fwd = proj4('EPSG:4326', 'EPSG:5186'), inv = proj4('EPSG:5186', 'EPSG:4326')
const corners = [[EXT.w, EXT.s], [EXT.e, EXT.s], [EXT.w, EXT.n], [EXT.e, EXT.n]].map((c) => fwd.forward(c))
const pad = 40
const bx = [Math.min(...corners.map((c) => c[0])) - pad, Math.max(...corners.map((c) => c[0])) + pad]
const by = [Math.min(...corners.map((c) => c[1])) - pad, Math.max(...corners.map((c) => c[1])) + pad]

const shx = fs.readFileSync(base + '.shx')
const shp = fs.openSync(base + '.shp', 'r')
const n = (shx.length - 100) / 8
console.log('전체 도형', n)
const hit = []
const head = Buffer.alloc(8 + 44)
for (let i = 0; i < n; i++) {
  const at = shx.readInt32BE(100 + i * 8) * 2
  fs.readSync(shp, head, 0, 52, at)
  if (head.readInt32LE(8) === 0) continue
  const xmin = head.readDoubleLE(12), ymin = head.readDoubleLE(20), xmax = head.readDoubleLE(28), ymax = head.readDoubleLE(36)
  if (xmax < bx[0] || xmin > bx[1] || ymax < by[0] || ymin > by[1]) continue
  hit.push(i)
}
console.log('범위 안 도형', hit.length)

// DBF 필드 위치
const dbf = fs.openSync(base + '.dbf', 'r')
const h = Buffer.alloc(32); fs.readSync(dbf, h, 0, 32, 0)
const hl = h.readUInt16LE(8), rl = h.readUInt16LE(10)
const fh = Buffer.alloc(hl); fs.readSync(dbf, fh, 0, hl, 0)
const off = {}
let o = 1
for (let p = 32; p < hl - 1; p += 32) { const name = fh.toString('ascii', p, p + 11).replace(/\0.*$/, ''); const len = fh[p + 16]; off[name] = [o, len]; o += len }
const str = (r, k) => (off[k] ? r.toString('latin1', off[k][0], off[k][0] + off[k][1]).trim() : '')
const num = (r, k) => { const v = parseFloat(str(r, k)); return Number.isFinite(v) ? v : 0 }

const out = []
for (const i of hit) {
  const row = Buffer.alloc(rl)
  fs.readSync(dbf, row, 0, rl, hl + i * rl)
  if (row[0] === 0x2a) continue
  const at = shx.readInt32BE(100 + i * 8) * 2, len = shx.readInt32BE(100 + i * 8 + 4) * 2
  const rec = Buffer.alloc(len + 8); fs.readSync(shp, rec, 0, len + 8, at)
  const type = rec.readInt32LE(8)
  if (type !== 5 && type !== 15 && type !== 25) continue
  const numParts = rec.readInt32LE(8 + 36), numPoints = rec.readInt32LE(8 + 40)
  const parts = []
  for (let k = 0; k < numParts; k++) parts.push(rec.readInt32LE(8 + 44 + k * 4))
  const ptsAt = 8 + 44 + numParts * 4
  for (let k = 0; k < numParts; k++) {
    const a = parts[k], b = k + 1 < numParts ? parts[k + 1] : numPoints
    const ring = []
    for (let q = a; q < b; q++) ring.push([rec.readDoubleLE(ptsAt + q * 16), rec.readDoubleLE(ptsAt + q * 16 + 8)])
    let area = 0
    for (let q = 0; q < ring.length - 1; q++) area += ring[q][0] * ring[q + 1][1] - ring[q + 1][0] * ring[q][1]
    if (area > 0 || ring.length < 4) continue // 구멍은 건너뛴다
    const ll = ring.slice(0, -1).map(([x, y]) => inv.forward([x, y]).map((v) => Number(v.toFixed(7))))
    out.push({ ring: ll, h: num(row, 'A16'), fl: Math.round(num(row, 'A26')), use: str(row, 'A8'), sgg: str(row, 'A23') })
  }
}
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(OUT + 'buildings.json', JSON.stringify(out))
const hs = out.map((b) => b.h).filter((v) => v > 0)
console.log('건물', out.length, '높이 있음', hs.length, '최대 높이', Math.max(0, ...hs), 'm')
console.log('주용도', JSON.stringify(out.reduce((m, b) => ((m[b.use] = (m[b.use] || 0) + 1), m), {})))
