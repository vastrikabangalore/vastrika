import { collections } from '../data'

export default function Collections() {
  return (
    <section className="section" id="collections">
      <p className="eyebrow">Portfolio</p>
      <h2>Collections</h2>
      <div className="grid">
        {collections.map((c) => (
          <article key={c.title} className="card">
            <div className="card-img" style={{ background: c.color }}>
              <span>{c.title}</span>
            </div>
            <div className="card-body">
              <p className="season">{c.season}</p>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
