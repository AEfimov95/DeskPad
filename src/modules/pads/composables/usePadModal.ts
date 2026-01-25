import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import { useAppStore } from '@/stores/app-store'
import { NButton, useModal } from 'naive-ui'
import { Pad, PadPayload } from '@/shared/interfaces/models'
import { MODAL } from '@/shared/constants/ui'
import CreatePadForm from '../ui/CreatePadForm.vue'
import { notify } from '@/shared/services/notify'

export function usePadsModal() {
  const modal = useModal()
  const { t } = useI18n()

  const appStore = useAppStore()

  const deletePad = async (padId: string, categoryId: string) => {
    if (!padId) return
    await api.pads.remove(padId)
    await appStore.refreshPads(categoryId)
  }

  async function showDeletePadModal(pad: Pad, categoryId: string) {
    const m = modal.create({
      title: t('pads.delete.title'),
      preset: 'card',
      transformOrigin: 'center',
      style: {
        width: MODAL.width.small,
      },
      content: t('pads.delete.description', { title: pad.name }),
      footer: () => [
        h(
          NButton,
          {
            class: 'flex ml-auto',
            color: 'red',
            textColor: 'white',
            onClick: async () => {
              await deletePad(pad.id, categoryId)
              await appStore.refreshHotkeyPads()
              m.destroy()
            },
          },
          () => t('action.delete')
        ),
      ],
    })
  }

  async function showCreatePadModal(categoryId: string) {
    let state: PadPayload
    const m = modal.create({
      title: t('pads.create'),
      preset: 'card',
      transformOrigin: 'center',
      style: {
        maxWidth: MODAL.width.medium,
        width: MODAL.width.adaptive.medium,
      },
      content: () =>
        h(CreatePadForm, {
          categoryId: categoryId,
          onUpdate: (value) => {
            state = value
          },
        }),
      footer: () =>
        h(
          NButton,
          {
            class: 'flex ml-auto',
            type: 'primary',
            onClick: async () => {
              if (!state?.name || (!state?.clipboard_json && !state?.target)) {
                return notify.error(t('message.error.required'))
              }
              await api.pads.create(state)
              await appStore.refreshPads(categoryId)
              await appStore.refreshHotkeyPads()
              m.destroy()
            },
          },
          () => t('action.save')
        ),
    })
  }

  async function showUpdatePadModal(categoryId: string, currentState: Pad) {
    let state: PadPayload
    const m = modal.create({
      title: t('pads.edit'),
      preset: 'card',
      transformOrigin: 'center',
      style: {
        maxWidth: MODAL.width.medium,
        width: MODAL.width.adaptive.medium,
      },
      content: () =>
        h(CreatePadForm, {
          categoryId: categoryId,
          modelValue: currentState,
          onUpdate: (value) => {
            state = value
          },
        }),
      footer: () =>
        h(
          NButton,
          {
            class: 'flex ml-auto',
            type: 'primary',
            onClick: async () => {
              await api.pads.update(currentState.id, state)
              await appStore.refreshPads(categoryId)
              await appStore.refreshHotkeyPads()
              m.destroy()
            },
          },
          () => t('action.save')
        ),
    })
  }

  return {
    showCreatePadModal,
    showUpdatePadModal,
    showDeletePadModal,
  }
}
