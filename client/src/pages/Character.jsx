// Character.jsx  숲속 친구, 가디. 대표 캐릭터 소개, 캐릭터 설정, 디자인 과정, 가디와 함께하는 육림랜드 순서.
// 글과 그림은 I-SO 피그마 캐릭터 시트(가디 캐릭터 시트, 캐릭터 소개, 베레모 배지 시안, 세계관)에서 가져왔다.
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Btn, Photo } from '../components/ui'
import gadi from '../data/gadi.json'

const profile = [
  ['이름', '가디. 지킨다는 뜻의 Guard에서 따왔어요.'],
  ['맡은 일', '육림랜드 꼬마 수호대장, 메인 캐릭터'],
  ['모델', '육림랜드에 사는 독수리(천연기념물)'],
  ['잘하는 일', '높은 곳에서 순찰하기, 길 잃은 아이 찾기, 바람 타기'],
  ['좋아하는 일', '아이들 웃음소리, 높은 곳, 따뜻한 바람, "이상 무!"로 끝나는 하루'],
  ['어려워하는 일', '혼자 우는 아이, 정해진 구역 밖으로 나가는 대원']
]
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
  ['목도리 깃털', '목둘레의 갈색 깃털이 실제 특징이에요.']
]
const keep = [
  ['베레모', '왼쪽으로 기울여 써요. 스스로 대장이 되겠다고 쓴 모자예요.'],
  ['로고 배지', '손잡은 두 아이 모양의 육림랜드 로고예요. 아이들이 달아 준 배지이고, 가디 기준 왼쪽 머리에 있어서 오른쪽에서는 보이지 않아요.'],
  ['목도리 깃털', '실제 독수리의 갈색 목 깃털에서 가져왔어요. 몸통보다 살짝 밝게만 써요.'],
  ['눈썹', '앞에서는 잔뜩 찌푸리고, 옆에서는 살짝 처져 걱정하는 얼굴이 돼요.'],
  ['실루엣', '작고 둥글게 그려요. 무서워 보이지 않는 게 가장 중요해요.']
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
          <Photo slot="gadi-main" ratio="1 / 1.05" tone={0} className="gd-hero__img" />
        </div>
      </section>

      <section className="wrap section gd-block">
        <header className="gd-head"><h2 className="t-band">캐릭터 설정</h2><p className="t-body c-sub">역할과 세계관, 성격을 정리했어요.</p></header>
        <dl className="kv">{profile.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>

        <div className="gd-world">
          <div className="stack-4">
            <h3 className="t-card c-primary">숲을 기르는 놀이공원</h3>
            <p className="t-body">육림(育林)은 숲을 기른다는 뜻이에요. 1975년, 춘천에 첫 놀이공원이 문을 열었어요. 소나무 숲에 둘러싸인 그곳의 이름은 육림랜드. 반세기 동안 이 숲에서는 나무만 자란 게 아니에요. 회전목마를 타며 웃던 아이, 바이킹에서 소리 지르던 친구들, 손을 꼭 잡고 걷던 가족이 남기고 간 웃음이 숲 곳곳에 쌓여 함께 자랐어요.</p>
            <p className="t-body">육림랜드의 숲은 그 웃음, 그러니까 동심을 기르는 숲이에요. 그리고 숲에는 그 동심이 다치지 않도록 지키는 친구들이 살아요. 그 친구들의 대장이 바로 가디예요.</p>
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

      <section className="gd-process">
        <div className="wrap gd-block">
          <header className="gd-head"><h2 className="t-band">디자인 과정</h2><p className="t-body c-sub">캐릭터 기획부터 최종 디자인까지 다섯 단계로 만들었어요.</p></header>

          <div className="gd-step">
            <p className="gd-step__no">1</p>
            <div className="gd-step__body stack-4">
              <h3 className="t-card">실제 독수리에서 시작해요</h3>
              <p className="t-body">육림랜드에서 지내는 독수리를 모델로 삼았어요. 실제 독수리의 습성을 가디의 성격과 모습에 담았어요.</p>
              <ul className="gd-eagle">{eagle.map(([t, d]) => <li key={t}><b className="t-strong">{t}</b><span className="t-small">{d}</span></li>)}</ul>
            </div>
            <Photo slot="gadi-eagle" ratio="4 / 5" tone={1} className="gd-step__img" />
          </div>

          <div className="gd-step gd-step--flip">
            <p className="gd-step__no">2</p>
            <div className="gd-step__body stack-4">
              <h3 className="t-card">손그림으로 표정을 잡아요</h3>
              <p className="t-body">3D로 만들기 전에 손으로 먼저 그렸어요. 색과 표정은 이 그림을 기준으로 맞췄어요.</p>
              <Photo slot="gadi-process" ratio="3 / 1.1" tone={1} />
            </div>
            <Photo slot="gadi-sketch" ratio="4 / 3" tone={1} className="gd-step__img" />
          </div>

          <div className="gd-step gd-step--wide">
            <p className="gd-step__no">3</p>
            <div className="gd-step__body stack-4">
              <h3 className="t-card">3D 캐릭터 시트로 모든 방향을 정리해요</h3>
              <p className="t-body">앞과 옆, 뒤에서 본 모습이 같은 캐릭터로 보이도록 여섯 방향을 맞췄어요.</p>
              <ul className="gd-views">{views.map(([s, l]) => <li key={s}><Photo slot={s} ratio="3 / 4" tone={0} /><span className="t-small">{l}</span></li>)}</ul>
            </div>
          </div>

          <div className="gd-step gd-step--wide">
            <p className="gd-step__no">4</p>
            <div className="gd-step__body stack-4">
              <h3 className="t-card">모자에 육림랜드 로고를 달아요</h3>
              <p className="t-body">육림랜드 로고의 林은 두 아이가 손을 잡은 모양이에요. 아이들을 지키는 수호대장의 모자에 그 아이들이 함께 있게 돼요. 원래 별 배지가 아이들이 달아 준 배지였으니 설정도 그대로 이어져요.</p>
              <ul className="gd-badges">
                <li><Photo slot="gadi-badge-old" ratio="4 / 3" tone={2} /><span className="t-small">기존 별과 월계수</span></li>
                <li><Photo slot="gadi-badge-color" ratio="4 / 3" tone={2} /><span className="t-small">시안 A 로고 컬러</span></li>
                <li><Photo slot="gadi-badge-gold" ratio="4 / 3" tone={2} /><span className="t-small">시안 B 로고 골드</span></li>
              </ul>
            </div>
          </div>

          <div className="gd-step gd-step--wide">
            <p className="gd-step__no">5</p>
            <div className="gd-step__body stack-4">
              <h3 className="t-card">색과 지켜야 할 모습을 정해요</h3>
              <ul className="gd-swatch">{gadi.colors.map((c) => <li key={c.name}><span className="gd-swatch__chip" style={{ background: c.hex }} /><span className="t-small">{c.name}</span><span className="t-caption c-sub">{c.hex}</span></li>)}</ul>
              <dl className="kv kv--tight">{keep.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section gd-block">
        <header className="gd-head"><h2 className="t-band">가디와 함께하는 육림랜드</h2><p className="t-body c-sub">홈페이지와 포스터, 리플릿, 스탬프 도안에서 같은 모습으로 만나요.</p></header>
        <div className="gd-use">
          <Link to="/" className="gd-use__item gd-use__item--web"><Photo slot="gadi-web" ratio="16 / 10" tone={0} /><span className="t-card">홈페이지</span><span className="t-small">첫 화면과 소개에서 인사해요.</span></Link>
          <div className="gd-use__item gd-use__item--poster"><Photo slot="poster-draft" ratio="16 / 9" tone={1} /><span className="t-card">포스터</span><span className="t-small">서바이벌 리뉴얼 소식을 알려요.</span></div>
          <Link to="/leaflet" className="gd-use__item gd-use__item--leaf"><Photo slot="leaflet-front" ratio="3 / 4" tone={2} /><span className="t-card">리플릿</span><span className="t-small">앞면은 사계절 체험, 뒷면은 지도예요.</span></Link>
          <div className="gd-use__item gd-use__item--stamp"><Photo slot="gadi-stamp-color" ratio="1 / 1" tone={3} /><span className="t-card">스탬프 도안</span><span className="t-small">미션지에 찍는 도장이 돼요.</span></div>
        </div>
      </section>
    </>
  )
}
