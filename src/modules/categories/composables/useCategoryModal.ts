import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useAppStore } from '@/stores/app-store'
import { NButton, useModal } from 'naive-ui'
import { Category, CategoryPayload } from '@/shared/interfaces/models'
import CreateCategoryForm from '../ui/CreateCategoryForm.vue'
import { MODAL } from '@/shared/constants/ui'
import { notify } from '@/shared/services/notify'

export function useCategoryModal() {
  const modal = useModal()
  const { t } = useI18n()

  const appStore = useAppStore()
  const router = useRouter()

  const deleteCategory = async (categoryId: string) => {
    if (!categoryId) return
    await api.categories.remove(categoryId)
    await appStore.refreshCategories()
    appStore.selectedCategory = null
    router.push({ name: 'home' })
  }
  async function showCreateCategoryModal() {
    let state: CategoryPayload

    const m = modal.create({
      title: t('category.create.title'),
      preset: 'card',
      transformOrigin: 'center',
      style: {
        width: MODAL.width.small,
      },
      content: () =>
        h(CreateCategoryForm, {
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
              if (!state?.name) {
                return notify.error(t('message.error.required'))
              }
              await api.categories.create(state)
              await appStore.refreshCategories()
              m.destroy()
            },
          },
          () => t('action.save')
        ),
    })
  }
  async function showUpdateCategoryModal(category: Category | null) {
    if (!category) return

    let state: CategoryPayload

    const m = modal.create({
      title: t('category.edit'),
      preset: 'card',
      transformOrigin: 'center',
      style: {
        width: MODAL.width.small,
      },
      content: () =>
        h(CreateCategoryForm, {
          modelValue: category,
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
              if (!state?.name) {
                return notify.error(t('message.error.required'))
              }
              await api.categories.update(category.id, state)
              await appStore.refreshCategories()

              appStore.selectedCategory = await api.categories.get(category.id)

              m.destroy()
            },
          },
          () => t('action.save')
        ),
    })
  }
  async function showDeleteCategoryModal(category: Category) {
    const m = modal.create({
      title: t('category.delete.title'),
      preset: 'card',
      transformOrigin: 'center',
      style: {
        width: MODAL.width.small,
      },
      content: t('category.delete.description', { title: category?.name }),
      footer: () => [
        h(
          NButton,
          {
            class: 'flex ml-auto',
            color: 'red',
            textColor: 'white',
            onClick: async () => {
              await deleteCategory(category.id)
              m.destroy()
            },
          },
          () => t('action.delete')
        ),
      ],
    })
  }

  return {
    showCreateCategoryModal,
    showUpdateCategoryModal,
    showDeleteCategoryModal,
  }
}
