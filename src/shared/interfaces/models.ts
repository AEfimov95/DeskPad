export type Theme = 'light' | 'dark'
export type Lang = 'ru' | 'en'
export enum PadType {
  Clipboard = 'clipboard',
  URL = 'url',
  App = 'app',
}

export interface Settings {

  theme: Theme
  lang: Lang
  show_type: number
  autostart: boolean
}

export interface Category {
  id: string
  name: string
  icon: string | null
  createdAt: number
  updatedAt: number
}

export interface Pad {
  id: string
  categoryId: string
  name: string
  description: string
  color: string
  icon: string | null
  clipboard_json: string | null
  clipboard_text: string | null
  type: PadType
  target: string | null
  hotkey: string | null
  createdAt: number
  updatedAt: number
}

export type UpdateSettingsPayload = Partial<Settings>
export type CategoryPayload = Pick<Category, 'name' | 'icon'>
export type PadPayload = Pick<
  Pad,
  'name' | 'description' | 'color' | 'categoryId' | 'clipboard_text' | 'type' | 'target' | 'icon' | 'hotkey'
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clipboard_json: any
}
