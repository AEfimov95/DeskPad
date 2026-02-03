<template>
  <n-layout-sider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="256"
    :collapsed="collapsed"
    show-trigger
    :native-scrollbar="false"
    @collapse="collapsed = true"
    @expand="collapsed = false"
  >
    <n-menu
      ref="menuRef"
      :value="activeKey"
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="32"
      :icon-size="32"
      :options="menuOptions"
      :node-props="nodeAttrs"
      @update:value="onSelect"
    >
    </n-menu>
  </n-layout-sider>
</template>
<script setup lang="ts">
import { computed, h, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { FolderOutline, AddOutline, SettingsOutline } from '@vicons/ionicons5'
import { MenuOption, NEllipsis, NMenu } from 'naive-ui'
import { Category } from '@/shared/interfaces/models'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app-store'
import { storeToRefs } from 'pinia'
import { useRender } from '@/shared/composables/useRender'
import { useCategoryModal } from './composables/useCategoryModal'
import { api } from '@/api'
import Sortable from 'sortablejs'

const { t } = useI18n()

const { renderIcon, renderAvatar } = useRender()
const appStore = useAppStore()

const router = useRouter()

const { showCreateCategoryModal } = useCategoryModal()

const { categories, selectedCategory } = storeToRefs(appStore)

const activeKey = ref<string | null>(null)
const collapsed = ref(true)

const menuRef = ref<typeof NMenu | null>(null)
let sortable: Sortable | null = null

const nodeAttrs = (option: MenuOption) => {
  const customItem = option.key !== 'settings' && option.key !== 'add'
  return {
    class: customItem ? 'draggable-item' : '',
    'data-id': option.key,
  }
}

async function updatePosition(id: string, from: number, to: number) {
  if (from === to) return
  await api.categories.move(id, from, to)
}

async function initSortable() {
  await nextTick()

  const el: HTMLElement | null = menuRef.value?.$el ?? menuRef.value
  if (!el) return
  if (sortable) sortable?.destroy()

  sortable = new Sortable(el, {
    draggable: '.draggable-item',
    animation: 150,
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 5,
    onEnd: async (evt) => {
      const { oldIndex, newIndex, item } = evt
      if (oldIndex == null || newIndex == null) return
      if (oldIndex === newIndex) return

      const id = (item as HTMLElement).dataset.id
      if (!id) return
      await updatePosition(id, oldIndex, newIndex)
    },
  })
}

const onSelect = async (key: string) => {
  if (key === 'add') {
    return showCreateCategoryModal()
  } else if (key !== 'settings') {
    selectedCategory.value = await api.categories.get(key)
    router.push({ name: 'pads', params: { id: key } })
  }
  activeKey.value = key
}

function renderMenuItem(item: Category): MenuOption {
  return {
    label: () =>
      h(NEllipsis, null, {
        default: () => item.name,
      }),
    class: 'menu-item',
    key: item.id,
    icon: item.icon ? renderAvatar(item.icon, 32) : renderIcon(FolderOutline),
  }
}

const menuOptions = computed<MenuOption[]>(() => {
  return [
    ...categories.value.map((item) => renderMenuItem(item)),
    {
      label: () => t('category.menu.add'),
      key: 'add',
      icon: renderIcon(AddOutline),
    },
    {
      label: () =>
        h(
          RouterLink,
          {
            to: {
              name: 'settings',
            },
          },
          { default: () => t('category.menu.settings') }
        ),
      key: 'settings',
      icon: renderIcon(SettingsOutline),
    },
  ]
})

onMounted(async () => {
  await appStore.refreshCategories()
  await initSortable()
})

onUnmounted(() => {
  sortable?.destroy()
})
</script>
