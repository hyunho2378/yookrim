// Animals.jsx  동물 친구들. 육림랜드 동물원에서 만나는 동물 사진 모음.
import { Link } from 'react-router-dom'
import { SubHero } from '../components/blocks'

const animals = [
  ['tiger', '호랑이'],
  ['bear', '아기 흑곰'],
  ['peacock', '공작'],
  ['eagle', '독수리'],
  ['alpaca', '알파카'],
  ['deer', '사슴'],
  ['lamb', '새끼 양'],
  ['goat', '염소'],
  ['guineapig', '기니피그'],
  ['raccoon', '라쿤'],
  ['fennec', '사막여우'],
  ['meerkat', '미어캣'],
  ['parrot', '앵무새'],
  ['mandarin', '원앙'],
  ['owl', '소쩍새'],
  ['chinchilla', '친칠라'],
  ['coati', '코아티'],
  ['rabbit', '토끼와 거북'],
  ['prairie', '프레리독'],
  ['squirrel', '다람쥐']
]

export default function Animals() {
  return (
    <>
      <SubHero slot="site-zoo" tone={1} title="동물 친구들" text="육림랜드 동물원에서 만날 수 있는 동물이에요" />
      <section className="wrap an">
        <ul className="an__grid">
          {animals.map(([id, name]) => (
            <li key={id} className="an__card">
              <div className="an__img"><img src={`${import.meta.env.BASE_URL}images/animals/${id}.jpg`} alt={name} loading="lazy" /></div>
              <p className="t-strong an__name">{name}</p>
            </li>
          ))}
        </ul>
        <div className="an__links">
          <Link to="/play/cafe" className="btn">동물 교감 카페</Link>
          <Link to="/play/attractions#zoo" className="btn btn--deep">먹이 주기 체험</Link>
        </div>
      </section>
    </>
  )
}
