# Modelo de reconocimiento de senas (TF.js) — FASE 5

Aqui va el modelo exportado que el frontend usa para reconocer senas
**en el navegador**, sin servidor.

```
sign/
├── model.json    # arquitectura (capas densas) + pesos, formato "chaskipe-mlp"
├── scaler.json   # media / escala por feature (StandardScaler de sklearn)
└── labels.json   # clases + featureVersion
```

## Modelo actual

Entrenado con grabaciones reales de `/dev/dataset` (una persona, sin validar
aun con LSP): **HOLA, GRACIAS, ADIOS, CUIDATE** y **REPOSO** (mano sin sena).
Accuracy con grabaciones que el modelo no vio: **83 %**. Detalle y como
regenerarlo: `chaskipe-ai/README.md` (seccion "Flujo de trabajo").

```bash
# en chaskipe-ai
py scripts/preprocess.py --only HOLA,GRACIAS,ADIOS,CUIDATE,REPOSO --augment 8
py scripts/evaluate.py
py scripts/train.py --val-split 0 --epochs 80
py scripts/export_tfjs.py
```

## Importante

- La extraccion de features de la web (`src/services/signFeatures.ts`) debe
  coincidir con la de Python (`ai/scripts/features.py`). Verificado: pasando
  las 41 grabaciones por el codigo de la web, acierta las 41, igual que Python.
- El modelo solo sera confiable tras entrenar con mas grabaciones, de varias
  personas, validadas por personas usuarias de LSP o interpretes.
