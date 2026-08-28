import { Outlet } from 'react-router-dom'

import { BottomNav } from './BottomNav'

import './AppLayout.css'

/**
 * Contenedor mobile-first: limita el ancho a un dispositivo movil,
 * renderiza la ruta activa y mantiene la barra de navegacion inferior fija.
 */
export function AppLayout() {
  return (
    <div className="app-shell">
      <main className="app-shell__content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
