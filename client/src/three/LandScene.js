// LandScene.js  3D팀이 만든 육림랜드 모형(public/models/land.glb)을 보여 주는 장면.
// 구역 이름표는 zones 배열의 좌표(x, z)에 놓고, 이름을 누르면 그 구역으로 카메라가 날아간다.
// 살아 움직이는 것: 대관람차, 회전그네, 곰, 양, 너구리(파일 안 애니메이션), 모닥불, 풍선.
// 누르면 반응하는 것: 위 물건들과 정문 간판, 감시탑, 폐차, 안내 간판. 눌린 물건은 말풍선을 띄우고 뛰어오르거나 빨라진다.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { detectTier, PRESET } from './quality'

const BASE = import.meta.env.BASE_URL
export const LAND_URL = BASE + 'models/land.glb'

// 눌렀을 때 말풍선과 움직임
const REACT = {
  bear: { say: '어흥!', fx: 'hop' },
  sheep: { say: '메에~', fx: 'hop' },
  raccoon: { say: '킁킁!', fx: 'hop' },
  wheel: { say: '출발~!', fx: 'boost' },
  swing: { say: '꽉 잡아!', fx: 'boost' },
  balloon: { say: '둥실~', fx: 'float' },
  fire: { say: '활활!', fx: 'flare' },
  gate: { say: '어서 와, 대원!', fx: 'float' },
  tower: { say: '이상 무!', fx: 'shake' },
  car: { say: '부릉부릉', fx: 'shake' },
  sign: { say: '작전 개시!', fx: 'shake' }
}

export default class LandScene {
  constructor(canvas, { zones, pinEls, labelsEl, onReady, onPick, url = LAND_URL, home }) {
    this.canvas = canvas
    this.zones = zones
    this.pinEls = pinEls
    this.labelsEl = labelsEl
    this.onReady = onReady
    this.onPick = onPick
    this.url = url
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.level = detectTier().tier
    this.dirty = true
    this.anim = null
    this.disposed = false
    this.mixers = []
    this.clock = new THREE.Clock()
    this.visible = new Set(zones.map((z) => z.id))
    this.homeOverride = home
    this.selected = null
    this.hover = null
    this.life = null
    this.fx = []
    this.bubbles = []
    this.lastTouch = performance.now()
    this.ray = new THREE.Raycaster()
    if (import.meta.env.DEV) window.__land = this
    this.init()
  }

