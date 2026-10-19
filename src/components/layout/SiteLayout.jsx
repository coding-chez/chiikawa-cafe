import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { siteContent } from '../../data/siteContent.js'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function SiteLayout({ children }) {
  const location = useLocation()
  const previousPathname = useRef(null)

  useEffect(() => {
    if (location.hash) {
      // Runs after the destination page mounts, including navigation from placeholders.
      const target = document.getElementById(location.hash.slice(1))
      target?.scrollIntoView()
    } else if (previousPathname.current !== location.pathname) {
      window.scrollTo(0, 0)
    }
    previousPathname.current = location.pathname
  }, [location.pathname, location.hash, location.key])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content"
        className="sr-only fixed left-5 top-3 z-50 rounded-xl bg-white p-3 font-bold focus:not-sr-only">
        {siteContent.skipLink}
      </a>
      <Navbar key={location.key} />
      <main id="main-content" tabIndex={-1}
        className={'flex-1 ' + ((location.pathname === '/' || location.pathname === '/menu' || location.pathname.startsWith('/menu/')) ? 'bg-beige' : 'content-width w-full py-10')}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
