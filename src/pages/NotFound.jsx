import { Link } from 'react-router-dom'
import { SplitText, usePageTitle } from '../components/Motion'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <section className="band first">
      <SplitText as="h1" className="page-title" text="Page not found" onLoad delay={0.2} />
      <p className="status">This page may have moved or is no longer published.</p>
      <Link to="/designs" className="btn"><span>View designs</span></Link>
    </section>
  )
}
