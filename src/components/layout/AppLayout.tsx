import { Outlet } from 'react-router-dom'

import { BottomNav } from './BottomNav'

import './AppLayout.css'

interface AppLayoutProps {
  /** Oculta la barra inferior (flujos de auth / pantallas a pantalla completa). */
  hideNav?: boolean
}

/**
 * Contenedor mobile-first: limita el ancho a un dispositivo movil,
 * renderiza la ruta activa y mantiene la barra de navegacion inferior fija.
 */
export function AppLayout({ hideNav = false }: AppLayoutProps) {
  return (
    <div className={`app-shell${hideNav ? ' app-shell--no-nav' : ''}`}>
      <main className="app-shell__content">
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
