// Misc.jsx  육림랜드 이야기, 캐릭터, 소식, 마이, 없는 주소.
import { Link, useParams, useSearchParams, Navigate } from 'react-router-dom'
import { CalendarDays, Ticket, Trash2 } from 'lucide-react'
import { EventHero, Teaser, CheckList, CenterTitle, PlainHero, TileGrid } from '../components/blocks'
import { Btn, Photo } from '../components/ui'
import { site, notices, dotDate, won } from '../lib/data'
import { useStore } from '../lib/store'

export function About() {
  return (
    <>
      <EventHero slot="site-history" tone={0} tag={`${site.founded}년 개장`} title="숲을 기르는 놀이공원, 육림" text="육림(育林)은 숲을 기른다는 뜻이에요." />
      <section className="wrap section story-video">
        <h2 className="t-band">육림랜드 소개 영상</h2>
        <video controls playsInline preload="metadata" poster={`${import.meta.env.BASE_URL}images/promo-video.jpg`} aria-label="육림랜드 소개 영상">
          <source src={`${import.meta.env.BASE_URL}videos/yuklim-final.mp4`} type="video/mp4" />
        </video>
      </section>
      <section id="history" className="wrap section">
        <CenterTitle title="1975년부터 지금까지" text="춘천 사람들의 첫 놀이공원이 소나무 숲과 함께 50년 동안 같은 자리를 지켜 왔어요" />
        <ol className="timeline">
          <li><p className="t-band c-primary">1975</p><p className="t-strong">육림랜드 개장</p><p className="t-small c-sub">춘천 영서로에 놀이공원과 동물원이 문을 열었어요.</p></li>
          <li><p className="t-band c-primary">2026</p><p className="t-strong">계절 프로그램 시작</p><p className="t-small c-sub">낮에는 보물찾기와 총게임, 밤에는 야간 체험이 이어져요.</p></li>
        </ol>
      </section>
      <Teaser id="daynight" slot="zombie-night" tone={3} title="낮과 밤 두 얼굴">
        <p>낮에는 아이들과 가족이 보물찾기 숲을 누비고, 밤에는 청년과 어른이 조명이 꺼진 놀이공원에서 모험을 떠나요.</p>
        <CheckList items={['낮 보물찾기와 먹이 주기, 동물 교감 카페', '밤 야간 총게임과 좀비 숲, 캠핑']} />
      </Teaser>
      <Teaser id="seasons" slot="map-aerial" tone={1} flip title="계절마다 새로 열려요" cta="시즌 이벤트" to="/play/season">
        <p>봄에는 보물찾기, 여름에는 좀비 숲, 가을에는 총게임 리그, 겨울에는 캠핑 데이가 열려요.</p>
        <CheckList items={['봄 숲속 보물찾기', '여름 한밤의 좀비 숲', '가을 숲속 총게임 리그', '겨울 소나무 숲 캠핑 데이']} />
      </Teaser>
    </>
  )
}

const typeOf = (n) => (n.link?.startsWith('/play') ? 'event' : 'notice')

export function News() {
  const [sp, setSp] = useSearchParams()
  const t = sp.get('type')
  const list = [...notices].sort((a, b) => b.date.localeCompare(a.date)).filter((n) => !t || typeOf(n) === t)
  return (
    <>
      <PlainHero title="육림랜드 소식" text="공지사항과 이벤트 소식을 전해요." />
      <section className="wrap section">
        <div className="choices news__tabs" role="tablist" aria-label="소식 분류">
          {[[null, '전체'], ['notice', '공지사항'], ['event', '이벤트']].map(([k, l]) => <button key={l} role="tab" aria-selected={t === k} className="choice" onClick={() => setSp(k ? { type: k } : {})}>{l}</button>)}
        </div>
        <ul className="news">
          {list.map((n) => (
            <li key={n.id}>
              <Link to={`/news/${n.id}`} className="news__row">
                <span className="t-strong c-action">{typeOf(n) === 'event' ? '이벤트' : '공지'}</span>
                <span className="t-label news__title">{n.title}</span>
                <span className="t-small c-sub news__date"><CalendarDays size={20} aria-hidden />{dotDate(n.date)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export function NewsDetail() {
  const { id } = useParams()
  const n = notices.find((x) => x.id === id)
  if (!n) return <Navigate to="/news" replace />
  return (
    <section className="wrap section">
      <div className="article stack-5">
        <p className="t-small c-sub">{dotDate(n.date)}</p>
        <h1 className="t-band">{n.title}</h1>
        <p className="t-body">{n.body}</p>
        <div className="article__btns"><Btn to={n.link}>관련 안내</Btn><Btn variant="deep" to="/news">소식 목록</Btn></div>
      </div>
    </section>
  )
}

export function My() {
  const store = useStore()
  return (
    <>
      <PlainHero title="내 예약" text="이 기기에 저장된 예약이에요." />
      <section className="wrap section stack-5">
        <h2 className="t-label">내 예약</h2>
        {!store.reservations.length && <div className="stack-4"><p className="t-body c-sub">아직 예약이 없어요.</p><div><Btn to="/reserve">예약</Btn></div></div>}
        <ul className="myres">
          {store.reservations.map((r) => (
            <li key={r.no} className="myres__item">
              <div className="stack-2">
                <p className="t-small c-sub">예약 번호 {r.no}</p>
                <p className="t-label">{r.name} {r.mode}</p>
                <p className="t-body">{dotDate(r.date)} {r.time}, {r.people}명, {won(r.total)}</p>
              </div>
              <div className="myres__btns">
                <Btn sm to={`/reserve/done?no=${r.no}`}><Ticket size={20} aria-hidden />티켓</Btn>
                <Btn sm variant="deep" onClick={() => store.cancelReservation(r.no)}><Trash2 size={20} aria-hidden />취소</Btn>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export function NotFound() {
  return (
    <>
      <PlainHero title="없는 화면" text="주소가 바뀌었거나 사라진 화면이에요." />
      <section className="wrap section center"><Btn to="/">홈으로</Btn></section>
    </>
  )
}
