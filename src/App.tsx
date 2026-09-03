import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/router'
import { PreferencesProvider } from '@/context/PreferencesProvider'

export default function App() {
  return (
    <PreferencesProvider>
      <RouterProvider router={router} />
    </PreferencesProvider>
  )
}
