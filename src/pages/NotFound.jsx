import { Link } from 'react-router-dom'
import { usePageTitle } from '../components/Common'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <section className="band first">
      <h1 className="page-title">Page not found</h1>
      <p className="status">This page may have moved or is no longer published.</p>
      <Link to="/designs" className="btn">View designs</Link>
    </section>
  )
}
