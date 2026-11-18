import { services } from '../data'

export default function Services() {
  return (
    <section className="services" id="services">
      <h2>Work with the studio</h2>
      <dl>
        {services.map((service) => (
          <div key={service.title}>
            <dt>{service.title}</dt>
            <dd>{service.desc}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
