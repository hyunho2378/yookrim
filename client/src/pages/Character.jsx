// Character.jsx  숲속 친구, 가디. 소개, 설정, 모델이 된 독수리, 모습, 가디를 만나는 곳 순서.
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Btn, Photo } from '../components/ui'

const profile = [
  ['이름', '가디. 지킨다는 뜻의 Guard에서 따왔어요.'],
  ['맡은 일', '육림랜드 꼬마 수호대장, 메인 캐릭터'],
  ['모델', '육림랜드에 사는 독수리(천연기념물)'],
  ['잘하는 일', '높은 곳에서 순찰하기, 길 잃은 아이 찾기, 바람 타기'],
  ['좋아하는 일', '아이들 웃음소리, 높은 곳, 따뜻한 바람, "이상 무!"로 끝나는 하루'],
  ['어려워하는 일', '혼자 우는 아이, 정해진 구역 밖으로 나가는 대원']
]
const scenes = [['spring', '봄', '지도를 들고 보물을 찾는 가디', '/play/season/spring'], ['summer', '여름', '손전등을 들고 좀비 숲을 도는 가디', '/play/season/summer'], ['autumn', '가을', '벙커 뒤에서 깃발을 지키는 가디', '/play/season/autumn'], ['winter', '겨울', '모닥불 앞에서 쉬어 가는 가디', '/play/season/winter']]
const views = [['gadi-front', '정면'], ['gadi-l34', '왼쪽 3/4'], ['gadi-left', '왼쪽'], ['gadi-back', '뒷면'], ['gadi-right', '오른쪽'], ['gadi-r34', '오른쪽 3/4']]
const habits = [
  ['"대원, 집합!"', '행사 안내와 집결 장소'],
  ['"작전 개시!"', '게임과 미션 시작'],
  ['"이상 무!"', '안전 안내와 순찰 끝'],
  ['"걱정 마, 내가 보고 있어."', '미아 방지와 안전 표지판']
]
const eagle = [
  ['순한 성격', '독수리는 사냥하지 않고 죽은 동물을 먹는 자연의 청소부예요. 덩치는 커도 까치나 까마귀한테 밀리기도 해요.'],
  ['바람 타기', '날갯짓보다 상승기류를 타고 활공해요.'],
  ['겨울 손님', '겨울에 먼 북쪽에서 날아오는 철새이고, 강원도가 대표적인 월동지예요.'],
  ['목도리 깃털', '독수리 목둘레의 갈색 깃털을 그대로 가져왔어요.']
]

