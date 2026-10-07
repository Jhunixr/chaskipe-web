# Assets de MediaPipe (FASE 3)

Archivos del runtime y modelos de **MediaPipe Tasks Vision**, servidos localmente
por la app (sin depender de un CDN, funciona offline).

## Contenido

```
mediapipe/
├── wasm/
│   ├── vision_wasm_internal.js / .wasm         # runtime con SIMD
│   └── vision_wasm_nosimd_internal.js / .wasm  # fallback sin SIMD
└── models/
    └── hand_landmarker.task                    # Hand Landmarker (float16)
```

## Origen

- **wasm/**: copiado de `node_modules/@mediapipe/tasks-vision/wasm/`
  (paquete `@mediapipe/tasks-vision`, ver version en `frontend/package.json`).
- **hand_landmarker.task**: descargado de
  `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task`

## Como actualizarlos

```bash
cd frontend
npm install @mediapipe/tasks-vision@latest
cp node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.* public/mediapipe/wasm/
cp node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_nosimd_internal.* public/mediapipe/wasm/
curl -L -o public/mediapipe/models/hand_landmarker.task \
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
```

## Alcance FASE 3

Solo **deteccion de manos** (21 landmarks por mano, hasta 2 manos) sobre el video
de la camara. **No** hay reconocimiento de senas ni modelo de IA: eso llega en la
FASE 5. Pose y rostro se pueden anadir mas adelante.
