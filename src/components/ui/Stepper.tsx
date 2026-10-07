import './Stepper.css'

interface StepperProps {
  total: number
  current: number
  label?: string
}

/** Indicador de progreso por puntos (paso actual resaltado). */
export function Stepper({ total, current, label = 'Progreso' }: StepperProps) {
  return (
    <div
      className="stepper"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={label}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={[
            'stepper__dot',
            index + 1 === current ? 'stepper__dot--active' : '',
            index + 1 < current ? 'stepper__dot--done' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ))}
    </div>
  )
}
