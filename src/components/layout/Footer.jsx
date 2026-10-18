import { Link } from 'react-router'
import { siteContent } from '../../data/siteContent.js'
import { homeContent } from '../../data/homeContent.js'

export default function Footer() {
  return (
    <footer className="bg-white py-10 md:py-16">
      <div className="content-width grid gap-5 md:grid-cols-2">
        <Link to="/" className="w-fit text-lg font-extrabold">
          {siteContent.name} <span aria-hidden="true">♡</span>
        </Link>
        <nav aria-label={homeContent.footer.navigationLabel} className="flex flex-col md:flex-row md:justify-end md:gap-8">
          {homeContent.navigation.map(({ to, label }) => (
            <Link key={to} to={to} className="flex min-h-11 w-fit items-center text-sm font-bold hover:underline">{label}</Link>
          ))}
        </nav>
        <p className="text-sm text-muted">{homeContent.footer.tagline}</p>
        <div className="space-y-2 text-xs text-muted md:text-right">
          <p>{homeContent.footer.demo}</p>
          <p>{siteContent.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
