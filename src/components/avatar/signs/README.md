# Senas grabadas para el avatar

Cada `<ETIQUETA>.json` es una sena completa que el avatar reproduce tal cual
(forma de la mano y movimiento de la muneca, cuadro a cuadro). Si el texto
contiene esa palabra, el avatar hace la sena en vez de deletrearla.

Se generan a partir de una grabacion de `/dev/dataset`:

```bash
python ai/scripts/export_avatar_sign.py ai/data/raw/HOLA/HOLA__2026-...json
# o una carpeta: elige la grabacion con mas cuadros con la mano visible
python ai/scripts/export_avatar_sign.py ai/data/raw/HOLA/
```

Usar solo grabaciones de senas hechas o revisadas por personas usuarias de
LSP o interpretes.
