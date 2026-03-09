<template>
  <n-card embedded :bordered="false" :title="selectedCategory?.name" class="h-full min-h-fit">
    <template #header-extra>
      <n-button quaternary size="small" @click="exportCategory">
        <template #icon>
          <n-icon :component="SaveOutline" />
        </template>
      </n-button>
      <n-button quaternary size="small" @click="showUpdateCategoryModal(selectedCategory)">
        <template #icon>
          <n-icon :component="PencilOutline" />
        </template>
      </n-button>
      <n-button
        quaternary
        type="error"
        size="small"
        @click="showDeleteCategoryModal(selectedCategory!)"
      >
        <template #icon>
          <n-icon :component="TrashOutline" />
        </template>
      </n-button>
    </template>
    <n-grid
      ref="gridRef"
      :x-gap="12"
      :y-gap="12"
      cols="2 s:3 m:4 l:6 xl:8 2xl:10"
      responsive="screen"
    >
      <n-gi v-for="pad in currentPads" :key="pad.id" :data-id="pad.id" class="pad-item">
        <DeskPad
          :data="pad"
          @delete="showDeletePadModal(pad, selectedCategory!.id)"
          @edit="showUpdatePadModal(selectedCategory!.id, pad)"
        />
      </n-gi>
      <n-gi class="pad-create">
        <CreatePad @click="showCreatePadModal(selectedCategory!.id)" />
      </n-gi>
    </n-grid>
  </n-card>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TrashOutline, PencilOutline, SaveOutline } from '@vicons/ionicons5'
import { NButton, NGrid } from 'naive-ui'
import { create } from '@tauri-apps/plugin-fs'
import { save } from '@tauri-apps/plugin-dialog'
import { useI18n } from 'vue-i18n'
import Sortable from 'sortablejs'
import CreatePad from '@/modules/pads/CreatePad.vue'
import DeskPad from '@/modules/pads/DeskPad.vue'
import { useCategoryModal } from '@/modules/categories/composables/useCategoryModal'
import { useAppStore } from '@/stores/app-store'
import { storeToRefs } from 'pinia'
import { usePadsModal } from '@/modules/pads/composables/usePadModal'
import { api } from '@/api'
import { PadType } from '@/shared/interfaces/models'
import { notify } from '@/shared/services/notify'

const { t } = useI18n()

const router = useRouter()

const appStore = useAppStore()

const { selectedCategory, currentPads } = storeToRefs(appStore)

const { showDeleteCategoryModal, showUpdateCategoryModal } = useCategoryModal()
const { showCreatePadModal, showDeletePadModal, showUpdatePadModal } = usePadsModal()

const gridRef = ref<typeof NGrid | null>(null)
let sortable: Sortable | null = null

async function updatePosition(id: string, from: number, to: number) {
  if (!selectedCategory.value) return
  if (from === to) return
  await api.pads.move(selectedCategory.value.id, id, from, to)
}

async function initSortable() {
  await nextTick()

  const el: HTMLElement | null = gridRef.value?.$el ?? gridRef.value

  if (!el) return
  if (sortable) sortable?.destroy()

  sortable = new Sortable(el, {
    draggable: '.pad-item',
    animation: 150,
    filter: '.pad-create',
    preventOnFilter: true,
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

const exportCategory = async () => {
  const path = await save({
    filters: [{ name: t('fs.category'), extensions: ['json'] }],
  })

  if (!path) return
  const exportPadsData = currentPads.value
    .filter((pad) => pad.type !== PadType.App)
    .map(
      ({
        name,
        description,
        color,
        icon,
        type,
        clipboard_json,
        clipboard_text,
        icon_size,
        target,
      }) => ({
        name,
        description,
        color,
        icon,
        type,
        clipboard_json,
        clipboard_text,
        icon_size,
        target,
      })
    )

  const exportCategoryData = {
    icon: selectedCategory.value?.icon,
    name: selectedCategory.value?.name,
    pads: exportPadsData,
  }
  
  try {
    const file = await create(path)
    await file.write(new TextEncoder().encode(JSON.stringify(exportCategoryData, null, 2)))
    await file.close()
    notify.success(t('message.saved'))
  } catch {
    notify.success(t('message.error.saved'))
  }
}

onBeforeUnmount(() => {
  if (sortable) sortable?.destroy()
})

watch(
  selectedCategory,
  async (v) => {
    if (v) {
      await initSortable()
    }
  },
  { immediate: true }
)

watch(
  () => selectedCategory.value?.id,
  async (id) => {
    if (id) {
      currentPads.value = []
      await appStore.refreshPads(id)
    } else {
      router.push({ name: 'home' })
    }
  },
  { immediate: true }
)
</script>