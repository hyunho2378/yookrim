// RealParkScene.js 춘천 육림랜드 3D 지도 장면. 실제 자료만 쓴다.
//   바닥 영상  국토교통부 브이월드 위성영상 z19(public/scene/satellite.jpg)
//   지형      AWS Terrain Tiles(public/scene/dem.bin)
//   건물과 길  OpenStreetMap(public/scene/osm.json)
//   나무      위성영상에서 짙은 녹색 칸을 골라 세운 위치(public/scene/trees.bin)
// 모두 scripts/bake-yookrim.mjs 가 받아 굽는다. 시설 이름표는 facilities.json 의 경위도 위치에 놓는다.
// 장치 등급 판정(quality.js)과 태양 위치(sun.js)는 Strata 코드를 가져와 쓴다.
// 스캔 모델 public/models/yookrim.glb 가 있으면 건물 모양을 그 모델로 바꾼다(이름이 pin_<시설 id> 인 빈 객체는 이름표 위치로 쓴다).
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { detectTier, PRESET, FrameMonitor, stepLevel } from './quality'
import { sunDirection } from './sun'
import { CENTER, EXTENT, toXZ, fromSat, M_PER_PX } from '../lib/geo'
import { scene as P } from '../tokens'

const EXAG = 1.6      // 높이 과장 배율
const N = 161         // 지형 격자 한 변
const BASE = import.meta.env.BASE_URL
const SCAN_URL = BASE + 'models/yookrim.glb'

const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o })

export default class RealParkScene {
  constructor(canvas, { facilities, pinEls, labelsEl, onReady, onMode }) {
    this.canvas = canvas
    this.facilities = facilities
    this.pinEls = pinEls
    this.labelsEl = labelsEl
    this.onReady = onReady
    this.onMode = onMode
    this.pins = new Map()
    this.ctx = []
    this.visible = new Set(facilities.map((f) => f.id))
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.tierInfo = detectTier()
    this.level = this.tierInfo.tier
    this.monitor = new FrameMonitor()
    this.dirty = true
    this.anim = null
    this.disposed = false
    this.hmin = 0
    this.init()
  }

