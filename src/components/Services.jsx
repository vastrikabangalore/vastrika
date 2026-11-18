import { services } from '../data'

export default function Services() {
  return (
    <section className="section services" id="services">
      <p className="eyebrow">What I Offer</p>
      <h2>Services</h2>
      <div className="service-list">
        {services.map((s, i) => (
          <div key={s.title} className="service">
            <span className="num">0{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
