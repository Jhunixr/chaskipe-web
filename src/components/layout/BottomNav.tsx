import { NavLink } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { Icon, type IconName } from '@/components/ui'

import './BottomNav.css'

interface NavItem {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home, label: 'Inicio', icon: 'home', end: true },
  { to: ROUTES.conversation, label: 'Conversacion', icon: 'chat' },
  { to: ROUTES.history, label: 'Historial', icon: 'clock' },
  { to: ROUTES.profile, label: 'Perfil', icon: 'user' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end ?? false}
          className={({ isActive }) =>
            ['bottom-nav__item', isActive ? 'bottom-nav__item--active' : '']
              .filter(Boolean)
              .join(' ')
          }
        >
          <Icon name={item.icon} size={22} />
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
