// Project.jsx  프로젝트 소개. 배경, 목적, 진행 과정, 비전, 기대 효과, 향후 발전 방향 여섯 항목을 차례로 싣는다.
import { SubHero } from '../components/blocks'

const items = [
  { id: 'background', no: '01', en: 'PROJECT BACKGROUND', ko: '프로젝트 배경', text: '육림랜드는 춘천의 오랜 역사와 추억을 간직한 지역 놀이공간입니다. 하지만 시설의 노후화와 차별화된 체험 콘텐츠의 부족으로 과거에 비해 방문객에게 새로운 즐거움을 전달하는 데 한계가 있습니다. 이에 기존 공간이 가진 가능성을 재발견하고, 육림랜드만의 새로운 경험을 제안하고자 프로젝트를 시작했습니다.' },
  { id: 'purpose', no: '02', en: 'PROJECT PURPOSE', ko: '프로젝트 목적', text: '이번 프로젝트는 육림랜드를 단순한 놀이시설이 아닌, 다양한 연령층이 각자의 취향에 따라 즐길 수 있는 복합 체험 공간으로 재해석하는 데 목적이 있습니다. 기존 공간을 최대한 활용하면서 계절별 프로그램과 캐릭터, 공간 디자인, 온라인 홍보 콘텐츠를 하나의 브랜드 경험으로 연결하고자 합니다.' },
  { id: 'process', no: '03', en: 'PROJECT PROCESS', ko: '프로젝트 진행 과정', text: '현장 방문과 운영 관계자 인터뷰를 통해 육림랜드의 현재 모습을 살펴보고, 공간의 장점과 개선이 필요한 부분을 분석했습니다. 이를 바탕으로 계절별 체험 프로그램을 기획하고, 캐릭터 디자인과 3D 공간 모델링, 웹사이트 및 홍보 영상 제작을 진행했습니다.' },
  { id: 'vision', no: '04', en: 'PROJECT VISION', ko: '우리가 그리는 미래', text: '우리가 지향하는 육림랜드는 계절이 바뀔 때마다 새로운 즐거움이 기다리는 공간입니다. 봄의 보물찾기, 여름의 한여름밤 좀비 숲, 가을의 숲속 총게임 리그, 겨울의 소나무 숲 1일 캠핑 데이처럼 방문객이 직접 참여하고 경험하는 콘텐츠를 통해 육림랜드만의 정체성을 구축하고자 합니다.' },
  { id: 'impact', no: '05', en: 'EXPECTED IMPACT', ko: '기대 효과', text: '다양한 계절별 프로그램을 통해 방문객의 선택 폭을 넓히고, 기존 공간의 활용도를 높일 수 있습니다. 또한 캐릭터와 통일된 시각 디자인을 활용해 육림랜드만의 브랜드 이미지를 강화하고, 새로운 방문 동기와 재방문 가능성을 만들어낼 것으로 기대합니다.' },
  { id: 'future', no: '06', en: 'FUTURE DIRECTION', ko: '향후 발전 방향', text: '이번 프로젝트는 육림랜드의 변화를 위한 하나의 제안입니다. 향후 실제 운영을 위해서는 공간 활용 가능성, 예산, 안전 관리, 운영 인력 및 관계 기관과의 협의가 필요합니다. 이를 바탕으로 실현 가능한 콘텐츠부터 단계적으로 도입하고, 방문객의 반응과 운영 결과를 반영해 지속적으로 발전시켜 나가는 것을 목표로 합니다.' }
]

export default function Project() {
  return (
    <>
      <SubHero slot="map-aerial" tone={0} title="육림랜드, 새로운 가능성을 발견하다" text="ABOUT PROJECT" />
      <section className="wrap pj">
        <ol className="pj__list">
          {items.map((it) => (
            <li key={it.id} id={it.id} className="pj__item">
              <div className="pj__head">
                <span className="pj__no t-band">{it.no}</span>
                <h2 className="t-card">{it.ko}</h2>
                <span className="t-small pj__en">{it.en}</span>
              </div>
              <p className="t-body pj__text">{it.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
