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

const LEFT: NavItem[] = [
  { to: ROUTES.home, label: 'Inicio', icon: 'home', end: true },
  { to: ROUTES.quickPhrases, label: 'Frases', icon: 'grid' },
]

const RIGHT: NavItem[] = [
  { to: ROUTES.learn, label: 'Aprende', icon: 'cap' },
  { to: ROUTES.profile, label: 'Perfil', icon: 'user' },
]

function itemClass({ isActive }: { isActive: boolean }) {
  return ['bottom-nav__item', isActive ? 'bottom-nav__item--active' : '']
    .filter(Boolean)
    .join(' ')
}

function Item({ item }: { item: NavItem }) {
  return (
    <NavLink to={item.to} end={item.end ?? false} className={itemClass}>
      <span className="bottom-nav__icon">
        <Icon name={item.icon} size={24} />
      </span>
      <span className="bottom-nav__label">{item.label}</span>
    </NavLink>
  )
}

/**
 * Barra inferior: cuatro secciones y, al centro, el boton rojo de señas
 * (la accion principal de la app) siempre a mano del pulgar.
 */
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {LEFT.map((item) => (
        <Item key={item.to} item={item} />
      ))}
      <NavLink
        to={ROUTES.signToText}
        className={({ isActive }) =>
          ['bottom-nav__item', 'bottom-nav__item--fab', isActive ? 'bottom-nav__item--active' : '']
            .filter(Boolean)
            .join(' ')
        }
      >
        <span className="bottom-nav__fab">
          <Icon name="hands" size={32} />
        </span>
        <span className="bottom-nav__label">Señas</span>
      </NavLink>
      {RIGHT.map((item) => (
        <Item key={item.to} item={item} />
      ))}
    </nav>
  )
}