export default function Character() {
  return (
    <>
      <section className="gd-hero">
        <div className="wrap gd-hero__in">
          <div className="gd-hero__copy stack-5">
            <p className="gd-tag t-strong">숲속 친구</p>
            <h1 className="gd-name">가디</h1>
            <p className="t-label">육림랜드를 지키는 꼬마 수호대장</p>
            <p className="t-body">천연기념물 독수리를 모델로, 1975년부터 숲을 지켜 온 놀이공원의 아이들을 오늘도 내려다보고 있어요.</p>
            <p className="gd-quote t-card">"숲은 내가 지킬게, 너는 신나게 놀아!"</p>
            <div className="gd-hero__btns"><Btn to="/leaflet">리플릿 보기</Btn><Btn variant="deep" to="/play/gungame">총게임 안내</Btn></div>
          </div>
          <div className="gd-art"><img src={`${import.meta.env.BASE_URL}images/gadi/cutout.png`} alt="가디" width="574" height="748" /></div>
        </div>
      </section>

      <section className="wrap section gd-block gd-seasons">
        <header className="gd-head"><h2 className="t-band">사계절의 가디</h2><p className="t-body c-sub">계절마다 육림랜드 곳곳에서 가디를 만나요.</p></header>
        <ul className="gd-scenes">
          {scenes.map(([id, s, t, to], i) => (
            <li key={id}><Link to={to} className="gd-scene"><Photo slot={`gadi-scene-${id}`} ratio="16 / 9" tone={i} /><span className="t-small">{s}</span><span className="t-card">{t}</span></Link></li>
          ))}
        </ul>
      </section>

      <section className="wrap section gd-block">
        <header className="gd-head"><h2 className="t-band">캐릭터 설정</h2><p className="t-body c-sub">가디는 이런 친구예요.</p></header>
        <ul className="gd-facts">{profile.map(([k, v]) => <li key={k}><span className="t-small">{k}</span><span className="t-body">{v}</span></li>)}</ul>

        <div className="gd-world">
          <div className="stack-4">
            <h3 className="t-card c-primary">숲을 기르는 놀이공원</h3>
            <p className="t-body">육림(育林)은 숲을 기른다는 뜻이에요. 1975년, 춘천에 첫 놀이공원이 문을 열었어요. 소나무 숲에 둘러싸인 그곳의 이름은 육림랜드. 50년 동안 회전목마를 타며 웃던 아이, 바이킹에서 소리 지르던 친구들, 손을 꼭 잡고 걷던 가족의 웃음이 숲 곳곳에 쌓였어요.</p>
            <p className="t-body">그 웃음을 지키는 친구들이 숲에 살고, 그 친구들의 대장이 가디예요.</p>
          </div>
          <div className="stack-4 gd-story">
            <h3 className="t-card c-primary">가디가 육림랜드에 남은 이야기</h3>
            <p className="t-body">추운 겨울, 바람을 타고 먼 길을 날아온 작은 독수리가 있었어요. 긴 여행 끝에 내려앉은 곳은 소나무 숲에 둘러싸인 놀이공원, 육림랜드였죠.</p>
            <p className="t-body">숲 아래에서 아이들 웃음소리가 들려오자 독수리는 생각했어요. "이 웃음소리는 누가 지켜 주지?" 그날부터 독수리는 더 멀리 날아가는 대신, 높은 곳에 앉아 숲을 내려다보기로 했어요.</p>
            <p className="t-body">아이들은 육림랜드 배지를 달아 주며 이름을 붙여 주었어요. 우리를 지켜 주는 친구, 가디.</p>
            <p className="t-strong">정문에 들어오는 순간 누구나 가디의 대원이 돼요. <Link to="/leaflet" className="inline-link">리플릿 미션지</Link>에 도장을 모으면 선물을 받아요.</p>
          </div>
        </div>

        <div className="gd-dn">
          <article className="gd-dn__card gd-dn__card--day">
            <Photo slot="gadi-day" ratio="1 / 1" tone={0} />
            <div className="stack-3">
              <p className="t-small">낮, 개장 시간</p>
              <h3 className="t-band">낮의 수호대장</h3>
              <dl className="gd-mini"><dt>하는 일</dt><dd>순찰, 안전 안내, 길 잃은 아이 찾기</dd><dt>들고 다니는 물건</dt><dd>선글라스</dd><dt>외치는 말</dt><dd>"이상 무!"</dd></dl>
            </div>
          </article>
          <article className="gd-dn__card gd-dn__card--night">
            <Photo slot="gadi-night" ratio="1 / 1" tone={0} />
            <div className="stack-3">
              <p className="t-small">금요일과 토요일 밤</p>
              <h3 className="t-band">밤의 교관</h3>
              <dl className="gd-mini"><dt>하는 일</dt><dd>숲속 총게임 리그 지휘, 야간 미션전 심판</dd><dt>들고 다니는 물건</dt><dd>서바이벌 레이저 총, 조끼</dd><dt>외치는 말</dt><dd>"작전 개시!"</dd></dl>
            </div>
          </article>
        </div>

        <div className="gd-trait">
          <div className="stack-4">
            <h3 className="t-card c-primary">성격</h3>
            <dl className="kv kv--tight">
              <dt>겉</dt><dd>근엄한 대장인 척, 늘 눈썹을 찌푸리고 있어요.</dd>
              <dt>속</dt><dd>순하고 걱정이 많아서 아이 한 명 한 명을 다 신경 써요.</dd>
              <dt>반전</dt><dd>너무 작고 동글해서 아무도 안 무서워해요. 본인만 몰라요.</dd>
              <dt>버릇</dt><dd>걱정되거나 긴장하면 목도리 깃털이 부풀어 올라요.</dd>
            </dl>
          </div>
          <div className="stack-4">
            <h3 className="t-card c-primary">말버릇</h3>
            <p className="t-body c-sub">친근한 반말에 짧고 씩씩한 구호를 섞어요.</p>
            <ul className="gd-habits">{habits.map(([q, w]) => <li key={q}><span className="t-card">{q}</span><span className="t-small c-sub">{w}</span></li>)}</ul>
          </div>
        </div>
      </section>

      <section className="wrap section gd-block">
        <div className="gd-feature">
          <Photo slot="gadi-eagle" ratio="4 / 5" tone={1} className="gd-feature__img" />
          <div className="stack-4">
            <h2 className="t-band c-primary">가디의 모델, 육림랜드 독수리</h2>
            <p className="t-body">육림랜드에서 지내는 독수리가 가디의 모델이에요. 가디는 이 독수리의 습성을 그대로 닮았어요.</p>
            <ul className="gd-eagle">{eagle.map(([t, d]) => <li key={t}><b className="t-strong">{t}</b><span className="t-small">{d}</span></li>)}</ul>
          </div>
        </div>

        <div className="gd-feature gd-feature--flip">
          <Photo slot="gadi-badge-color" ratio="4 / 3" tone={2} className="gd-feature__img" />
          <div className="stack-4">
            <h2 className="t-band c-primary">모자에 단 육림랜드 배지</h2>
            <p className="t-body">초록 베레모는 스스로 대장이 되겠다고 쓴 모자예요. 모자에 달린 배지는 아이들이 달아 준 선물이에요.</p>
            <p className="t-body">육림랜드 로고의 林은 두 아이가 손을 잡은 모양이에요. 그래서 가디는 늘 아이들과 함께 숲을 지키는 셈이에요.</p>
          </div>
        </div>
      </section>

      <section className="wrap section gd-block">
        <header className="gd-head"><h2 className="t-band">가디 둘러보기</h2><p className="t-body c-sub">앞에서도 옆에서도 뒤에서도 동글동글해요.</p></header>
        <ul className="gd-views">{views.map(([s, l]) => <li key={s}><Photo slot={s} ratio="3 / 4" tone={0} /><span className="t-small">{l}</span></li>)}</ul>
      </section>

      <section className="wrap section gd-block">
        <header className="gd-head"><h2 className="t-band">가디를 만나는 곳</h2><p className="t-body c-sub">공원 곳곳에서 가디가 기다려요.</p></header>
        <ul className="gd-meet">
          <li><Link to="/map?focus=start" className="gd-meet__item"><Photo slot="zone-start" ratio="4 / 3" tone={0} /><span className="t-card">정문 광장</span><span className="t-body">입구에서 대원들을 맞이해요.</span></Link></li>
          <li><Link to="/leaflet" className="gd-meet__item"><Photo slot="leaflet-front" ratio="4 / 3" tone={1} /><span className="t-card">리플릿 미션지</span><span className="t-body">미션지에 도장을 모으면 선물을 받아요.</span></Link></li>
          <li><Link to="/play/gungame" className="gd-meet__item"><Photo slot="gadi-night" ratio="4 / 3" tone={2} /><span className="t-card">총게임 필드</span><span className="t-body">밤에는 교관이 되어 경기를 지휘해요.</span></Link></li>
        </ul>
      </section>
    </>
  )
}
