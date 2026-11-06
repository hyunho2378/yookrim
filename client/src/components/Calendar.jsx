// Calendar.jsx  레고랜드 운영 캘린더 틀. 큰 칸마다 날짜와 운영시간, 휴무를 쓴다. 운영체제 날짜 선택 창을 쓰지 않는다.
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ymd, kstDate } from '../lib/data'

const DOW = ['월', '화', '수', '목', '금', '토', '일']

export default function Calendar({ month, onMonth, selected, onSelect, info, minDate, label = '운영 캘린더' }) {
  const y = month.getFullYear(), m = month.getMonth()
  const first = new Date(y, m, 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(y, m, i + 1))]
  while (cells.length % 7) cells.push(null)
  const today = ymd(kstDate())
  return (
    <div className="cal" aria-label={label}>
      <div className="cal__head">
        <button className="cal__nav" onClick={() => onMonth(new Date(y, m - 1, 1))} aria-label="이전 달"><ChevronLeft size={24} aria-hidden /></button>
        <p className="t-label" aria-live="polite">{y}년 {m + 1}월</p>
        <button className="cal__nav" onClick={() => onMonth(new Date(y, m + 1, 1))} aria-label="다음 달"><ChevronRight size={24} aria-hidden /></button>
      </div>
      <div className="cal__grid" role="grid">
        {DOW.map((d) => <div key={d} className="cal__dow t-strong" role="columnheader">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="cal__cell cal__cell--empty" role="gridcell" aria-hidden />
          const key = ymd(d)
          const it = info(d)
          const past = minDate ? key < minDate : key < today
          const disabled = past || !it.open || !onSelect
          const sel = selected === key
          return (
            <button key={key} role="gridcell" aria-selected={sel} disabled={!onSelect ? undefined : disabled} tabIndex={onSelect ? undefined : -1}
              className={`cal__cell ${sel ? 'is-sel' : ''} ${past ? 'is-past' : ''} ${!it.open ? 'is-closed' : ''} ${key === today ? 'is-today' : ''} ${!onSelect ? 'is-static' : ''}`}
              onClick={() => onSelect && !disabled && onSelect(key)}
              aria-label={`${m + 1}월 ${d.getDate()}일 ${it.text}`}>
              <span className="cal__date t-strong">{d.getDate()}</span>
              <span className="cal__info t-small">{it.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
