import { Settings } from '../interfaces/models'

export const DEFAULT: Settings = {
  theme: 'dark',
  lang: 'en',
  show_type: 1,
  show_hotkey: 0,
  autostart: false,
} as const
