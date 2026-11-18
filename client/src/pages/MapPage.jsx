// MapPage.jsx  공간 지도. 3D팀이 만든 육림랜드 모형을 돌리고 확대해 구역을 둘러보고,
// "실제 위치"로 바꾸면 같은 구역 모형이 위성영상 위 실제 자리에 올라간다. WebGL 을 못 쓰면 구역 사진 목록으로 보여 준다.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Minus, RotateCcw, X } from 'lucide-react'
import { facilities, withChar, missions, bookable } from '../lib/data'
import { SOURCES } from '../lib/geo'
import { Btn, Photo } from '../components/ui'
import zonesData from '../data/zones3d.json'

const zones = zonesData.zones.map((z) => {
  const f = facilities.find((x) => x.id === z.geo)
  return { ...z, lngLat: f?.lngLat }
})
// 예전 주소의 시설 id(예: gungame-base)도 그 시설이 든 구역으로 풀어 준다
const resolve = (id) => zones.find((z) => z.id === id)?.id || zones.find((z) => z.facilities.includes(id))?.id || null
const facName = (id) => withChar(facilities.find((f) => f.id === id)?.name || '')

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

export default function MapPage() {
  const [sp, setSp] = useSearchParams()
  const [mode, setMode] = useState(sp.get('mode') === 'real' ? 'real' : 'model')
  const [sel, setSel] = useState(resolve(sp.get('focus')))
  const [ready, setReady] = useState(false)
  const [gl] = useState(hasWebGL)
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const pinEls = useRef(new Map())
  const labelsRef = useRef(null)
  const selRef = useRef(sel)
  selRef.current = sel

  useEffect(() => {
    if (!gl || !canvasRef.current) return
    let scene
    let alive = true
    setReady(false)
    const done = () => { if (!alive) return; setReady(true); if (selRef.current) scene?.focus(selRef.current, dist(selRef.current)) }
    if (mode === 'model') {
      import('../three/LandScene').then(({ default: Land }) => {
        if (!alive) return
        scene = new Land(canvasRef.current, { zones, pinEls: pinEls.current, labelsEl: labelsRef.current, onReady: () => setTimeout(done, 0) })
        sceneRef.current = scene
      })
    } else {
      import('../three/RealParkScene').then(({ default: Park }) => {
        if (!alive) return
        const list = zones.filter((z) => z.lngLat).map((z) => ({ id: z.id, name: z.name, lngLat: z.lngLat }))
        scene = new Park(canvasRef.current, { facilities: list, zones: zones.filter((z) => z.lngLat), pinEls: pinEls.current, labelsEl: labelsRef.current, onReady: () => setTimeout(done, 0) })
        sceneRef.current = scene
      })
    }
    return () => { alive = false; scene?.dispose(); sceneRef.current = null }
  }, [gl, mode])

  const dist = (id) => (mode === 'real' ? zones.find((q) => q.id === id)?.realDist : undefined)
  const put = (k, v) => { const next = new URLSearchParams(sp); if (v) next.set(k, v); else next.delete(k); setSp(next, { replace: true }) }
  const choose = (id) => {
    setSel(id)
    sceneRef.current?.focus(id, dist(id))
    put('focus', id)
  }
  const close = () => { setSel(null); put('focus', null); sceneRef.current?.reset() }
  const swap = (m) => { if (m !== mode) { setMode(m); put('mode', m === 'real' ? 'real' : null) } }
  const z = sel ? zones.find((x) => x.id === sel) : null
  const mission = useMemo(() => (z ? missions.find((m) => z.facilities.includes(m.facilityId)) : null), [z])

  return (
    <section className="wrap section mapp">
      <h1 className="sr-only">공간 지도</h1>
      <div className="mapp__body">
        <aside className="mapp__side">
          <div className="choices" role="tablist" aria-label="지도 보기">
            <button role="tab" aria-selected={mode === 'model'} className="choice" onClick={() => swap('model')}>우리 모형</button>
            <button role="tab" aria-selected={mode === 'real'} className="choice" onClick={() => swap('real')}>실제 위치</button>
          </div>
          <ul className="mapp__list">
            {zones.map((x) => (
              <li key={x.id}>
                <button className={`mapp__row ${sel === x.id ? 'is-sel' : ''}`} onClick={() => choose(x.id)} aria-pressed={sel === x.id}>
                  <img className="mapp__thumb" src={`${import.meta.env.BASE_URL}images/zones/${x.id}.jpg`} alt="" width="72" height="54" loading="lazy" />
                  <span className="mapp__rowtxt"><span className="t-strong">{x.name}</span><span className="t-small c-sub">{x.sub}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="mapp__view">
          <div className={`mapp__stage ${mode === 'model' ? 'mapp__stage--land' : ''}`}>
          {gl ? (
            <>
              <canvas key={mode} ref={canvasRef} className="mapp__canvas" aria-label={mode === 'model' ? '육림랜드 3D 모형' : '육림랜드 실제 위치 3D 지도'} />
              <div className="mapp__pins" ref={labelsRef}>
                {zones.map((x) => (
                  <button key={`${mode}-${x.id}`} ref={(el) => { if (el) pinEls.current.set(x.id, el); else pinEls.current.delete(x.id) }}
                    className={`pin t-small ${sel === x.id ? 'is-sel' : ''}`} onClick={() => choose(x.id)} tabIndex={-1} aria-hidden>
                    {x.name}
                  </button>
                ))}
              </div>
              <div className="mapp__ctl">
                <button onClick={() => sceneRef.current?.zoom(0.7)} aria-label="가까이"><Plus size={24} aria-hidden /></button>
                <button onClick={() => sceneRef.current?.zoom(1.4)} aria-label="멀리"><Minus size={24} aria-hidden /></button>
                <button onClick={close} aria-label="처음 시점"><RotateCcw size={24} aria-hidden /></button>
              </div>
              {!ready && <div className="mapp__loading t-strong" role="status">육림랜드를 불러오는 중</div>}
              <p className="mapp__src t-caption">{mode === 'real' ? SOURCES : '끌어서 돌리고 굴려서 확대해요'}</p>
            </>
          ) : (
            <ul className="mapp__flat mapp__flatlist">
              {zones.map((x) => <li key={x.id}><Photo slot={`zone-${x.id}`} ratio="4 / 3" round /><p className="t-label">{x.name}</p></li>)}
            </ul>
          )}
          </div>
          {z && (
            <div className="mapp__card" role="dialog" aria-label={z.name}>
              <button className="dlg__x" onClick={close} aria-label="닫기"><X size={24} aria-hidden /></button>
              <p className="t-small c-sub">{z.sub}</p>
              <h2 className="t-card">{z.name}</h2>
              <p className="t-body">{z.desc}</p>
              <p className="t-small c-sub">{z.facilities.map(facName).join(', ')}</p>
              <div className="mapp__cardbtns">
                {z.links.map((l, i) => <Btn key={l.label} sm variant={i === 0 ? 'deep' : 'light'} to={l.to}>{l.label}</Btn>)}
                {z.program && bookable.includes(z.program) && <Btn sm to={`/reserve?program=${z.program}`}>예약</Btn>}
                {mission && <Btn sm variant="primary" to={`/mission/${mission.id}`}>미션 보기</Btn>}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
