# Frontend — Chaski Pe

Aplicacion movil (mobile first) construida con **React + TypeScript + Vite** y
**React Router**. Estado actual: **FASE 2 — camara del dispositivo integrada**
(sin MediaPipe ni IA todavia).

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
├── app/               # router y definicion de rutas
├── assets/mascot/     # logo e imagenes de la mascota (ver README ahi)
├── components/
│   ├── layout/        # AppLayout, BottomNav, FlowHeader
│   ├── brand/         # Logo, Mascot, Mountains (identidad visual)
│   ├── camera/        # CameraView (video en vivo, getUserMedia)
│   ├── avatar/        # AvatarView (sin Three.js todavia)
│   └── ui/            # Button, Card, Icon, PageHeader, Stepper, Toggle,
│                      # TextInput, PasswordInput, DemoBadge
├── pages/             # una carpeta de archivos por pantalla
├── hooks/             # useCamera (getUserMedia), useSpeech, useTextScale
├── services/          # mockData (datos de ejemplo)
├── types/             # tipos de dominio
├── utils/             # formato de fechas / etiquetas
└── styles/            # theme.css + utilities.css
```

## Identidad visual

- Fondo crema, color principal rojo, tarjetas blancas, detalles beige/dorado.
- Tipografia **Nunito** (Google Fonts) con fallback del sistema.
- Motivo de montanas peruanas sutil (`<Mountains />`), cenefa andina discreta.
- Mobile first, ancho maximo tipo telefono, navegacion inferior.

### Mascota / logo

Las imagenes reales van en `src/assets/mascot/`. Sin ellas, `<Mascot />` y
`<Logo />` muestran un marcador SVG limpio. Instrucciones en
`src/assets/mascot/README.md`.

## Rutas

| Ruta                        | Pantalla                    | Nav inferior |
| --------------------------- | --------------------------- | ------------ |
| `/`                         | Splash (carga)              | no           |
| `/bienvenida`               | Onboarding                  | no           |
| `/iniciar-sesion`           | Login                       | no           |
| `/crear-cuenta`             | Registro                    | no           |
| `/inicio`                   | Home                        | si           |
| `/camara/preparacion`       | Preparar camara             | si           |
| `/senas-a-texto`            | Senas a texto               | si           |
| `/senas-a-texto/resultado`  | Resultado                   | si           |
| `/texto-a-senas`            | Texto a senas + avatar      | si           |
| `/conversacion`             | Conversacion                | si           |
| `/frases`                   | Frases rapidas              | si           |
| `/historial`                | Historial                   | si           |
| `/perfil`                   | Perfil                      | si           |
| `/accesibilidad`            | Accesibilidad               | si           |
| `/ayuda`                    | Ayuda y tutorial            | si           |
| `*`                         | 404                         | no           |

## TypeScript

Configuracion **estricta** (`strict: true` + `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, etc.). Evitar `any`.

## Camara (FASE 2)

- `useCamera` abre la camara del dispositivo con `getUserMedia` (video, sin audio).
- `CameraView` muestra el video en vivo en **Preparar camara** y **Senas a texto**.
- Maneja: permiso pendiente, permiso denegado, sin camara, camara ocupada,
  navegador no compatible; con boton "Reintentar".
- Alterna camara frontal/trasera si el dispositivo tiene mas de una.
- La camara frontal se muestra en espejo.
- Requiere `localhost` o HTTPS (requisito de `getUserMedia`).

## Alcance actual

- **No** hay MediaPipe, extraccion de landmarks ni modelo de IA. El boton
  "Analizar sena" produce un resultado **DEMO** simulado.
- **No** hay autenticacion real: login/registro son de demostracion.
- **No** hay backend ni avatar 3D.
- Funciona de verdad: navegacion, camara en vivo, lectura por voz
  (Web Speech API) y el ajuste de tamano de texto.
- Los datos de senas LSP son **DEMO** y estan marcados como tales; deben
  validarse con personas usuarias de LSP o interpretes.
