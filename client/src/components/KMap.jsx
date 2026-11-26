// KMap.jsx  육림랜드 위치 지도. 지도 색을 우리 색으로 바꾸고, 가디를 중심점 표시로 쓴다.
import { useEffect, useRef } from 'react'
import { site } from '../lib/data'

export const PARK = { lng: 127.7204, lat: 37.9183 }
// OpenStreetMap에 등록된 육림랜드 부지 경계
const AREA = [[127.719258, 37.917376], [127.719883, 37.91725], [127.719877, 37.917351], [127.720075, 37.917346], [127.720123, 37.917335], [127.720397, 37.917293], [127.720466, 37.917284], [127.720578, 37.917269], [127.721088, 37.917232], [127.72108, 37.917665], [127.721032, 37.918922], [127.720804, 37.919371], [127.720202, 37.919521], [127.719258, 37.917376]]
const inside = (x, y) => { let c = false; for (let i = 0, j = AREA.length - 1; i < AREA.length; j = i++) { const [xi, yi] = AREA[i], [xj, yj] = AREA[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c } return c }
// 부지 안에 소나무를 흩어 심는다. 같은 값이 나오도록 고정된 난수를 쓴다
function pines() {
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const pts = []; let tries = 0
  while (pts.length < 90 && tries++ < 4000) {
    const x = 127.7192 + rnd() * 0.0019, y = 37.9172 + rnd() * 0.0023
    if (!inside(x, y)) continue
    if (Math.hypot((x - PARK.lng) * 88000, (y - PARK.lat) * 111000) < 20) continue
    if (pts.some(([a, b]) => Math.hypot((x - a) * 88000, (y - b) * 111000) < 11)) continue
    pts.push([x, y])
  }
  return pts
}
function pineImage() {
  const w = 56, h = 72, c = document.createElement('canvas'); c.width = w; c.height = h
  const g = c.getContext('2d')
  g.fillStyle = '#8A5A2B'; g.fillRect(25, 54, 6, 14)
  const tier = (y, half, top, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(28, top); g.lineTo(28 + half, y); g.lineTo(28 - half, y); g.closePath(); g.fill() }
  tier(60, 22, 30, '#2E8B3E'); tier(46, 19, 17, '#37A04A'); tier(32, 15, 4, '#45B658')
  return g.getImageData(0, 0, w, h)
}
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
const C = { land: '#EEF7E8', water: '#8ED3F5', wood: '#B7E09C', grass: '#CDEBB4', park: '#CDEBB4', soft: '#E3F1D8', road: '#FFFFFF', roadEdge: '#D2E6C6', major: '#FFE7A0', majorEdge: '#EBCB66', text: '#1F5A2A', halo: '#FFFFFF' }

// 받아 온 지도 문서의 색을 우리 색으로 바꾼다
function recolor(style) {
  const set = (l, key, val) => { l.paint = { ...(l.paint || {}), [key]: val } }
  style.layers = style.layers.filter((l) => !/^poi|highway-shield|^road_one_way|aerialway|housenumber/.test(l.id))
  for (const l of style.layers) {
    const id = l.id
    if (l.type === 'background') set(l, 'background-color', C.land)
    else if (l.type === 'raster') l.layout = { visibility: 'none' }
    else if (l.type === 'fill-extrusion') { set(l, 'fill-extrusion-color', '#E2EBDA'); set(l, 'fill-extrusion-opacity', 0.9) }
    else if (l.type === 'fill') {
      if (/^water/.test(id)) set(l, 'fill-color', C.water)
      else if (/wood/.test(id)) set(l, 'fill-color', C.wood)
      else if (/grass|park|pitch|track/.test(id)) { set(l, 'fill-color', C.grass); l.paint['fill-opacity'] = 1 }
      else if (/^building/.test(id)) set(l, 'fill-color', '#E2EBDA')
      else if (/landuse|landcover/.test(id)) set(l, 'fill-color', C.soft)
    } else if (l.type === 'line') {
      if (/^waterway/.test(id)) set(l, 'line-color', C.water)
      else if (/casing/.test(id)) set(l, 'line-color', /motorway|trunk|primary/.test(id) ? C.majorEdge : C.roadEdge)
      else if (/^(road|bridge|tunnel)_/.test(id) && !/rail/.test(id)) set(l, 'line-color', /motorway|trunk_primary|secondary/.test(id) ? C.major : C.road)
      else if (/rail/.test(id)) set(l, 'line-color', '#CFE0C4')
      else if (/boundary/.test(id)) set(l, 'line-color', '#C8DDBB')
    } else if (l.type === 'symbol') {
      if (l.layout && l.layout['text-field']) l.layout['text-field'] = ['coalesce', ['get', 'name:ko'], ['get', 'name']]
      set(l, 'text-color', C.text); set(l, 'text-halo-color', C.halo); set(l, 'text-halo-width', 1.4)
    }
  }
  return style
}

export default function KMap({ className = '', zoom = 16 }) {
  const box = useRef(null)
  useEffect(() => {
    let map, dead = false, io
    const start = async () => { try {
      const [mod, style] = await Promise.all([
        import('maplibre-gl'),
        fetch(STYLE_URL).then((r) => r.json()),
        import('maplibre-gl/dist/maplibre-gl.css')
      ])
      const maplibregl = mod.default || mod
      if (dead || !box.current) return
      map = new maplibregl.Map({ container: box.current, style: recolor(style), center: [PARK.lng, PARK.lat], zoom, attributionControl: { compact: true }, scrollZoom: false, dragRotate: false, pitchWithRotate: false, touchPitch: false })
      map.touchZoomRotate.disableRotation()
      map.on('load', () => {
        const firstLabel = map.getStyle().layers.find((l) => l.type === 'symbol')?.id
        map.addSource('area', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [AREA] } } })
        map.addLayer({ id: 'area-fill', type: 'fill', source: 'area', paint: { 'fill-color': '#7ACB52' } }, firstLabel)
        map.addImage('pine', pineImage(), { pixelRatio: 2 })
        map.addSource('pines', { type: 'geojson', data: { type: 'FeatureCollection', features: pines().map((c) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: c } })) } })
        map.addLayer({ id: 'pines', type: 'symbol', source: 'pines', layout: { 'icon-image': 'pine', 'icon-allow-overlap': true, 'icon-anchor': 'bottom', 'icon-size': ['interpolate', ['linear'], ['zoom'], 14, 0.45, 16, 0.8, 18, 1.6] } })
        map.addSource('name', { type: 'geojson', data: { type: 'Feature', properties: { name: site.name }, geometry: { type: 'Point', coordinates: [PARK.lng, PARK.lat] } } })
        map.addLayer({ id: 'name', type: 'symbol', source: 'name', layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 14, 14, 17, 22], 'text-anchor': 'top', 'text-offset': [0, 2.2], 'text-allow-overlap': true }, paint: { 'text-color': '#1F5A2A', 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 } })
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
      const el = document.createElement('a')
      el.className = 'kmap__pin'; el.href = `https://map.kakao.com/link/to/${encodeURIComponent(site.name)},${PARK.lat},${PARK.lng}`; el.target = '_blank'; el.rel = 'noreferrer'; el.setAttribute('aria-label', '육림랜드 길찾기')
      const img = document.createElement('img'); img.src = `${import.meta.env.BASE_URL}images/gadi/pin.png`; img.alt = ''; img.width = 64; img.height = 64
      el.appendChild(img)
      new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([PARK.lng, PARK.lat]).addTo(map)
    } catch (e) { console.error('지도 불러오기 실패', e) } }
    // 화면 근처에 왔을 때만 지도를 불러온다
    io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); start() } }, { rootMargin: '400px' })
    io.observe(box.current)
    return () => { dead = true; if (io) io.disconnect(); if (map) map.remove() }
  }, [zoom])
  return (
    <div className={`kmap ${className}`}>
      <div ref={box} className="kmap__canvas" role="region" aria-label="육림랜드 위치 지도" />
      <div className="kmap__card"><p className="t-strong">{site.name}</p><p className="t-small">{site.address}</p><p className="t-small kmap__hours">평일 {site.hours.weekday.replace('-', ' - ')}, 주말 {site.hours.weekend.replace('-', ' - ')}, {site.hours.closedDay} 휴무</p></div>
    </div>
  )
}
