# Frontend — Chaski Pe

Aplicacion movil (mobile first) construida con **React + TypeScript + Vite** y
**React Router**. Estado actual: **FASE 1 — estructura y pantallas base**.

## Requisitos

- Node.js 20+ y npm

## Comandos

```bash
cd frontend
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # verificacion de tipos + build de produccion
npm run preview  # servir el build
npm run lint     # linter (oxlint)
```

## Estructura

```
src/
├── app/           # router y definicion de rutas
├── components/
│   ├── layout/    # AppLayout, BottomNav
│   ├── camera/    # CameraPlaceholder (sin camara real todavia)
│   ├── translation/ # TranslationOutput
│   ├── avatar/    # AvatarView (sin Three.js todavia)
│   └── ui/        # Button, Card, PageHeader, DemoBadge
├── pages/         # una carpeta por pantalla
├── hooks/         # useSpeech (Web Speech API)
├── services/      # mockData (datos de ejemplo)
├── types/         # tipos de dominio
├── utils/         # formato de fechas / etiquetas
└── styles/        # theme.css + utilities.css
```

## TypeScript

Configuracion **estricta** (`strict: true` y flags adicionales como
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Evitar `any`.

## Alcance FASE 1

- Solo interfaz. **No** hay camara real, MediaPipe, IA, backend ni avatar 3D.
- Los datos de señas LSP son **DEMO** y estan marcados como tales; deben
  validarse con personas usuarias de LSP o interpretes.
