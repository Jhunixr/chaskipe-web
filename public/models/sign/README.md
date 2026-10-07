# Modelo de reconocimiento de senas (TF.js) — FASE 5

Aqui va el modelo exportado que el frontend usa para reconocer senas
**en el navegador**, sin servidor.

```
sign/
├── model.json    # arquitectura (capas densas) + pesos, formato "chaskipe-mlp"
├── scaler.json   # media / escala por feature (StandardScaler de sklearn)
└── labels.json   # clases + featureVersion
```

## Como se genera

```bash
cd ai
py -m venv .venv && .venv\Scripts\activate      # (Windows)
pip install -r requirements.txt

# 1. (solo para probar sin datos reales) dataset sintetico
py scripts/synth_dataset.py --per-class 40

# 2. features -> ai/data/processed/
py scripts/preprocess.py

# 3. entrenar -> ai/models/
py scripts/train.py

# 4. evaluar (CV, matriz de confusion)
py scripts/evaluate.py

# 5. exportar aqui
py scripts/export_tfjs.py
```

## Importante

- Estos archivos **no se versionan** (`.gitignore`). Cada quien los genera.
- Si el modelo se entreno con `synth_dataset.py`, `labels.json` tiene
  `"includesSynthetic": true` y **no reconoce senas reales**: sirve solo para
  validar la integracion (FASE 6).
- La extraccion de features del frontend (`src/services/signFeatures.ts`) debe
  coincidir con la de Python (`ai/scripts/features.py`). Verificado: coinciden
  con diferencia < 1e-6.
- El modelo real solo sera valido tras entrenar con muestras validadas por
  personas usuarias de LSP o interpretes.
