// MapPage.jsx  공간 안내 지도. 왼쪽 목록과 거르기, 오른쪽 3D 장면. WebGL 을 못 쓰면 조감도 평면 지도로 바꾼다.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Minus, RotateCcw, MapPin, X } from 'lucide-react'
import { facilities, mapFilters, zone, withChar, missions, bookable } from '../lib/data'
import { toPct, SOURCES } from '../lib/geo'
import { Btn } from '../components/ui'

const detailLink = (f) => {
  if (f.programId === 'gungame') return '/play/gungame'
  if (f.programId === 'animal-cafe') return '/play/cafe'
  if (f.type.includes('ride')) return '/play/attractions#rides'
  if (f.type.includes('animal')) return '/play/attractions#zoo'
  if (f.programId === 'campground') return '/play/attractions#camp'
  return null
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

export default function MapPage() {
  const [sp, setSp] = useSearchParams()
  const [filter, setFilter] = useState(sp.get('filter') || 'all')
  const [sel, setSel] = useState(sp.get('focus') || null)
  const [ready, setReady] = useState(false)
  const [gl] = useState(hasWebGL)
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const pinEls = useRef(new Map())
  const labelsRef = useRef(null)
  const list = useMemo(() => facilities.filter((f) => filter === 'all' || f.type.includes(filter)), [filter])

  useEffect(() => {
    if (!gl || !canvasRef.current) return
    let scene
    let alive = true
    import('../three/RealParkScene').then(({ default: ParkScene }) => {
      if (!alive) return
      scene = new ParkScene(canvasRef.current, { facilities, pinEls: pinEls.current, labelsEl: labelsRef.current, onReady: () => setReady(true) })
      sceneRef.current = scene
    })
    return () => { alive = false; scene?.dispose(); sceneRef.current = null }
  }, [gl])

  useEffect(() => { sceneRef.current?.setVisible(list.map((f) => f.id)) }, [list, ready])
  useEffect(() => { if (ready && sel) sceneRef.current?.focus(sel) }, [ready]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (id) => {
    setSel(id)
    sceneRef.current?.focus(id)
    const next = new URLSearchParams(sp); next.set('focus', id); setSp(next, { replace: true })
  }
  const setF = (k) => {
    setFilter(k)
    const next = new URLSearchParams(sp); if (k === 'all') next.delete('filter'); else next.set('filter', k); setSp(next, { replace: true })
  }
  const f = sel ? facilities.find((x) => x.id === sel) : null
  const linkedMission = f ? missions.find((m) => m.facilityId === f.id) : null

  return (
    <section className="wrap section mapp">
      <h1 className="sr-only">공간 지도</h1>
      <div className="mapp__body">
        <aside className="mapp__side">
          <div className="choices" role="tablist" aria-label="시설 거르기">
            <button role="tab" aria-selected={filter === 'all'} className="choice" onClick={() => setF('all')}>전체</button>
            {mapFilters.map((m) => <button key={m.id} role="tab" aria-selected={filter === m.id} className="choice" onClick={() => setF(m.id)}>{m.label}</button>)}
          </div>
          {list.length ? (
            <ul className="mapp__list">
              {list.map((x) => (
                <li key={x.id}>
                  <button className={`mapp__row ${sel === x.id ? 'is-sel' : ''}`} onClick={() => choose(x.id)} aria-pressed={sel === x.id}>
                    <MapPin size={20} aria-hidden className="ico" />
                    <span className="mapp__rowtxt"><span className="t-strong">{withChar(x.name)}</span><span className="t-small c-sub">{zone(x.zone).name}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="t-body c-sub">이 조건에 맞는 곳이 없어요.</p>}
        </aside>
        <div className="mapp__view">
          {gl ? (
            <>
              <canvas ref={canvasRef} className="mapp__canvas" aria-label="육림랜드 3D 지도" />
              <div className="mapp__pins" ref={labelsRef}>
                {facilities.map((x) => (
                  <button key={x.id} ref={(el) => { if (el) pinEls.current.set(x.id, el); else pinEls.current.delete(x.id) }}
                    className={`pin t-small ${sel === x.id ? 'is-sel' : ''}`} onClick={() => choose(x.id)} tabIndex={-1} aria-hidden>
                    {withChar(x.name)}
                  </button>
                ))}
              </div>
              <div className="mapp__ctl">
                <button onClick={() => sceneRef.current?.zoom(0.7)} aria-label="가까이"><Plus size={24} aria-hidden /></button>
                <button onClick={() => sceneRef.current?.zoom(1.4)} aria-label="멀리"><Minus size={24} aria-hidden /></button>
                <button onClick={() => { setSel(null); sceneRef.current?.reset() }} aria-label="처음 시점"><RotateCcw size={24} aria-hidden /></button>
              </div>
              {!ready && <div className="mapp__loading t-strong" role="status">육림랜드를 불러오는 중</div>}
              <p className="mapp__src t-caption">{SOURCES}</p>
            </>
          ) : (
            <div className="mapp__flat"><div className="flatbox">
              <img src={`${import.meta.env.BASE_URL}scene/satellite.jpg`} alt="육림랜드 위성영상" />
              {list.map((x) => { const p = toPct(x.lngLat[0], x.lngLat[1]); return <button key={x.id} className={`pin pin--flat t-small ${sel === x.id ? 'is-sel' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={() => setSel(x.id)}>{withChar(x.name)}</button> })}
            </div></div>
          )}
          {f && (
            <div className="mapp__card" role="dialog" aria-label={withChar(f.name)}>
              <button className="dlg__x" onClick={() => setSel(null)} aria-label="닫기"><X size={24} aria-hidden /></button>
              <p className="t-small c-sub">{zone(f.zone).name}</p>
              <h2 className="t-card">{withChar(f.name)}</h2>
              {f.desc && <p className="t-body">{withChar(f.desc)}</p>}
              <div className="mapp__cardbtns">
                {detailLink(f) && <Btn sm variant="deep" to={detailLink(f)}>상세 안내</Btn>}
                {f.programId && bookable.includes(f.programId) && <Btn sm to={`/reserve?program=${f.programId}`}>예약</Btn>}
                {linkedMission && <Btn sm variant="primary" to={`/mission/${linkedMission.id}`}>미션 보기</Btn>}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
