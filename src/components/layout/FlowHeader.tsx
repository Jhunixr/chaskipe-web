import { useNavigate } from 'react-router-dom'

import { Logo } from '@/components/brand'
import { Icon, Stepper } from '@/components/ui'

import './FlowHeader.css'

interface FlowHeaderProps {
  step: number
  totalSteps: number
  showBack?: boolean
}

/** Cabecera de los pasos del flujo de conversacion: logo + progreso. */
export function FlowHeader({ step, totalSteps, showBack = true }: FlowHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flow-header">
      <div className="flow-header__bar">
        {showBack ? (
          <button
            type="button"
            className="flow-header__back"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <Icon name="back" size={22} />
          </button>
        ) : (
          <span className="flow-header__spacer" />
        )}
        <Logo layout="row" mascotSize={30} />
        <span className="flow-header__spacer" />
      </div>
      <Stepper total={totalSteps} current={step} label="Paso del flujo" />
    </header>
  )
}
