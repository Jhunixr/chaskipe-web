# Assets de marca / mascota

Coloca aqui las imagenes del logo y la mascota del chaski.

## Archivos esperados

| Archivo               | Uso                                              |
| --------------------- | ------------------------------------------------ |
| `chaskipe-logo.png`   | Logo completo (mascota + wordmark + lema)        |
| `mascot.png`          | Solo la mascota, recortada, fondo transparente   |

Formato recomendado: **PNG con fondo transparente** (o SVG). Tamano sugerido
para `mascot.png`: 512×512 px o mas.

## Como activarlos

1. Guarda los archivos en esta carpeta con los nombres de arriba.
2. Abre [`src/components/brand/mascotAssets.ts`](../../components/brand/mascotAssets.ts).
3. Descomenta las importaciones y asigna las URLs:

   ```ts
   import chaskipeLogoUrl from '@/assets/mascot/chaskipe-logo.png'
   import mascotUrl from '@/assets/mascot/mascot.png'

   export const mascotAssets = {
     logo: chaskipeLogoUrl,
     mascot: mascotUrl,
   }
   ```

Mientras no existan, `<Mascot />` y `<Logo />` muestran un marcador SVG limpio
con la identidad de Chaski Pe (anillo tipo globo de dialogo).