  init() {
    const preset = PRESET[this.level]
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: this.level !== 'low', alpha: true, powerPreference: 'high-performance' })
    r.outputColorSpace = THREE.SRGBColorSpace
    r.setClearColor(0x000000, 0)
    r.shadowMap.enabled = preset.shadow
    r.shadowMap.type = THREE.PCFSoftShadowMap
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = 1.05
    this.renderer = r
    this.pr = Math.min(window.devicePixelRatio || 1, this.level === 'low' ? 1 : 2)
    r.setPixelRatio(this.pr)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.5, 600)

    const c = new OrbitControls(this.camera, this.canvas)
    c.enableDamping = !this.reduce
    c.dampingFactor = 0.08
    c.minDistance = 6
    c.maxDistance = 140
    c.maxPolarAngle = Math.PI * 0.48
    c.screenSpacePanning = false
    c.autoRotateSpeed = 0.5
    c.addEventListener('change', () => { this.dirty = true })
    c.addEventListener('start', () => { this.lastTouch = performance.now(); c.autoRotate = false })
    this.controls = c

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe6f5, 1.5))
    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(30, 60, 25)
    sun.castShadow = preset.shadow
    sun.shadow.mapSize.set(preset.shadowMap * 2, preset.shadowMap * 2)
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 5, far: 200 })
    sun.shadow.bias = -0.0003
    sun.shadow.normalBias = 0.04
    this.scene.add(sun, sun.target)
    this.sun = sun

    // 구역 고리. 마우스를 올린 구역과 고른 구역 바닥에 노란 고리를 둔다
    const ringGeo = new THREE.RingGeometry(0.94, 1, 72)
    const mk = (op) => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffd93d, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 5; this.scene.add(m); return m }
    this.ringHover = mk(0.75)
    this.ringSel = mk(1)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.canvas.parentElement)
    this.resize()

    // 끌기와 누르기를 가른다
    this.onDown = (e) => { this.down = { x: e.clientX, y: e.clientY, t: performance.now() } }
    this.onUp = (e) => {
      const d = this.down; this.down = null
      if (!d) return
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6 && performance.now() - d.t < 600) this.click(e)
    }
    this.onMove = (e) => { if (e.buttons) return; this.pm = e; if (!this.pmq) { this.pmq = true; requestAnimationFrame(() => { this.pmq = false; if (!this.disposed && this.pm) this.hoverAt(this.pm) }) } }
    this.onLeave = () => { this.hover = null; this.canvas.style.cursor = ''; this.dirty = true }
    this.canvas.addEventListener('pointerdown', this.onDown)
    this.canvas.addEventListener('pointerup', this.onUp)
    this.canvas.addEventListener('pointermove', this.onMove)
    this.canvas.addEventListener('pointerleave', this.onLeave)

    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
    this.load().catch((e) => { console.error(e); this.onReady?.(false) })
  }

  async load() {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    const gltf = await loader.loadAsync(this.url)
    if (this.disposed) return
    const root = gltf.scene
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false } })
    this.scene.add(root)
    this.root = root
    const box = new THREE.Box3().setFromObject(root)
    this.box = box
    const ctr = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    this.ctr = ctr
    // 그림자만 받는 바닥
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.16 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.set(ctr.x, box.min.y - 0.02, ctr.z)
    floor.receiveShadow = true
    this.scene.add(floor)
    this.sun.target.position.copy(ctr)
    this.sun.position.set(ctr.x + 30, 60, ctr.z + 25)
    const span = Math.max(size.x, size.z)
    const d = span * 1.12
    this.home = this.homeOverride
      ? { pos: new THREE.Vector3(...this.homeOverride.pos), target: new THREE.Vector3(...this.homeOverride.target) }
      : { pos: new THREE.Vector3(ctr.x - d * 0.55, d * 0.8 - 3, ctr.z + d * 0.9), target: new THREE.Vector3(ctr.x, -3, ctr.z) }
    this.camera.position.copy(this.home.pos)
    this.controls.target.copy(this.home.target)
    this.controls.update()
    for (const clip of gltf.animations) { const m = new THREE.AnimationMixer(root); m.clipAction(clip).play(); this.mixers.push(m) }
    this.setupLife(root)
    this.dirty = true
    this.onReady?.(true, { box, size, ctr })
  }

  // 움직일 물건을 이름과 위치로 찾아 묶는다. 불러오면 이름의 공백은 _ 로, 점은 없어진다(Cube.027 은 Cube027). 2026. 11. 20. 통합본부터 모닥불 이름이 Voxel_Fire_Sim 과 Voxel_Fire001 로 바뀜
  setupLife(root) {
    root.updateMatrixWorld(true)
    const byName = new Map()
    root.traverse((o) => { if (o.name) { if (!byName.has(o.name)) byName.set(o.name, []); byName.get(o.name).push(o) } })
    const v = new THREE.Vector3()
    const near = (re, x, z, r = 2) => {
      const out = []
      for (const [n, list] of byName) if (re.test(n)) for (const o of list) { o.getWorldPosition(v); if (Math.hypot(v.x - x, v.z - z) < r) out.push(o) }
      return out
    }
    const L = { actors: [], t: 0, wheel: null, swing: null, fires: [], boost: { wheel: 0, swing: 0 }, light: null }
    const tag = (o, kind) => { o.userData.kind = kind }
    const actor = (o, kind, opt = {}) => {
      tag(o, kind)
      L.actors.push({ o, kind, base: o.position.clone(), baseQ: o.quaternion.clone(), ph: Math.random() * 6.28, wander: 0, speed: 0.6, hop: 0, look: 0, sway: 0, ...opt, fxY: 0, fxR: 0 })
    }

    // 대관람차: 고리와 칸 여섯 개를 한 축에 묶어 돌리고, 칸은 항상 바로 서 있게 한다
    const ring = near(/^Circle$/, 24.45, -9.1, 1.5)[0]
    // 번호가 파일마다 바뀌므로 이름 대신 위치로 찾는다. 고리와 같은 평면(z -9.1)의 Cube 가운데
    // 기준점이 중심에서 먼 것은 칸이라 바로 서게 하고, 중심 가까이에 있는 것은 살대라 고리와 함께 돈다
    const w = new THREE.Vector3()
    const flat = near(/^Cube\d+$/, 24.45, -9.1, 3).filter((o) => { o.getWorldPosition(w); return Math.abs(w.z + 9.1) < 0.15 && Math.hypot(w.x - 24.45, w.y - 2.21) < 2.2 })
    const dist = (o) => { o.getWorldPosition(w); return Math.hypot(w.x - 24.45, w.y - 2.21) }
    const cabins = flat.filter((o) => dist(o) > 1)
    const bars = flat.filter((o) => dist(o) <= 1)
    if (ring && flat.length) {
      const hub = new THREE.Box3().setFromObject(ring).getCenter(new THREE.Vector3())
      hub.z = -9.1
      const pivot = new THREE.Group(); pivot.position.copy(hub); this.scene.add(pivot); pivot.updateMatrixWorld(true)
      const holders = []
      ;[ring, ...bars].forEach((p) => { pivot.attach(p); tag(p, 'wheel') })
      cabins.forEach((c) => { pivot.attach(c); tag(c, 'wheel'); holders.push(c) })
      const parts = [ring, ...flat]
      L.wheel = { pivot, holders: cabins.map((c) => ({ o: c, z: c.rotation.z })) }
      near(/^(Cylinder|Cube\d+)$/, 24.45, -9.1, 1.6).forEach((o) => { if (!parts.includes(o)) tag(o, 'wheel') })
    }
    // 회전그네: 의자 네 개를 가운데 기둥 둘레로 돌린다
    const chairs = near(/^Chair00[4-7]$/, 29.7, -9.3, 1.4)
    if (chairs.length) {
      const pivot = new THREE.Group(); pivot.position.set(29.7, 0, -9.3); this.scene.add(pivot); pivot.updateMatrixWorld(true)
      chairs.forEach((c) => { pivot.attach(c); tag(c, 'swing') })
      L.swing = { pivot, chairs: chairs.map((c) => ({ o: c, y: c.position.y })) }
      near(/^(Center|Floor)$/, 29.7, -9.3, 1.4).forEach((o) => tag(o, 'swing'))
    }
    // 곰, 양, 너구리
    near(/^Low_Poly_Bear(\d+)?$/, 23.9, -2.1, 2).forEach((o) => actor(o, 'bear', { wander: 0.22, speed: 0.55, hop: 0.02, look: 0.7 }))
    near(/^Low_poly_sheep(\d+)?$/, 33.8, -4.2, 2).forEach((o) => actor(o, 'sheep', { wander: 0.18, speed: 0.7, hop: 0.05, look: 0.9 }))
    near(/^Low_Poly_Raccoon(\d+)?$/, 33.9, -0.1, 2).forEach((o) => actor(o, 'raccoon', { wander: 0.04, speed: 1, hop: 0, look: 0.3 }))
    // 정문 풍선과 간판, 감시탑, 폐차, 안내 간판
    near(/^Balloons(\d+)?$/, 24.4, 6.8, 2).forEach((o) => actor(o, 'balloon', { sway: 0.05, hop: 0.05, speed: 1.1 }))
    near(/^(Text|Circle016)$/, 24.4, 6.8, 2).forEach((o) => tag(o, 'gate'))
    near(/^Watchtower_\d$/, 16.4, -1.2, 3).forEach((o) => actor(o, 'tower'))
    near(/^WreckedCar$/, 16.97, 0.03, 1).forEach((o) => actor(o, 'car'))
    near(/^Sign_SurvivalField$/, 16.55, -0.65, 1).forEach((o) => actor(o, 'sign'))
    // 모닥불
    const fires = near(/^(Voxel_Fire_Sim|Voxel_Fire\d*)$/, 18.2, -8.1, 1.2)
    fires.forEach((o) => { tag(o, 'fire'); L.fires.push({ o, s: o.scale.clone(), ph: Math.random() * 6 }) })
    if (fires.length) { const l = new THREE.PointLight(0xffa24a, 1.4, 6, 2); l.position.set(18.2, 0.9, -8.1); this.scene.add(l); L.light = l }
    this.life = L
  }

  resize() {
    const p = this.canvas.parentElement
    const w = p.clientWidth, h = p.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.dirty = true
  }

  setVisible(ids) { this.visible = new Set(ids); this.dirty = true }

  // 구역 이름표를 화면 위치로 옮긴다
  placePins() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight
    const v = new THREE.Vector3()
    for (const z of this.zones) {
      const el = this.pinEls.get(z.id)
      if (!el) continue
      v.set(z.x, (z.y ?? 3) + 0.3, z.z).project(this.camera)
      const sx = (v.x * 0.5 + 0.5) * w, sy = (-v.y * 0.5 + 0.5) * h
      const on = this.visible.has(z.id) && v.z < 1 && sx > -40 && sx < w + 40 && sy > -20 && sy < h + 20
      if (!on) { el.style.display = 'none'; continue }
      el.style.display = ''
      el.style.opacity = '1'
      el.style.pointerEvents = 'auto'
      el.style.zIndex = String(Math.round((1 - v.z) * 10000))
      el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`
    }
    for (const b of this.bubbles) {
      v.copy(b.pos); v.y += b.rise * (performance.now() - b.t0) / 1000
      v.project(this.camera)
      b.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px) translate(-50%, -100%)`
    }
  }

  // 화면 좌표에서 부딪힌 물건 찾기
  pick(e) {
    if (!this.root) return null
    const r = this.canvas.getBoundingClientRect()
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera)
    const hit = this.ray.intersectObject(this.root, true).find((h) => h.object.visible)
    return hit || null
  }

  zoneAt(p) {
    let best = null, bd = 1e9
    for (const z of this.zones) { const d = Math.hypot(p.x - z.x, p.z - z.z); if (d < (z.r || 3) + 1.2 && d < bd) { best = z; bd = d } }
    return best
  }

  kindOf(obj) { let o = obj; while (o && !o.userData.kind) o = o.parent; return o || null }

  // 관람차 살대처럼 가는 부분을 눌렀을 때도 반응하도록 가까운 놀이기구를 찾는다
  nearKind(p) {
    const L = this.life
    if (!L) return null
    if (L.wheel) { const c = L.wheel.pivot.position; if (Math.hypot(p.x - c.x, p.y - c.y) < 3.3 && Math.abs(p.z - c.z) < 1.6) return L.wheel.pivot.children[0] }
    if (L.swing) { const c = L.swing.pivot.position; if (Math.hypot(p.x - c.x, p.z - c.z) < 1.7 && p.y < 3.2) return L.swing.pivot.children[0] }
    return null
  }

  hoverAt(e) {
    const h = this.pick(e)
    const z = h ? this.zoneAt(h.point) : null
    const k = h ? this.kindOf(h.object) || this.nearKind(h.point) : null
    this.hover = z ? z.id : null
    this.canvas.style.cursor = z || k ? 'pointer' : ''
    this.dirty = true
  }

  click(e) {
    this.lastTouch = performance.now()
    const h = this.pick(e)
    if (!h) return
    const k = this.kindOf(h.object) || this.nearKind(h.point)
    if (k) this.react(k, h.point)
    const z = this.zoneAt(h.point)
    if (z) this.onPick?.(z.id)
  }

  // 눌린 물건의 반응
  react(obj, point) {
    const kind = obj.userData.kind, def = REACT[kind]
    if (!def) return
    this.say(def.say, point)
    if (this.reduce) return
    const L = this.life
    if (def.fx === 'boost' && L) L.boost[kind === 'wheel' ? 'wheel' : 'swing'] = 5
    else if (def.fx === 'flare') this.fx.push({ kind, t0: performance.now(), dur: 1400, fire: true })
    else {
      // 같은 종류 중 눌린 하나만, 정문 간판은 풍선 둘 다 움직인다
      const targets = kind === 'gate' ? L?.actors.filter((a) => a.kind === 'balloon') : L?.actors.filter((a) => a.o === obj)
      ;(targets || []).forEach((a) => this.fx.push({ a, type: def.fx, t0: performance.now(), dur: def.fx === 'float' ? 1600 : def.fx === 'shake' ? 700 : 650 }))
    }
  }

  say(text, point) {
    if (!this.labelsEl) return
    const el = document.createElement('span')
    el.className = 'bubble t-strong'
    el.textContent = text
    this.labelsEl.appendChild(el)
    const b = { el, pos: point.clone().add(new THREE.Vector3(0, 0.5, 0)), t0: performance.now(), rise: 0.5 }
    this.bubbles.push(b)
    setTimeout(() => { el.remove(); this.bubbles = this.bubbles.filter((x) => x !== b) }, 1500)
  }

  focus(id, d0) {
    const z = this.zones.find((q) => q.id === id)
    if (!z) return
    this.selected = id
    this.lastTouch = performance.now(); this.controls.autoRotate = false
    const dist = d0 || z.dist || 20
    const t = new THREE.Vector3(z.x, 1.2, z.z)
    const dir = this.camera.position.clone().sub(this.controls.target).setY(0)
    if (dir.length() < 0.001) dir.set(0.3, 0, 1)
    dir.normalize().multiplyScalar(dist * 0.78)
    this.animateTo(new THREE.Vector3(t.x + dir.x, t.y + dist * 0.62, t.z + dir.z), t)
  }

  reset() { this.selected = null; this.lastTouch = performance.now(); if (this.home) this.animateTo(this.home.pos.clone(), this.home.target.clone()) }

  zoom(f) {
    const off = this.camera.position.clone().sub(this.controls.target)
    const len = THREE.MathUtils.clamp(off.length() * f, this.controls.minDistance, this.controls.maxDistance)
    this.animateTo(this.controls.target.clone().add(off.setLength(len)), this.controls.target.clone())
  }

  animateTo(pos, target) {
    if (this.reduce) { this.camera.position.copy(pos); this.controls.target.copy(target); this.controls.update(); this.dirty = true; return }
    this.anim = { t0: performance.now(), dur: 900, p0: this.camera.position.clone(), t0v: this.controls.target.clone(), p1: pos, t1: target }
    this.dirty = true
  }

  // 매 장면 움직임
  updateLife(dt) {
    const L = this.life
    if (!L) return
    L.t += dt
    const t = L.t, now = performance.now()
    // 눌러서 생긴 움직임 값을 모은다
    for (const a of L.actors) { a.fxY = 0; a.fxR = 0 }
    let flare = 0
    this.fx = this.fx.filter((f) => {
      const k = (now - f.t0) / f.dur
      if (k >= 1) return false
      if (f.fire) { flare = Math.max(flare, Math.sin(Math.PI * Math.min(1, k * 1.2)) * 0.8); return true }
      const s = 1 - k
      if (f.type === 'hop') f.a.fxY = Math.abs(Math.sin(k * Math.PI * 2)) * 0.32 * s
      else if (f.type === 'float') f.a.fxY = Math.sin(k * Math.PI) * 0.7
      else if (f.type === 'shake') f.a.fxR = Math.sin(k * 40) * 0.09 * s
      return true
    })
    for (const a of L.actors) {
      const o = a.o
      const dx = Math.sin(t * a.speed + a.ph) * a.wander, dz = Math.cos(t * a.speed * 0.8 + a.ph * 1.3) * a.wander
      const bob = a.hop ? Math.abs(Math.sin(t * a.speed * 2 + a.ph)) * a.hop : 0
      o.position.set(a.base.x + dx, a.base.y + bob + a.fxY, a.base.z + dz)
      const yaw = a.look ? Math.sin(t * 0.5 + a.ph) * a.look : 0
      const roll = a.sway ? Math.sin(t * a.speed + a.ph) * a.sway : 0
      o.quaternion.copy(a.baseQ).premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, roll + a.fxR)))
    }
    if (L.wheel) {
      L.boost.wheel = Math.max(0, L.boost.wheel - dt * 1.2)
      L.wheel.pivot.rotation.z -= (0.22 + L.boost.wheel) * dt
      for (const c of L.wheel.holders) c.o.rotation.z = c.z - L.wheel.pivot.rotation.z
    }
    if (L.swing) {
      L.boost.swing = Math.max(0, L.boost.swing - dt * 1.2)
      L.swing.pivot.rotation.y += (0.9 + L.boost.swing * 1.6) * dt
      const lift = Math.sin(t * 0.9) * 0.05 * (1 + L.boost.swing)
      for (const c of L.swing.chairs) c.o.position.y = c.y + lift
    }
    for (const f of L.fires) {
      const s = 1 + 0.12 * Math.sin(t * 9 + f.ph) + 0.06 * Math.sin(t * 17 + f.ph * 2) + flare
      f.o.scale.set(f.s.x * (1 + (s - 1) * 0.5), f.s.y * s, f.s.z * (1 + (s - 1) * 0.5))
    }
    if (L.light) L.light.intensity = 1.2 + 0.35 * Math.sin(t * 11) + 0.2 * Math.sin(t * 23) + flare * 3
    // 구역 고리
    const place = (m, id, a) => {
      const z = id && this.zones.find((q) => q.id === id)
      if (!z) { m.visible = false; return }
      m.visible = true
      const r = (z.r || 3) * (1 + 0.025 * Math.sin(t * 3))
      m.position.set(z.x, 0.34, z.z); m.scale.set(r, r, 1)
      m.material.opacity = a
    }
    place(this.ringSel, this.selected, 0.95)
    place(this.ringHover, this.hover && this.hover !== this.selected ? this.hover : null, 0.6)
  }

  loop() {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(this.clock.getDelta(), 0.05)
    let need = this.dirty
    if (this.anim) {
      const a = this.anim
      const k = Math.min(1, (performance.now() - a.t0) / a.dur)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      this.camera.position.lerpVectors(a.p0, a.p1, e)
      this.controls.target.lerpVectors(a.t0v, a.t1, e)
      if (k >= 1) this.anim = null
      need = true
    }
    if (!this.reduce) {
      // 한참 만지지 않으면 천천히 돈다
      this.controls.autoRotate = !this.selected && !this.anim && performance.now() - this.lastTouch > 6000
      this.mixers.forEach((m) => m.update(dt))
      this.updateLife(dt)
      need = true
    }
    if (this.controls.update()) need = true
    if (need) {
      this.renderer.render(this.scene, this.camera)
      this.placePins()
      this.dirty = false
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    this.canvas.removeEventListener('pointerdown', this.onDown)
    this.canvas.removeEventListener('pointerup', this.onUp)
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerleave', this.onLeave)
    this.bubbles.forEach((b) => b.el.remove())
    this.controls?.dispose()
    this.scene?.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { for (const k in m) if (m[k]?.isTexture) m[k].dispose(); m.dispose() }) } })
    this.renderer?.dispose()
  }
}
