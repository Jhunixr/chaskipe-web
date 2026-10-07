/**
 * Mascota de Chaski Pe: el globo de dialogo con el chaski, recorte circular
 * con fondo transparente (`src/assets/mascot/mascot.png`, generado a partir
 * del logo original `chaskipe-logo.png` que se conserva como referencia).
 *
 * Si falta la imagen, <Mascot /> dibuja un marcador SVG.
 */

import mascotUrl from '@/assets/mascot/mascot.png'

export const mascotAssets: {
  mascot: string | null
} = {
  mascot: mascotUrl,
}
