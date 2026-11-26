// KMap.jsx  육림랜드 위치 지도. 지도 색을 우리 색으로 바꾸고, 가디를 중심점 표시로 쓴다.
import { useEffect, useRef } from 'react'
import { site } from '../lib/data'

export const PARK = { lng: 127.7204, lat: 37.9183 }
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
      <div className="kmap__card"><p className="t-strong">{site.name}</p><p className="t-small">{site.address}</p></div>
    </div>
  )
}
