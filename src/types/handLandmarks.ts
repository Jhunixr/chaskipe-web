/** Un landmark normalizado (0..1 respecto al frame). z es profundidad relativa. */
export interface Landmark {
  x: number
  y: number
  z: number
  visibility?: number
}

/** Resultado de una deteccion de manos en un frame. */
export interface HandFrame {
  /** Una lista de 21 landmarks por cada mano detectada. */
  hands: Landmark[][]
  /** 'Left' | 'Right' por cada mano (etiqueta de MediaPipe, desde la vista de la camara). */
  handedness: string[]
  /**
   * World landmarks de cada mano (metros, 3D, en el mismo orden que `hands`).
   * No dependen de la proporcion del video; los usa el modelo de letras.
   */
  worldHands?: Landmark[][]
  /** Marca de tiempo del frame en ms. */
  timestamp: number
}

/**
 * Conexiones entre landmarks de la mano para dibujar el esqueleto.
 * Indices segun el modelo Hand Landmarker de MediaPipe (21 puntos).
 */
export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], // pulgar
  [0, 5], [5, 6], [6, 7], [7, 8], // indice
  [5, 9], [9, 10], [10, 11], [11, 12], // medio
  [9, 13], [13, 14], [14, 15], [15, 16], // anular
  [13, 17], [17, 18], [18, 19], [19, 20], // menique
  [0, 17], // base de la palma
]
