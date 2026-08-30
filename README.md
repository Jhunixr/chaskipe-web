# Frontend — Chaski Pe

Aplicacion movil (mobile first) construida con **React + TypeScript + Vite** y
**React Router**. Estado actual: **FASE 6 — el modelo de IA esta conectado a
"Senas a texto"** (modelo de prueba con datos sinteticos; aun no reconoce
senas reales).

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
│   ├── avatar/        # AvatarView (sin Three.js todavia)
│   └── ui/            # Button, Card, Icon, PageHeader, Stepper, Toggle,
│                      # TextInput, PasswordInput, DemoBadge
├── pages/             # una carpeta de archivos por pantalla
├── hooks/             # useCamera, useHandLandmarker, useSignRecognition,
│                      # useSpeech, useTextScale
├── services/          # handLandmarker (MediaPipe), signFeatures + signModel
│                      # (clasificador MLP en el navegador), recognition, mockData
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

## Reconocimiento de senas (FASE 5 + 6)

- `signFeatures.ts` (= `ai/scripts/features.py`, verificado < 1e-6) resume la
  grabacion en 381 features.
- `signModel.ts` carga `public/models/sign/{model,scaler,labels}.json` y hace la
  inferencia **en el navegador** (MLP pequeno = multiplicacion de matrices, sin
  TensorFlow.js).
- `useSignRecognition` orquesta: grabar ~2 s de landmarks -> features ->
  prediccion, con umbral de confianza (60%) y comprobacion de manos (>=40% de
  los frames).
- **Senas a texto**: "Analizar sena" graba, reconoce y muestra la palabra +
  confianza. Estados: "Grabando...", "Reconociendo...", "No estoy seguro (X%)",
  "No se vieron las manos". La palabra pasa a la pantalla de resultado.
- El modelo se genera con los scripts de `ai/` (ver `ai/README.md`). Si no
  existe, la pantalla lo avisa.

## Alcance actual

- **El modelo actual esta entrenado con datos SINTETICOS**: reconoce, pero no
  son senas reales. `labels.json` lo marca (`includesSynthetic: true`) y la
  pantalla lo avisa. El modelo real necesita un dataset validado con personas
  usuarias de LSP o interpretes.
- **No** hay autenticacion real: login/registro son de demostracion.
- **No** hay backend ni avatar 3D.
- Funciona de verdad: navegacion, camara en vivo, deteccion de manos,
  reconocimiento con el MLP, lectura por voz (Web Speech API), ajuste de texto.
- Las equivalencias texto <-> sena son **demostrativas**; deben validarse con
  personas usuarias de LSP o interpretes.