  init() {
    const preset = PRESET[this.level]
    const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: this.level !== 'low', powerPreference: 'high-performance' })
    r.outputColorSpace = THREE.SRGBColorSpace
    r.toneMapping = THREE.NoToneMapping
    r.shadowMap.enabled = preset.shadow
    r.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer = r
    this.applyPixelRatio()

    const s = new THREE.Scene()
    s.background = new THREE.Color(P.sky)
    s.fog = new THREE.Fog(P.sky, 900, 2600)
    this.scene = s

    this.camera = new THREE.PerspectiveCamera(38, 1, 2, 6000)
    this.home = { pos: new THREE.Vector3(-30, 175, 195), target: new THREE.Vector3(25, 0, -8) }

    const c = new OrbitControls(this.camera, this.canvas)
    c.enableDamping = !this.reduce
    c.dampingFactor = 0.08
    c.minDistance = 22
    c.maxDistance = 1300
    c.maxPolarAngle = Math.PI * 0.47
    c.screenSpacePanning = false
    c.addEventListener('change', () => { this.dirty = true })
    this.controls = c

    // 낮 3시 춘천의 해
    const d = new Date(); d.setHours(15, 0, 0, 0)
    const sd = sunDirection(d, CENTER.lat, CENTER.lon)
    const dir = new THREE.Vector3(sd.x, Math.max(sd.y, Math.sin(Math.PI * 38 / 180)), sd.z).normalize()
    s.add(new THREE.HemisphereLight(0xffffff, 0xb9c4a8, 1.55))
    const sun = new THREE.DirectionalLight(0xfff3dc, 1.35)
    sun.position.copy(dir.clone().multiplyScalar(900))
    sun.castShadow = preset.shadow
    sun.shadow.mapSize.set(preset.shadowMap * 2, preset.shadowMap * 2)
    const sc = sun.shadow.camera; sc.left = -420; sc.right = 420; sc.top = 420; sc.bottom = -420; sc.near = 50; sc.far = 2200
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.6
    sun.target.position.set(0, 0, 0)
    s.add(sun, sun.target)
    this.sun = sun

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.canvas.parentElement)
    this.resize()
    this.camera.position.copy(this.home.pos)
    c.target.copy(this.home.target)
    c.update()

    this.loop = this.loop.bind(this)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.loop)
    this.load().catch((e) => { console.error(e); this.onMode?.('error') })
  }

  applyPixelRatio() {
    const preset = PRESET[this.level]
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * preset.pixelRatio / 1.25)
  }

  async load() {
    const [demBuf, osm, nsdi, treeBuf] = await Promise.all([
      fetch(BASE + 'scene/dem.bin').then((r) => r.arrayBuffer()),
      fetch(BASE + 'scene/osm.json').then((r) => r.json()),
      fetch(BASE + 'scene/buildings.json').then((r) => r.json()),
      fetch(BASE + 'scene/trees.bin').then((r) => r.arrayBuffer())
    ])
    this.dem = new Float32Array(demBuf)
    this.hmin = Math.min(...this.dem)
    this.buildGround()
    await this.loadTexture()
    this.buildBuildings(nsdi)
    this.buildRoads(osm)
    this.buildOutline(osm)
    this.buildStructures()
    this.buildTrees(new Float32Array(treeBuf))
    this.buildPins(osm)
    this.onMode?.('real')
    this.dirty = true
    this.onReady?.()
    this.tryScan()
  }

  // 지형 높이(m)와 장면 높이
  hAt(x, z) {
    const u = (x - this.x0) / (this.x1 - this.x0), v = (z - this.z0) / (this.z1 - this.z0)
    const fx = Math.min(Math.max(u, 0), 1) * (N - 1), fz = Math.min(Math.max(v, 0), 1) * (N - 1)
    const i = Math.min(N - 2, Math.floor(fx)), j = Math.min(N - 2, Math.floor(fz))
    const tx = fx - i, tz = fz - j
    const g = (a, b) => this.dem[b * N + a]
    const h = g(i, j) * (1 - tx) * (1 - tz) + g(i + 1, j) * tx * (1 - tz) + g(i, j + 1) * (1 - tx) * tz + g(i + 1, j + 1) * tx * tz
    return (h - this.hmin) * EXAG
  }

  buildGround() {
    const [x0, z0] = toXZ(EXTENT.w, EXTENT.n)
    const [x1, z1] = toXZ(EXTENT.e, EXTENT.s)
    this.x0 = x0; this.x1 = x1; this.z0 = z0; this.z1 = z1
    const pos = new Float32Array(N * N * 3), uv = new Float32Array(N * N * 2)
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i
      pos[k * 3] = x0 + ((x1 - x0) * i) / (N - 1)
      pos[k * 3 + 1] = (this.dem[k] - this.hmin) * EXAG
      pos[k * 3 + 2] = z0 + ((z1 - z0) * j) / (N - 1)
      uv[k * 2] = i / (N - 1)
      uv[k * 2 + 1] = 1 - j / (N - 1)
    }
    const idx = []
    for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
      const a = j * N + i, b = a + 1, c = a + N, d = c + 1
      idx.push(a, c, b, b, c, d)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    this.groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const m = new THREE.Mesh(g, this.groundMat)
    m.receiveShadow = true
    this.ground = m
    this.scene.add(m)
    // 영상 바깥은 같은 색 바닥으로 이어 준다
    const skirt = new THREE.Mesh(new THREE.CircleGeometry(4000, 48), mat(P.ground))
    skirt.rotation.x = -Math.PI / 2
    skirt.position.y = -2
    this.scene.add(skirt)
  }

  loadTexture() {
    return new Promise((resolve) => {
      new THREE.TextureLoader().load(BASE + 'scene/satellite.jpg', (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy())
        this.groundMat.map = t
        this.groundMat.needsUpdate = true
        this.dirty = true
        resolve()
      }, undefined, resolve)
    })
  }

  ringXZ(ring) { return ring.map(([lon, lat]) => toXZ(lon, lat)) }

  // 국토교통부 GIS건물통합정보의 건물 윤곽을 높이만큼 세운다. 높이가 비어 있으면 층수, 그것도 없으면 넓이로 정한다
  buildBuildings(list) {
    const g = new THREE.Group()
    const top = mat(P.roof), side = mat(P.wall)
    for (const b of list) {
      const pts = this.ringXZ(b.ring)
      if (pts.length < 3) continue
      let area = 0
      for (let i = 0; i < pts.length; i++) { const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % pts.length]; area += x1 * z2 - x2 * z1 }
      area = Math.abs(area) / 2
      if (area < 6) continue
      const h = b.h > 0 ? b.h : b.fl > 0 ? b.fl * 3.2 : area > 1500 ? 5.5 : area > 200 ? 5 : 3.6
      const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))
      const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false })
      geo.rotateX(-Math.PI / 2)
      const base = Math.min(...pts.map(([x, z]) => this.hAt(x, z)))
      const m = new THREE.Mesh(geo, [top, side])
      m.position.y = base
      m.castShadow = true; m.receiveShadow = true
      g.add(m)
    }
    this.scene.add(g)
    this.buildingGroup = g
  }

  // 도로. 지형을 따라 얇은 검은 띠로 깔아 길이 읽히게 한다
  buildRoads(osm) {
    const width = { secondary: 5, tertiary: 4, tertiary_link: 3.2, residential: 3, unclassified: 3, service: 2.2, track: 2, cycleway: 1.6, footway: 1.2, path: 1 }
    const pos = [], idx = []
    let v = 0
    for (const r of osm.roads) {
      const w = (width[r.kind] || 0) / 2
      if (!w || r.bridge) continue
      const pts = this.ringXZ(r.pts)
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, z1] = pts[i], [x2, z2] = pts[i + 1]
        const L = Math.hypot(x2 - x1, z2 - z1); if (L < 0.3) continue
        const ox = (-(z2 - z1) / L) * w, oz = ((x2 - x1) / L) * w
        pos.push(x1 + ox, this.hAt(x1, z1) + 0.25, z1 + oz, x1 - ox, this.hAt(x1, z1) + 0.25, z1 - oz, x2 + ox, this.hAt(x2, z2) + 0.25, z2 + oz, x2 - ox, this.hAt(x2, z2) + 0.25, z2 - oz)
        idx.push(v, v + 1, v + 2, v + 2, v + 1, v + 3); v += 4
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx)
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: P.dark, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }))
    m.renderOrder = 1
    this.scene.add(m)
  }

  // 육림랜드 경계선. 지형을 따라 붉은 띠로 둘러 준다
  buildOutline(osm) {
    const park = osm.areas.find((a) => a.kind === 'tourism:theme_park')
    if (!park) return
    const pts = this.ringXZ(park.ring)
    const W = 1.4
    const pos = [], idx = []
    pts.forEach(([x, z], i) => {
      const [px, pz] = pts[(i - 1 + pts.length) % pts.length], [nx, nz] = pts[(i + 1) % pts.length]
      let dx = nx - px, dz = nz - pz; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L
      const ox = -dz * W, oz = dx * W
      pos.push(x + ox, this.hAt(x + ox, z + oz) + 0.6, z + oz, x - ox, this.hAt(x - ox, z - oz) + 0.6, z - oz)
    })
    for (let i = 0; i < pts.length; i++) { const a = i * 2, b = ((i + 1) % pts.length) * 2; idx.push(a, a + 1, b, b, a + 1, b + 1) }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals()
    this.scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: P.lime, side: THREE.DoubleSide })))
  }

  // 위성영상에서 모양을 읽어 세운 구조물(놀이기구와 공연장). 위치와 크기는 영상 픽셀을 미터로 바꾼 값이고 높이는 모양에 맞춰 정했다
  buildStructures() {
    const g = new THREE.Group()
    const grey = mat(P.roof), side = mat(P.wall), dark = mat(P.dark), lime = new THREE.MeshLambertMaterial({ color: P.lime })
    const at = (cx, cy) => { const [lon, lat] = fromSat(cx + 1800, cy + 1400); const [x, z] = toXZ(lon, lat); return [x, z, this.hAt(x, z)] }
    const add = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; o.castShadow = true; o.receiveShadow = true; g.add(o); return o }
    const pxm = (p) => p * M_PER_PX
    // 회전그네: 원판과 가운데 기둥, 위쪽 회전 고리
    { const [x, z, y] = at(392, 708); const r = pxm(30)
      add(new THREE.CylinderGeometry(r, r, 0.8, 40), grey, x, y + 0.4, z)
      add(new THREE.CylinderGeometry(0.7, 1.0, 15, 12), side, x, y + 7.8, z)
      add(new THREE.TorusGeometry(r * 0.85, 0.5, 8, 40), lime, x, y + 13, z, Math.PI / 2)
      add(new THREE.ConeGeometry(r * 0.9, 2.2, 40), grey, x, y + 15, z) }
    // 회전목마: 낮은 원판과 원뿔 지붕
    { const [x, z, y] = at(318, 764); const r = pxm(21)
      add(new THREE.CylinderGeometry(r, r, 0.8, 32), grey, x, y + 0.4, z)
      add(new THREE.CylinderGeometry(0.5, 0.5, 5, 10), side, x, y + 3, z)
      add(new THREE.ConeGeometry(r * 1.05, 3.2, 32), lime, x, y + 6.4, z) }
    // 범퍼카장: 둥근 바닥과 낮은 둘레
    { const [x, z, y] = at(352, 640); const r = pxm(24)
      add(new THREE.CylinderGeometry(r, r, 0.6, 36), grey, x, y + 0.3, z)
      add(new THREE.TorusGeometry(r, 0.45, 6, 36), dark, x, y + 0.9, z, Math.PI / 2) }
    // 파란 바닥 놀이터
    { const [x, z, y] = at(407, 645); add(new THREE.BoxGeometry(pxm(34), 1.2, pxm(32)), side, x, y + 0.6, z) }
    // 바이킹: 양쪽 받침과 배
    { const [x, z, y] = at(490, 662)
      for (const dz of [-3.2, 3.2]) { const a = add(new THREE.BoxGeometry(0.9, 13, 0.9), dark, x - 6, y + 6.5, z + dz); a.rotation.z = 0.28; const b = add(new THREE.BoxGeometry(0.9, 13, 0.9), dark, x + 6, y + 6.5, z + dz); b.rotation.z = -0.28 }
      add(new THREE.BoxGeometry(14, 0.8, 0.8), side, x, y + 12.8, z - 3.2); add(new THREE.BoxGeometry(14, 0.8, 0.8), side, x, y + 12.8, z + 3.2)
      add(new THREE.BoxGeometry(9, 1.6, 3.6), lime, x, y + 3.2, z) }
    // 야외공연장: 계단식 타원
    { const [x, z, y] = at(450, 505); const rx = pxm(62), rz = pxm(46)
      for (let i = 0; i < 4; i++) { const k = 1 - i * 0.2; const m = add(new THREE.CylinderGeometry(1, 1, 0.8, 40), i % 2 ? side : grey, x, y + 0.4 + i * 0.8, z); m.scale.set(rx * k, 1, rz * k) } }
    this.scene.add(g)
    this.structures = g
  }

  buildTrees(arr) {
    const n = arr.length / 4
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 3, 5)
    const crownGeo = new THREE.ConeGeometry(1.9, 6.5, 7)
    const cap = this.level === 'low' ? 0.2 : this.level === 'medium' ? 0.4 : 0.55
    const use = []
    for (let i = 0; i < n; i++) if (((i * 2654435761) % 1000) / 1000 < cap) use.push(i)
    const trunks = new THREE.InstancedMesh(trunkGeo, mat(P.trunk), use.length)
    const crowns = new THREE.InstancedMesh(crownGeo, mat(P.pine), use.length)
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color()
    use.forEach((i, k) => {
      const x = arr[i * 4], z = arr[i * 4 + 1], s = arr[i * 4 + 2] * 0.9, dark = arr[i * 4 + 3]
      const y = this.hAt(x, z)
      m4.compose(new THREE.Vector3(x, y + 1.5 * s, z), q, new THREE.Vector3(s, s, s)); trunks.setMatrixAt(k, m4)
      m4.compose(new THREE.Vector3(x, y + (3 + 4) * s, z), q, new THREE.Vector3(s, s, s)); crowns.setMatrixAt(k, m4)
      crowns.setColorAt(k, col.set(dark ? P.pine : P.pineLight))
    })
    trunks.castShadow = crowns.castShadow = PRESET[this.level].shadow
    this.scene.add(trunks, crowns)
  }

  buildPins(osm) {
    for (const f of this.facilities) {
      const [x, z] = toXZ(f.lngLat[0], f.lngLat[1])
      this.pins.set(f.id, new THREE.Vector3(x, this.hAt(x, z) + 2.5, z))
    }
    // 주변 시설 이름. 영상에서 알아볼 수 있는 큰 시설만 작게 적는다
    const names = ['춘천인형극장', '춘천인형극박물관', '강원도청소년수련관', '육림수영장', '육림골프클럽', '강원도립 화목원', '신매대교', '북한강 자전거길']
    const seen = new Set()
    const add = (name, lon, lat) => {
      if (seen.has(name) || !this.labelsEl) return
      seen.add(name)
      const [x, z] = toXZ(lon, lat)
      const el = document.createElement('span')
      el.className = 'ctx t-caption'
      el.textContent = name
      this.labelsEl.appendChild(el)
      this.ctx.push({ el, p: new THREE.Vector3(x, this.hAt(x, z) + 6, z) })
    }
    const mid = (ring) => ring.reduce((s, p) => [s[0] + p[0] / ring.length, s[1] + p[1] / ring.length], [0, 0])
    for (const a of osm.areas) if (names.includes(a.name) && a.ring?.length) { const c = mid(a.ring); add(a.name, c[0], c[1]) }
    for (const b of osm.buildings) if (names.includes(b.name)) { const c = mid(b.ring); add(b.name, c[0], c[1]) }
    for (const r of osm.roads) if (names.includes(r.name) && r.pts?.length) { const p = r.pts[Math.floor(r.pts.length / 2)]; add(r.name, p[0], p[1]) }
    for (const p of osm.places) if (names.includes(p.name)) add(p.name, p.lon, p.lat)
  }

  // 현장 스캔 모델이 있으면 건물 모양을 모델로 바꾼다
  async tryScan() {
    try {
      const head = await fetch(SCAN_URL, { method: 'HEAD' })
      if (!head.ok || (head.headers.get('content-type') || '').includes('text/html')) return
    } catch { return }
    const loader = new GLTFLoader()
    const draco = new DRACOLoader(); draco.setDecoderPath('/draco/'); loader.setDRACOLoader(draco)
    loader.load(SCAN_URL, (gltf) => {
      if (this.disposed) return
      const root = gltf.scene
      root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
      // 모델은 육림랜드 중심 기준 미터 단위, 북쪽 -z 로 내보낸다. 지형 높이에 맞춰 바닥을 올린다
      root.position.y = this.hAt(0, 0)
      if (this.buildingGroup) this.buildingGroup.visible = false
      this.scene.add(root)
      root.updateMatrixWorld(true)
      root.traverse((o) => { const m = /^pin[_-](.+)$/i.exec(o.name || ''); if (m && this.pins.has(m[1])) this.pins.set(m[1], o.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 8, 0))) })
      this.onMode?.('scan')
      this.dirty = true
    })
  }

  resize() {
    const el = this.canvas.parentElement
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.w = w; this.h = h
    this.dirty = true
  }

  setVisible(ids) { this.visible = new Set(ids); this.dirty = true }

  placePins() {
    const v = new THREE.Vector3()
    const place = (el, p, show = true) => {
      v.copy(p).project(this.camera)
      const ok = show && v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1
      el.style.transform = `translate3d(${((v.x + 1) / 2) * this.w}px, ${((1 - v.y) / 2) * this.h}px, 0) translate(-50%, -100%)`
      el.style.opacity = ok ? '1' : '0'
      el.style.pointerEvents = ok ? 'auto' : 'none'
      el.style.zIndex = String(Math.round((1 - v.z) * 10000))
    }
    // 이름표가 겹치면 카메라에 가까운 것부터 남기고 나머지는 숨긴다. 고른 시설은 항상 보인다
    const items = []
    for (const [id, p] of this.pins) { const el = this.pinEls.get(id); if (el && this.visible.has(id)) items.push({ el, p, id, sel: el.classList.contains('is-sel') }) }
    v.set(0, 0, 0)
    items.forEach((it) => { it.d = this.camera.position.distanceTo(it.p) })
    items.sort((a, b) => (b.sel - a.sel) || a.d - b.d)
    const boxes = []
    for (const it of items) {
      v.copy(it.p).project(this.camera)
      const sx = ((v.x + 1) / 2) * this.w, sy = ((1 - v.y) / 2) * this.h
      const w = it.el.offsetWidth || 80, h = it.el.offsetHeight || 28
      const box = [sx - w / 2, sy - h, sx + w / 2, sy]
      const visible = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05
      const hit = boxes.some((b) => box[0] < b[2] + 4 && box[2] > b[0] - 4 && box[1] < b[3] + 4 && box[3] > b[1] - 4)
      const show = visible && (it.sel || !hit)
      if (show) boxes.push(box)
      place(it.el, it.p, show)
    }
    for (const [id, p] of this.pins) { if (!this.visible.has(id)) { const el = this.pinEls.get(id); if (el) place(el, p, false) } }
    const dist = this.camera.position.distanceTo(this.controls.target)
    for (const c of this.ctx) { place(c.el, c.p, dist < 450); c.el.style.pointerEvents = 'none' }
  }

  focus(id, dist = 90) {
    const p = this.pins.get(id)
    if (!p) return
    const target = new THREE.Vector3(p.x, this.hAt(p.x, p.z), p.z)
    const offset = this.camera.position.clone().sub(this.controls.target).setLength(dist)
    offset.y = Math.max(offset.y, dist * 0.6)
    this.animateTo(target.clone().add(offset), target)
  }
  reset() { this.animateTo(this.home.pos.clone(), this.home.target.clone()) }
  zoom(f) {
    const off = this.camera.position.clone().sub(this.controls.target)
    const len = THREE.MathUtils.clamp(off.length() * f, this.controls.minDistance, this.controls.maxDistance)
    this.animateTo(this.controls.target.clone().add(off.setLength(len)), this.controls.target.clone())
  }
  animateTo(pos, target) {
    if (this.reduce) { this.camera.position.copy(pos); this.controls.target.copy(target); this.controls.update(); this.dirty = true; return }
    this.anim = { t0: performance.now(), dur: 800, p0: this.camera.position.clone(), p1: pos, q0: this.controls.target.clone(), q1: target }
  }

  loop(now) {
    if (this.disposed) return
    const dt = now - this.last; this.last = now
    if (this.anim) {
      const a = this.anim
      const t = Math.min(1, (now - a.t0) / a.dur)
      const e = 1 - Math.pow(1 - t, 3)
      this.camera.position.lerpVectors(a.p0, a.p1, e)
      this.controls.target.lerpVectors(a.q0, a.q1, e)
      if (t >= 1) this.anim = null
      this.dirty = true
    }
    // 보는 중심이 영상 범위를 벗어나지 않게 한다
    const t = this.controls.target
    if (this.x0 !== undefined) {
      const cx = THREE.MathUtils.clamp(t.x, this.x0 + 60, this.x1 - 60), cz = THREE.MathUtils.clamp(t.z, this.z0 + 60, this.z1 - 60)
      if (cx !== t.x || cz !== t.z) { this.camera.position.x += cx - t.x; this.camera.position.z += cz - t.z; t.x = cx; t.z = cz }
    }
    if (this.controls.update()) this.dirty = true
    if (this.dirty) {
      this.renderer.render(this.scene, this.camera)
      this.placePins()
      this.dirty = false
      const step = this.monitor.sample(now, dt)
      if (step) { const next = stepLevel(this.level, step); if (next !== this.level) { this.level = next; this.applyPixelRatio(); this.dirty = true } }
    }
    this.raf = requestAnimationFrame(this.loop)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    this.controls?.dispose()
    this.ctx.forEach((c) => c.el.remove())
    this.scene?.traverse((o) => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose?.(); m.dispose() }) })
    this.renderer?.dispose()
  }
}
