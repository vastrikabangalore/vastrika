import { site } from '../data'

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <h2>Tell us what you would like made.</h2>
      <p>For commissions, collaborations and studio appointments.</p>
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </section>
  )
}
