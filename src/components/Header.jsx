import { useState } from 'react'

const links = ['About', 'Collections', 'Services', 'Contact']

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="header">
      <a href="#top" className="logo">Vastrika</a>
      <button className="menu-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>
      <nav className={open ? 'nav open' : 'nav'}>
        {links.map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}>{l}</a>
        ))}
      </nav>
    </header>
  )
}
