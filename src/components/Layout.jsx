import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../data'

const links = [
  { to: '/designs', label: 'Designs' },
  { to: '/collections', label: 'Collections' },
  { to: '/journal', label: 'Journal' },
  { to: '/#about', label: 'About' },
  { to: '/#contact', label: 'Contact' },
]

function useScrollOnNavigate() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  useScrollOnNavigate()

  return (
    <div className="page">
      <a className="skip" href="#content">Skip to content</a>
      <div className="selvedge" aria-hidden="true" />
      <header className="header">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>Vastrika</Link>
        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="site-nav" className={open ? 'nav open' : 'nav'} aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="content">
        <Outlet />
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>{site.location}</span>
      </footer>
    </div>
  )
}
