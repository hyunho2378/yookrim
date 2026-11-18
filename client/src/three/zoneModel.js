// zoneModel.js  구역별 모형(zones/*.glb)을 실제 위치에 놓기 좋게 다듬는다.
// 파일마다 바닥 판 밖에 떨어진 작은 조각이 섞여 있어, 조각들의 가운데 값에서 멀리 떨어진 것은 숨기고 바닥 중심을 원점에 맞춘다.
// 모든 구역 파일은 같은 단위로 만들어져 있으므로 배율을 하나로 맞춘다(바닥 판 한 칸 3.7 단위가 약 metersPerTile 미터).
import * as THREE from 'three'

export function prepareZone(root, metersPerUnit = 8, radius = 6) {
  root.updateMatrixWorld(true)
  const items = []
  root.traverse((o) => { if (o.isMesh) items.push({ o, b: new THREE.Box3().setFromObject(o), c: new THREE.Vector3() }) })
  items.forEach((it) => it.b.getCenter(it.c))
  const med = (k) => { const a = items.map((it) => it.c[k]).sort((x, y) => x - y); return a[Math.floor(a.length / 2)] }
  const mx = med('x'), mz = med('z')
  const all = new THREE.Box3()
  for (const it of items) {
    if (Math.hypot(it.c.x - mx, it.c.z - mz) > radius) { it.o.visible = false; continue }
    it.o.castShadow = true; it.o.receiveShadow = true
    all.union(it.b)
  }
  const ctr = all.getCenter(new THREE.Vector3())
  root.position.set(-ctr.x, -all.min.y, -ctr.z)
  const g = new THREE.Group()
  g.add(root)
  g.scale.setScalar(metersPerUnit)
  const size = all.getSize(new THREE.Vector3())
  g.userData.info = { all: size.toArray().map((v) => +v.toFixed(2)), n: items.length }
  return { group: g, height: size.y * metersPerUnit }
}
