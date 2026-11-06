// ui/index.jsx  공용 부품. 버튼과 링크, 사진 자리, 펼침 목록, 체크 상자, 대화 상자.
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, X } from 'lucide-react'
import { slots } from '../../lib/slots'

// 버튼 모양 링크와 버튼. to 가 있으면 이동, 없으면 동작
export function Btn({ to, variant, block, sm, children, className = '', ...rest }) {
  const cls = ['btn', variant && `btn--${variant}`, block && 'btn--block', sm && 'btn--sm', className].filter(Boolean).join(' ')
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  return <button type="button" className={cls} {...rest}>{children}</button>
}

export function More({ to, children }) {
  return <Link to={to} className="more t-body"><ArrowRight size={20} className="ico" aria-hidden />{children}</Link>
}

// 사진 자리. 파일이 있으면 사진, 없으면 블록 색 면에 자리 이름을 쓴다
export function Photo({ slot, ratio = '4 / 3', tone = 0, round, alt, className = '', style, children, fill }) {
  const s = slots[slot] || { file: `${slot}.jpg`, label: slot, team: '' }
  const [ok, setOk] = useState(null)
  const sizing = fill ? { position: 'absolute', inset: 0 } : { aspectRatio: ratio }
  return (
    <div className={`photo ${round ? 'photo--round' : ''} ${className}`} style={{ ...sizing, '--slot': `var(--slot-${tone % 4})`, ...style }} data-slot={slot} data-loaded={ok ? '' : undefined}>
      {ok !== false && (
        <img src={`${import.meta.env.BASE_URL}images/${s.file}`} alt={alt || s.label} onLoad={() => setOk(true)} onError={() => setOk(false)} style={{ opacity: ok ? 1 : 0 }} />
      )}
      {ok !== true && (
        <div className="photo__slot" aria-hidden={!!alt}>
          <b>{s.label}</b>
          <span>이미지 준비 중</span>
        </div>
      )}
      {children}
    </div>
  )
}

export function Accordion({ items, defaultOpen = -1 }) {
  const [open, setOpen] = useState(defaultOpen)
  const base = useId()
  return (
    <div className="acc">
      {items.map((it, i) => {
        const on = open === i
        return (
          <div className="acc__item" key={i}>
            <button className="acc__head t-strong" aria-expanded={on} aria-controls={`${base}-${i}`} onClick={() => setOpen(on ? -1 : i)}>
              <span>{it.q}</span><ChevronDown size={24} className="ico" aria-hidden />
            </button>
            <div id={`${base}-${i}`} className="acc__body t-body" hidden={!on}>{it.a}</div>
          </div>
        )
      })}
    </div>
  )
}

export function CheckBox({ checked, onChange, children }) {
  return (
    <label className="check t-body">
      <span className="check__box">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <Check size={16} strokeWidth={3} aria-hidden />
      </span>
      <span>{children}</span>
    </label>
  )
}

// 대화 상자. 운영체제 기본 창을 쓰지 않는다. 열리면 초점을 안으로 옮기고 Esc 로 닫는다
export function Dialog({ open, onClose, title, children, wide }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    const t = setTimeout(() => ref.current?.querySelector('button, a, input')?.focus(), 0)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.documentElement.classList.add('lock')
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); document.documentElement.classList.remove('lock'); prev?.focus?.() }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="dlg" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`dlg__box ${wide ? 'dlg__box--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <button className="dlg__x" onClick={onClose} aria-label="닫기"><X size={24} aria-hidden /></button>
        {children}
      </div>
    </div>
  )
}

// 알림 한 줄. 화면 아래에서 잠깐 보였다 사라진다
export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t) }, [msg])
  const node = <div className={`toast t-strong ${msg ? 'toast--on' : ''}`} role="status" aria-live="polite">{msg}</div>
  return [node, setMsg]
}

// 절 단위 줄바꿈. "|" 로 나눈 덩어리를 한 줄 안에서 끊기지 않게 묶는다
export function Lines({ text }) {
  const parts = String(text).split('|')
  return <>{parts.map((p, i) => <span key={i}><span className="clause">{p.trim()}</span>{i < parts.length - 1 ? ' ' : ''}</span>)}</>
}
