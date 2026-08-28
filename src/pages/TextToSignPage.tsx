import { useState } from 'react'

import { AvatarView } from '@/components/avatar/AvatarView'
import { Button, PageHeader } from '@/components/ui'

import './pages.css'

/**
 * FASE 1: estructura visual. No hay procesamiento de texto a LSP ni avatar 3D.
 * "Dictar respuesta" no captura audio todavia.
 */
export function TextToSignPage() {
  const [text, setText] = useState('')

  return (
    <div className="page">
      <PageHeader
        title="Texto a senas"
        subtitle="Escribe lo que quieres transmitir con el avatar."
      />

      <div className="field">
        <label className="field__label" htmlFor="text-to-sign-input">
          Tu mensaje
        </label>
        <textarea
          id="text-to-sign-input"
          className="field__textarea"
          placeholder="Estoy bien, gracias."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <AvatarView caption={text.trim() || undefined} />

      <p className="demo-note">
        La conversion de espanol a Lengua de Senas Peruana requiere un modelo y
        animaciones validadas; aun no esta disponible.
      </p>

      <div className="stack-sm">
        <Button fullWidth disabled={text.trim() === ''}>
          Enviar al avatar
        </Button>
        <Button variant="secondary" fullWidth>
          Dictar respuesta
        </Button>
      </div>
    </div>
  )
}
