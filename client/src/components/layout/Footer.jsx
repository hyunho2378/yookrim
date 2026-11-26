// Footer.jsx  푸터 구조: 초록 알림 신청 판, 하늘색 줄, 남색 메뉴 줄, 흰 정보 줄.
import { Link } from 'react-router-dom'
import { site } from '../../lib/data'

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr__nav">
        <div className="wrap">
          <nav className="ftr__links" aria-label="바로가기">
            {[['운영 캘린더', '/guide/calendar'], ['요금 안내', '/guide'], ['오시는 길', '/guide/directions'], ['공간 지도', '/map'], ['리플릿', '/leaflet'], ['자주 묻는 질문', '/guide/faq'], ['프로젝트', '/project'], ['소식', '/news']].map(([l, to]) => <Link key={to} to={to} className="t-body">{l}</Link>)}
          </nav>
        </div>
      </div>
      <div className="ftr__info">
        <div className="wrap stack-3">
          <p className="t-small">{site.address} | {site.name} | <a href={site.officialSite} target="_blank" rel="noreferrer">공식 사이트</a></p>
          <p className="t-small">대표 전화 {site.phone} | 평일 {site.hours.weekday.replace('-', ' - ')} | 주말 {site.hours.weekend.replace('-', ' - ')} | 매주 {site.hours.closedDay} 휴무({site.hours.closedDayNote})</p>
        </div>
      </div>
    </footer>
  )
}
