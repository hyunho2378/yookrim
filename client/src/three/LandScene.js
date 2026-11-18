// LandScene.js  3D팀이 만든 육림랜드 모형(public/models/land.glb)을 보여 주는 장면.
// 구역 이름표는 zones 배열의 모형 좌표(x, z)에 놓고, 이름을 누르면 그 구역으로 카메라가 날아간다.
// 모형 파일은 meshopt 로 줄인 GLB 이고, 기본 움직임(너구리 등)은 파일 안의 애니메이션을 그대로 돌린다.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { detectTier, PRESET } from './quality'

const BASE = import.meta.env.BASE_URL
export const LAND_URL = BASE + 'models/land.glb'

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
    c.addEventListener('change', () => { this.dirty = true })
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

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.canvas.parentElement)
    this.resize()
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
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
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
    this.dirty = true
    this.onReady?.(true, { box, size, ctr })
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
    const boxes = []
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
      boxes.push({ el, sx, sy })
    }
  }

  focus(id, d0) {
    const z = this.zones.find((q) => q.id === id)
    if (!z) return
    const dist = d0 || z.dist || 20
    const t = new THREE.Vector3(z.x, z.y ?? 1, z.z)
    const dir = this.camera.position.clone().sub(this.controls.target).setY(0)
    if (dir.length() < 0.001) dir.set(0.3, 0, 1)
    dir.normalize().multiplyScalar(dist * 0.78)
    this.animateTo(new THREE.Vector3(t.x + dir.x, t.y + dist * 0.62, t.z + dir.z), t)
  }

  reset() { if (this.home) this.animateTo(this.home.pos.clone(), this.home.target.clone()) }

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

  loop() {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    const dt = this.clock.getDelta()
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
    if (this.mixers.length && !this.reduce) { this.mixers.forEach((m) => m.update(dt)); need = true }
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
    this.controls?.dispose()
    this.scene?.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { for (const k in m) if (m[k]?.isTexture) m[k].dispose(); m.dispose() }) } })
    this.renderer?.dispose()
  }
}
