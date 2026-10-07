interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export type IconName =
  | 'home'
  | 'chat'
  | 'clock'
  | 'user'
  | 'phrases'
  | 'camera'
  | 'keyboard'
  | 'hands'
  | 'mic'
  | 'play'
  | 'pause'
  | 'volume'
  | 'send'
  | 'back'
  | 'chevron'
  | 'check'
  | 'edit'
  | 'trash'
  | 'refresh'
  | 'swap'
  | 'bell'
  | 'settings'
  | 'shield'
  | 'help'
  | 'logout'
  | 'eye'
  | 'sun'
  | 'search'
  | 'filter'
  | 'mail'
  | 'lock'
  | 'text-size'
  | 'grid'
  | 'cap'
  | 'siren'
  | 'heart'
  | 'pulse'
  | 'bag'
  | 'bus'
  | 'smile'
  | 'flame'
  | 'users'
  | 'close'
  | 'backspace'
  | 'vibrate'
  | 'sparkle'

const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20c1.2-3.4 4-5 7-5s5.8 1.6 7 5',
  phrases: 'M4 5h16M4 12h10M4 19h7',
  camera:
    'M4 8h3l2-3h6l2 3h3v12H4V8Zm8 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
  keyboard:
    'M3 6h18v12H3V6Zm3 3h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M9 13h6',
  hands: 'M7 11V6a1.5 1.5 0 0 1 3 0v4m0 0V4.5a1.5 1.5 0 0 1 3 0V10m0 0V6a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.2-3L4 13.5a1.6 1.6 0 0 1 2.7-1.7L8 13',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm-6-3a6 6 0 0 0 12 0M12 18v3',
  play: 'M8 5v14l11-7z',
  pause: 'M9 5v14M15 5v14',
  volume: 'M11 5 6 9H3v6h3l5 4V5Zm4 3a4 4 0 0 1 0 8m2.5-11a8 8 0 0 1 0 14',
  send: 'm5 12 14-7-4 14-3-5-7-2Z',
  back: 'M15 19 8 12l7-7',
  chevron: 'm9 6 6 6-6 6',
  check: 'm5 13 4 4L19 7',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm10.5-13.5 4 4',
  trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6',
  refresh: 'M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7L4 16m0 4v-4h4',
  swap: 'M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2Zm4 4h4',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a8 8 0 0 0-2.3-1.3L14.7 2h-4l-.4 2.5a8 8 0 0 0-2.3 1.3l-2.3-1-2 3.4 2 1.5A8 8 0 0 0 4 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 2.3 1.3l.4 2.5h4l.4-2.5a8 8 0 0 0 2.3-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z',
  shield: 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z',
  help: 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1.2-1.5 2.2M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  logout: 'M15 12H4m0 0 4-4m-4 4 4 4M14 4h5v16h-5',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4 12H2M22 12h-2M5 5 4 4M20 20l-1-1M5 19l-1 1M20 4l-1 1',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm10 3-5-5',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  mail: 'M3 6h18v12H3V6Zm0 1 9 6 9-6',
  lock: 'M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5V11Z',
  'text-size': 'M4 7V5h11v2M9.5 5v14M7 19h5M15 12v-1h6v1M18 11v8M16.5 19h3',
  grid: 'M4 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm11 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 11h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1ZM4 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z',
  cap: 'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c3 2 9 2 12 0v-5M22 10v6',
  siren: 'M7 18v-6a5 5 0 0 1 10 0v6M5 21h14v-3H5v3Zm7-9v6M2 12h1M21 12h1M4.9 4.9l.7.7M19.1 4.9l-.7.7M12 2v1',
  heart: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z',
  pulse: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7ZM3.2 12h6.3l.5-1 2 4.5 2-7 1.5 3.5h5.3',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0',
  bus: 'M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2s-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3M9 18h5M7 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm9 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  smile: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
  flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4.1 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  close: 'M18 6 6 18M6 6l12 12',
  backspace: 'M10 5a2 2 0 0 0-1.3.5l-6.4 5.8a1 1 0 0 0 0 1.4l6.4 5.8A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2ZM12 9l6 6M18 9l-6 6',
  vibrate: 'M2 8l2 2-2 2 2 2-2 2M22 8l-2 2 2 2-2 2 2 2M9 5h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2',
}

/** Icono de linea. Decorativo salvo que el contenedor le de un aria-label. */
export function Icon({ name, size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
