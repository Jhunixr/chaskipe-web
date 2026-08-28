/** Rutas centralizadas de la aplicacion. */

export const ROUTES = {
  home: '/',
  cameraPreparation: '/camara/preparacion',
  signToText: '/senas-a-texto',
  translationResult: '/senas-a-texto/resultado',
  textToSign: '/texto-a-senas',
  conversation: '/conversacion',
  quickPhrases: '/frases',
  history: '/historial',
  profile: '/perfil',
  accessibility: '/accesibilidad',
  help: '/ayuda',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
