import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Collections from './components/Collections'
import Services from './components/Services'
import Contact from './components/Contact'

const year = new Date().getFullYear()

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Collections />
        <Services />
        <Contact />
      </main>
      <footer className="footer">© {year} Vastrika. All rights reserved.</footer>
    </>
  )
}
