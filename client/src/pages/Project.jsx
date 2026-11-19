// Project.jsx  되살리기 프로젝트 소개. 기획 배경과 현장에서 본 모습, 목표, 놀이 유형, 캐릭터와 3D 공간, 기대 효과를 한 쪽에 담는다.
import { Link } from 'react-router-dom'
import { EventHero, Teaser, CheckList, CenterTitle } from '../components/blocks'
import { Photo } from '../components/ui'

const findings = [
  { key: 'place', to: '/map', slot: 'site-rides', title: '시설과 환경', text: '시설이 오래되고 낡아 공원의 첫인상이 약해졌어요.' },
  { key: 'play', to: '/play', slot: 'site-camp', title: '체험 콘텐츠', text: '다른 곳과 구분되는 체험이 적어 일부러 찾아올 이유가 줄었어요.' },
  { key: 'brand', to: '/about/characters', slot: 'site-entrance', title: '방문 동기와 이미지', text: '방문 동기가 약해지고 육림랜드만의 이미지가 흐려졌어요.' }
]
const kinds = [
  { key: 'action', to: '/play/gungame', slot: 'gungame-zone-overview', title: '액션 놀이', text: '총게임과 팀 배틀처럼 몸을 움직이는 활동형 콘텐츠예요.' },
  { key: 'adv', to: '/play/season/spring', slot: 'poster-spring', title: '어드벤처 놀이', text: '보물찾기와 야외 방탈출처럼 탐험하고 추리하는 콘텐츠예요.' },
  { key: 'create', to: '/leaflet', slot: 'gadi-stamp-color', title: '크리에이티브 놀이', text: '캐릭터 공방과 키링, 배지 만들기처럼 직접 만드는 콘텐츠예요.' },
  { key: 'family', to: '/play/attractions', slot: 'cafe-interior', title: '가족 놀이', text: '놀이기구와 동물 교감처럼 온 가족이 함께하는 콘텐츠예요.' }
]

export function Project() {
  return (
    <>
      <EventHero slot="map-aerial" tone={1} tag="되살리기 프로젝트" title="새로운 놀이가 시작되는 육림랜드" text="춘천의 오랜 놀이공원에 놀이와 캐릭터, 공간 이야기를 더해요." cta="3D 공간 지도" to="/map" />
      <Teaser id="background" slot="site-history" tone={0} title="프로젝트를 시작한 이유">
        <p>육림랜드는 춘천의 오랜 역사와 추억을 간직한 지역 놀이공간이에요. 시설이 낡고 차별화된 체험이 부족해지면서 새로운 변화가 필요해졌어요.</p>
        <p>이 프로젝트는 공간이 가진 가능성을 다시 찾고, 방문객이 취향에 따라 즐길 새로운 놀이와 체험을 만들어요. 시설만 새로 꾸미지 않고 공간 활용과 콘텐츠, 캐릭터와 시각 디자인을 하나로 이어 육림랜드만의 이미지를 세우는 일이 목표예요.</p>
      </Teaser>
      <section className="wrap section">
        <CenterTitle title="현장에서 본 육림랜드" text="현장 조사에서 세 가지 모습을 확인했어요." />
        <ul className="rlist">
          {findings.map((it, i) => (
            <li key={it.key}>
              <Link to={it.to} className="rlist__item">
                <Photo slot={it.slot} ratio="4 / 3" tone={i} round />
                <h3 className="t-card">{it.title}</h3>
                <p className="t-body rlist__desc">{it.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Teaser id="goal" slot="site-photozone" tone={2} flip title="프로젝트 목표">
        <CheckList items={['기존 공간의 가능성을 다시 찾아요', '취향에 따라 고르는 새로운 놀이와 체험을 만들어요', '공간과 콘텐츠, 캐릭터와 시각 디자인을 하나로 이어요', '육림랜드만의 새로운 이미지를 세워요']} />
      </Teaser>
      <section className="wrap section">
        <CenterTitle title="네 가지 놀이" text="성별이나 나이로 나누지 않고 놀이 방식으로 고르게 했어요." />
        <ul className="rlist rlist--four">
          {kinds.map((it, i) => (
            <li key={it.key}>
              <Link to={it.to} className="rlist__item">
                <Photo slot={it.slot} ratio="4 / 3" tone={i} round />
                <h3 className="t-card">{it.title}</h3>
                <p className="t-body rlist__desc">{it.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Teaser id="character" slot="character-main" tone={3} title="캐릭터" cta="캐릭터 보기" to="/about/characters">
        <p>꼬마 수호대장 가디가 웹사이트와 리플릿, 포스터와 스탬프 도안에서 같은 모습으로 방문객을 맞이해요.</p>
      </Teaser>
      <Teaser id="space" slot="map-aerial" tone={1} flip title="3D 공간" cta="3D 공간 지도" to="/map">
        <p>3D로 만든 육림랜드 모형을 돌리고 확대해 구역을 둘러보고, 실제 위치로 바꾸면 위성영상 위 제자리에 같은 모형이 올라가요.</p>
        <ul className="checks">
          {[['서바이벌 총게임장', '/map?focus=survival'], ['캠프촌', '/map?focus=camping'], ['동물 교감 카페', '/map?focus=cafe'], ['입구 광장', '/map?focus=start']].map(([t, to]) => <li key={t}><Link to={to} className="more t-body">{t}</Link></li>)}
        </ul>
      </Teaser>
      <section className="wrap section">
        <CenterTitle title="기대하는 변화" />
        <dl className="kv">
          <dt>체험 선택 폭</dt><dd>활동형 콘텐츠에 탐험과 추리, 창작, 가족형 콘텐츠를 더해 취향과 상황에 따라 고를 수 있어요.</dd>
          <dt>공간 활용</dt><dd>기존 시설과 공간을 새로운 체험과 이어 육림랜드의 활용 범위를 넓혀요.</dd>
          <dt>브랜드 정체성</dt><dd>캐릭터와 통일된 시각 디자인으로 육림랜드만의 이미지와 인지도를 높여요.</dd>
          <dt>방문 경험</dt><dd>체험 정보와 리플릿, 공간 지도를 이어 방문 전부터 현장까지 자연스럽게 이용해요.</dd>
          <dt>지속 가능성</dt><dd>계절 이벤트와 새로운 체험을 더할 수 있는 구조로 오래 이어 가요.</dd>
        </dl>
      </section>
      <section className="wrap section">
        <CenterTitle title="앞으로의 방향" />
        <p className="t-body project__next">방문객 반응과 운영 여건을 바탕으로 콘텐츠를 보완하고, 계절 프로그램과 캐릭터 활용 범위를 넓혀 육림랜드만의 놀이와 체험 공간으로 키워 가요.</p>
      </section>
    </>
  )
}
