import { Link } from 'react-router'
import { siteContent } from '../../data/siteContent.js'

export default function SiteLayout({ children }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        {siteContent.skipLink}
      </a>
      <header className="border-b border-beige py-6">
        <Link to="/" className="text-2xl font-extrabold">{siteContent.name}</Link>
        <nav aria-label={siteContent.navigationLabel} className="mt-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {siteContent.navigation.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="underline hover:decoration-pink">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1} className="flex-1 py-10">
        {children}
      </main>
      <footer className="border-t border-beige py-6 text-sm text-muted">
        {siteContent.disclaimer}
      </footer>
    </div>
  )
}
