// store.jsx  미션 스탬프, 예약, 알림 신청을 이 기기 IndexedDB 에 담는다.
// IndexedDB 를 못 쓰는 브라우저에서는 이 화면을 여는 동안만 기억한다. 어느 쪽이든 화면은 그대로 돈다.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const DB = 'yookrim', STORE = 'kv', KEY = 'state'
const empty = { missions: {}, reservations: [], alerts: {}, persisted: false }

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('no idb'))
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function load() {
  const db = await openDb()
  return new Promise((resolve) => {
    const r = db.transaction(STORE).objectStore(STORE).get(KEY)
    r.onsuccess = () => resolve(r.result || null)
    r.onerror = () => resolve(null)
  })
}
async function save(v) {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(v, KEY)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => resolve(false)
  })
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(empty)
  const [ready, setReady] = useState(false)
  const okRef = useRef(true)

  const loadedRef = useRef(false)
  useEffect(() => {
    // 한 번만 읽는다. 읽는 사이에 생긴 기록은 지우지 않고 합친다
    if (loadedRef.current) return
    loadedRef.current = true
    load().then((v) => {
      setState((s) => {
        if (!v) return { ...s, persisted: true }
        const known = new Set(s.reservations.map((r) => r.no))
        const valid = Object.fromEntries(Object.entries(v.missions || {}).filter(([k]) => /^[1-8]$/.test(k)))
        return { ...empty, ...v, missions: { ...valid, ...s.missions }, reservations: [...s.reservations, ...(v.reservations || []).filter((r) => !known.has(r.no))], alerts: { ...(v.alerts || {}), ...s.alerts }, persisted: true }
      })
    })
      .catch(() => { okRef.current = false })
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready || !okRef.current) return
    const { persisted, ...rest } = state
    save(rest).catch(() => { okRef.current = false })
  }, [state, ready])

  const api = useMemo(() => ({
    ...state,
    ready,
    stamp: (id) => setState((s) => (s.missions[id] ? s : { ...s, missions: { ...s.missions, [id]: new Date().toISOString() } })),
    resetMissions: () => setState((s) => ({ ...s, missions: {} })),
    addReservation: (r) => setState((s) => ({ ...s, reservations: [r, ...s.reservations] })),
    cancelReservation: (no) => setState((s) => ({ ...s, reservations: s.reservations.filter((r) => r.no !== no) })),
    toggleAlert: (id) => setState((s) => ({ ...s, alerts: { ...s.alerts, [id]: !s.alerts[id] } }))
  }), [state, ready])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
