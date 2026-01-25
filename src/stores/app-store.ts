import { i18n } from '@/i18n'
import { usePad } from '@/modules/pads/composables/usePad'
import { api } from '@/api'
import { Category, Pad, Settings, UpdateSettingsPayload } from '@/shared/interfaces/models'
import { notify } from '@/shared/services/notify'
import { register, isRegistered, unregister } from '@tauri-apps/plugin-global-shortcut'
import { defineStore } from 'pinia'
import { load } from '@tauri-apps/plugin-store'
import { DEFAULT } from '@/shared/constants/settings'
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'

interface IUserState {
  settings: Settings
  categories: Category[]
  selectedCategory: Category | null
  currentPads: Pad[]
  hotkeyPads: Pad[]
}

const { onPad } = usePad()

const settingsStore = load('settings.json', {
  defaults: {
    settings: DEFAULT,
  },
  autoSave: true,
})

export const useAppStore = defineStore('app-store', {
  state: (): IUserState => {
    return {
      settings: {} as Settings,
      categories: [],
      selectedCategory: null,
      currentPads: [],
      hotkeyPads: [],
    }
  },
  actions: {
    async initSettings() {
      const store = await settingsStore
      this.settings = (await store.get('settings')) ?? DEFAULT

      const actual = await isEnabled()

      if (this.settings.autostart !== actual) {
        this.settings.autostart = actual
        await store.set('settings', this.settings)
      }
    },

    async setSettings(patch: UpdateSettingsPayload) {
      const store = await settingsStore

      const next = { ...this.settings, ...patch }

      if (typeof patch.autostart === 'boolean') {
        if (patch.autostart) await enable()
        else await disable()
      }

      this.settings = next
      await store.set('settings', next)
    },

    async refreshCategories() {
      this.categories = await api.categories.list()
    },

    async refreshPads(categoryId: string) {
      this.currentPads = await api.pads.listByCategory(categoryId)
    },

    async refreshHotkeyPads() {
      const nextPads = await api.pads.listWithHotkey()

      const prevHotkeys = new Set(this.hotkeyPads.map((pad) => pad.hotkey))
      const nextHotkeys = new Set(nextPads.map((pad) => pad.hotkey))

      for (const pad of this.hotkeyPads) {
        if (!nextHotkeys.has(pad.hotkey)) {
          try {
            await unregister(pad.hotkey!)
          } catch (e) {
            console.error(e)
          }
        }
      }

      for (const pad of nextPads) {
        if (!prevHotkeys.has(pad.hotkey!)) {
          try {
            // when the app is reloaded
            if (await isRegistered(pad.hotkey!)) {
              await unregister(pad.hotkey!)
            }

            await register(pad.hotkey!, (event) => {
              if (event.state !== 'Pressed') return
              onPad(pad)
            })
          } catch {
            notify.error(i18n.global.t('message.error.hotkey', { title: pad.name }))
          }
        }
      }

      this.hotkeyPads = nextPads
    },
  },
})
