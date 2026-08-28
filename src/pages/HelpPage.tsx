import { Card, PageHeader } from '@/components/ui'

import './pages.css'

interface HelpTopic {
  title: string
  body: string
}

const TOPICS: HelpTopic[] = [
  {
    title: 'Como usar la camara',
    body: 'Busca un lugar con buena luz, muestra ambas manos y manten el rostro visible dentro del recuadro.',
  },
  {
    title: 'Como responder con el avatar',
    body: 'Escribe tu mensaje en "Texto a senas". En una version futura el avatar reproducira la secuencia en LSP.',
  },
  {
    title: 'Consejos para mejores resultados',
    body: 'Realiza las senas a un ritmo constante, evita fondos con mucho movimiento y acerca las manos a la camara.',
  },
]

const FAQ: HelpTopic[] = [
  {
    title: '¿La app ya reconoce senas?',
    body: 'Todavia no. Esta version muestra la interfaz; el reconocimiento con MediaPipe e IA llega en fases posteriores.',
  },
  {
    title: '¿La LSP es igual al espanol escrito?',
    body: 'No. La Lengua de Senas Peruana tiene su propia gramatica. Las equivalencias mostradas son demostrativas.',
  },
  {
    title: '¿Se graban mis videos?',
    body: 'No se guardan videos automaticamente. Cualquier registro futuro requerira tu consentimiento.',
  },
]

export function HelpPage() {
  return (
    <div className="page">
      <PageHeader title="Ayuda" subtitle="Guia rapida y preguntas frecuentes." />

      <section className="page__section">
        <h2 className="section-title">Guias</h2>
        {TOPICS.map((topic) => (
          <Card key={topic.title} className="stack-sm">
            <h3>{topic.title}</h3>
            <p className="text-muted text-sm">{topic.body}</p>
          </Card>
        ))}
      </section>

      <section className="page__section">
        <h2 className="section-title">Preguntas frecuentes</h2>
        {FAQ.map((item) => (
          <Card key={item.title} className="stack-sm">
            <h3>{item.title}</h3>
            <p className="text-muted text-sm">{item.body}</p>
          </Card>
        ))}
      </section>

      <section className="page__section">
        <h2 className="section-title">Soporte</h2>
        <Card className="stack-sm">
          <p className="text-sm">
            ¿Necesitas mas ayuda? Escribe a{' '}
            <strong>soporte@chaskipe.example.pe</strong>
          </p>
        </Card>
      </section>
    </div>
  )
}
