/** Rutas centralizadas de la aplicacion. */

export const ROUTES = {
  // Flujo de entrada (solo UI, sin autenticacion real en FASE 1)
  splash: '/',
  onboarding: '/bienvenida',
  login: '/iniciar-sesion',
  register: '/crear-cuenta',

  // App
  home: '/inicio',
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

  // Herramienta interna (FASE 4): captura de dataset de landmarks.
  datasetCollector: '/dev/dataset',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
