/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend de Chaski Pe. Por defecto http://localhost:8000 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
