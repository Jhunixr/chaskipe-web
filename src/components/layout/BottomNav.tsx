import { NavLink } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import './BottomNav.css'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home, label: 'Inicio', icon: '⌂' },
  { to: ROUTES.conversation, label: 'Conversacion', icon: '⇄' },
  { to: ROUTES.quickPhrases, label: 'Frases', icon: '✦' },
  { to: ROUTES.profile, label: 'Perfil', icon: '○' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === ROUTES.home}
          className={({ isActive }) =>
            ['bottom-nav__item', isActive ? 'bottom-nav__item--active' : '']
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
