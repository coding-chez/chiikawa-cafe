import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import useCart from '../../hooks/useCart.js'
import { cartContent } from '../../data/cartContent.js'
import { siteContent } from '../../data/siteContent.js'
import { homeContent } from '../../data/homeContent.js'

function CartLink() {
  const { itemCount } = useCart()
  const cart = homeContent.navigation.find(({ to }) => to === '/cart')
  return (
    <NavLink to={cart.to} aria-label={cartContent.badgeLabel(itemCount)}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink bg-pink px-3 font-extrabold hover:bg-pink/75 md:px-6">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
        className="size-5 md:hidden" aria-hidden="true">
        <path d="M3 4h3l3 12h10l2-9H7M10 20h.01M18 20h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="hidden md:inline">{cart.label}</span>
      <span data-cart-badge className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs" aria-hidden="true">{itemCount}</span>
    </NavLink>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const links = homeContent.navigation.filter(({ to }) => to !== '/cart')

  useEffect(() => {
    if (!open) return
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className="relative z-10 bg-white">
      <div className="content-width flex h-[72px] items-center justify-between gap-2 md:h-[88px]">
        <Link to="/" className="shrink-0 text-sm font-extrabold min-[360px]:text-base sm:text-xl">
          {siteContent.name} <span aria-hidden="true">♡</span>
        </Link>
        <nav aria-label={siteContent.navigationLabel} className="hidden items-center gap-8 md:flex">
          {links.map(({ to, label }) => (
            to.includes('#') ? (
              <Link key={to} to={to} className="nav-link">{label}</Link>
            ) : (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => 'nav-link ' + (isActive ? 'nav-link-active' : '')}>
                {label}
              </NavLink>
            )
          ))}
          <CartLink />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <CartLink />
          <button ref={toggleRef} type="button" aria-expanded={open} aria-controls="mobile-navigation"
            aria-label={open ? homeContent.accessibility.closeMenu : homeContent.accessibility.openMenu}
            onClick={() => setOpen(!open)}
            className="flex size-12 items-center justify-center rounded-full border border-ink bg-white hover:bg-cream">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" aria-hidden="true">
              {open ? <path d="m6 6 12 12M6 18 18 6" strokeLinecap="round" /> :
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" aria-label={siteContent.navigationLabel} hidden={!open}
        className="border-t border-beige px-5 pb-4 md:hidden"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== toggleRef.current) {
            setOpen(false)
          }
        }}>
        {homeContent.navigation.map(({ to, label }) => (
          <Link key={to} to={to} onClick={() => setOpen(false)}
            className="flex min-h-12 items-center rounded-xl px-3 font-bold hover:bg-cream">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
