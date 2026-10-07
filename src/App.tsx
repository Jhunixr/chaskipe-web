import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/router'
import { AuthProvider } from '@/context/AuthProvider'
import { PreferencesProvider } from '@/context/PreferencesProvider'

/** `PreferencesProvider` consulta la sesion, asi que va dentro de `AuthProvider`. */
export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <RouterProvider router={router} />
      </PreferencesProvider>
    </AuthProvider>
  )
}
