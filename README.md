# 육림랜드 웹사이트 프로토타입

실행: `cd client && node node_modules/vite/bin/vite.js --port 5180` 후 http://localhost:5180
빌드: `cd client && node node_modules/vite/bin/vite.js build` (결과 `client/dist`)

- 문구와 값은 `client/src/data/*.json`에서만 읽는다. 값을 바꾸면 화면이 바뀐다.
- 캐릭터 이름은 `site.json`의 `character.name` 한 곳만 바꾼다.
- 예약, 미션 스탬프, 알림 신청은 이 기기 IndexedDB에 저장된다.
- 미션 QR은 `/mission/1?code=YOOKRIM-1` 주소를 담는다.
- 디자인 규칙은 `UI.md`, 색과 간격 값은 `client/src/tokens.js`.
- 3D 지도 자료는 `node client/scripts/bake-yookrim.mjs`로 받는다(브이월드 위성영상, AWS 지형, OpenStreetMap).
- `replica/`는 레고랜드 사이트를 읽고 정리한 참고 화면이며 결과물에는 들어가지 않는다.

## 3D 공간 지도

- 3D팀 모형: `client/public/models/land.glb`(전체 섬, 3.3MB)와 `client/public/models/zones/*.glb`(구역별). 원본 zip은 `3d-source/`(공개 저장소에는 올리지 않음)
- 줄이기: `npx @gltf-transform/cli optimize 입력.glb 출력.glb --compress meshopt --texture-compress webp --texture-size 1024` (전체 31MB가 3.3MB)
- 구역 위치와 설명: `client/src/data/zones3d.json`(x, z는 land.glb 좌표, geo는 실제 위치에 쓰는 시설 id)
- 우리 모형 화면: `src/three/LandScene.js`, 실제 위치 화면: `src/three/RealParkScene.js` + `src/three/zoneModel.js`
