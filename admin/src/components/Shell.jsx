import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/designs', label: 'Designs' },
  { to: '/collections', label: 'Collections' },
  { to: '/categories', label: 'Categories' },
  { to: '/posts', label: 'Posts' },
]

export default function Shell() {
  const { user, signOut } = useAuth()
  const siteUrl = import.meta.env.VITE_SITE_URL

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Vastrika</div>
        <nav aria-label="Admin">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
          ))}
        </nav>
        <div className="side-foot">
          {siteUrl && <a href={siteUrl} target="_blank" rel="noreferrer">View site</a>}
          <span className="who">{user?.email}</span>
          <button onClick={signOut}>Log out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
