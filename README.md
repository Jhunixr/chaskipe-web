# Frontend — Chaski Pe

Aplicacion movil (mobile first) construida con **React + TypeScript + Vite** y
**React Router**. Estado actual: **FASE 9 — avatar 3D basico (Three.js)** en
"Texto a senas"; backend PostgreSQL para perfil/historial/frases.

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
│   ├── camera/        # CameraView (video), HandOverlay (landmarks)
│   ├── avatar/        # AvatarView + Avatar3D (Three.js, carga diferida),
│   │                  # rig, animation, scene
│   └── ui/            # Button, Card, Icon, PageHeader, Stepper, Toggle,
│                      # TextInput, PasswordInput, DemoBadge
├── pages/             # una carpeta de archivos por pantalla
├── hooks/             # useCamera, useHandLandmarker, useSignRecognition,
│                      # useApiResource, useBackendHealth, useSpeech, useTextScale
├── services/          # api (cliente REST con fallback a mock), handLandmarker,
│                      # signFeatures + signModel (MLP en el navegador),
│                      # recognition, mockData
├── types/             # tipos de dominio, handLandmarks, dataset
├── utils/             # formato de fechas / etiquetas
└── styles/            # theme.css + utilities.css

public/mediapipe/      # runtime wasm + modelo hand_landmarker.task (ver README ahi)
public/models/sign/    # modelo de reconocimiento de senas exportado (ver README ahi)
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
| `/dev/dataset`              | Captura de dataset (interna, FASE 4) | si  |
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

## Deteccion de manos (FASE 3)

- `@mediapipe/tasks-vision` con **Hand Landmarker** (21 puntos por mano, 2 manos).
- Assets locales en `public/mediapipe/` (wasm + `hand_landmarker.task`),
  ver `public/mediapipe/README.md`. Funciona offline.
- `useHandLandmarker`: carga el modelo y corre `detectForVideo` en un bucle
  de `requestAnimationFrame` sobre el `<video>`.
- `HandOverlay`: `<canvas>` que dibuja los landmarks sobre el video
  (con el mismo espejo que la camara frontal).
- En **Senas a texto** se muestra el estado: "Cargando detector...",
  "Muestra las manos", "1/2 manos detectadas".
- Primera carga: ~19 MB (wasm 11 MB + modelo 7.6 MB), luego queda en cache.

## Captura de dataset (FASE 4)

- Herramienta interna en `/dev/dataset` (`DatasetCollectorPage`).
- Elegir sena (HOLA/GRACIAS/AYUDA/SI/NO) -> grabar ~2 s con la camara +
  MediaPipe -> descargar un JSON por muestra.
- Solo se guardan coordenadas de landmarks, **no video**. Consentimiento
  obligatorio (checkbox) antes de poder grabar.
- Formato: `frontend/src/types/dataset.ts` <-> `ai/data/DATASET_FORMAT.md`.
- El JSON descargado se mueve a mano a `ai/data/raw/<ETIQUETA>/`.
- `useHandLandmarker` acepta `onFrame` para acumular la secuencia grabada.

## Reconocimiento de senas en tiempo real (FASE 5 + 6)

- `signFeatures.ts` (= `ai/scripts/features.py`, verificado < 1e-6) resume una
  ventana de landmarks en 381 features.
- `signModel.ts` carga `public/models/sign/{model,scaler,labels}.json` y hace la
  inferencia **en el navegador** (MLP pequeno = multiplicacion de matrices, sin
  TensorFlow.js).
- `useSignRecognition`: **analisis continuo**. Ventana deslizante de 2 s,
  prediccion cada ~300 ms. Muestra el candidato en vivo y lo **confirma** cuando
  la misma clase se mantiene >= 0.6 s por encima del 60 % de confianza. Tras
  confirmar, pausa ~1.2 s para no repetir la misma sena.
- **Senas a texto**: sin boton de disparo. Estados: "Muestra las manos",
  "<sena>..." (candidato, con barra de "manten la sena"), "Reconocido: <sena>".
  Botones: "Pausar analisis" / "Reanudar" / "Ver resultado" / "Reconocer otra".
- La sena confirmada pasa a la pantalla de resultado (con voz).
- El modelo se genera con los scripts de `ai/` (ver `ai/README.md`). Si no
  existe, la pantalla lo avisa.

## Backend (FASE 7 + 8)

- `src/services/api.ts`: cliente REST hacia `VITE_API_URL` (por defecto
  `http://localhost:8000`). **Fallback a mock**: si el backend no responde en
  4 s, se usan los datos de ejemplo y la app sigue funcionando.
- `useApiResource` / `useBackendHealth`: hooks de carga y de estado del backend.
- Conectados: **Historial** (lista, borrar), **Perfil** (ver, editar -> PUT),
  **Frases rapidas** (lista). Al reconocer/enviar una sena se guarda en el
  historial. El aviso indica si los datos estan en PostgreSQL, en memoria o
  son de ejemplo.
- Copia `.env.example` a `.env` para cambiar la URL del backend.

## Avatar 3D (FASE 9)

- `components/avatar/`: escena Three.js con un avatar **geometrico** (no un GLB)
  que respira, parpadea y puede reproducir un **gesto DEMO no validado**.
- `AvatarView` carga `Avatar3D` con `React.lazy`: el chunk de Three.js
  (~530 KB) solo se descarga al entrar a "Texto a senas".
- El gesto **no representa ninguna sena**. Un GLB con esqueleto y animaciones
  de LSP validadas es la FASE 10.

## Alcance actual

- **El modelo esta entrenado con datos SINTETICOS**: reconoce, pero no son
  senas reales. La pantalla lo avisa. Necesita un dataset validado con LSP.
- **El avatar no representa senas reales** (gesto DEMO).
- **No** hay autenticacion real: login/registro son de demostracion.
- Funciona de verdad: navegacion, camara en vivo, deteccion de manos,
  reconocimiento en tiempo real con el MLP, avatar 3D en reposo, perfil e
  historial via API (PostgreSQL), voz (Web Speech API), ajuste de texto.
- Las equivalencias texto <-> sena son **demostrativas**; deben validarse con
  personas usuarias de LSP o interpretes.
