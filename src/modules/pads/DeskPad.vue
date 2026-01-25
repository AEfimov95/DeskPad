<template>
  <n-dropdown
    :show="showDropdown"
    :options="options"
    @select="handleSelect"
    @clickoutside="showDropdown = false"
  >
    <n-popover
      trigger="hover"
      width="trigger"
      :delay="500"
      :disabled="!data.description"
    >
      <template #trigger>
        <n-card
          hoverable
          class="w-full aspect-square border-dashed! cursor-pointer hover:opacity-80 relative"
          :style="{ backgroundColor: data.color }"
          content-class="flex flex-col items-center justify-center"
          @click="onPad(data)"
          @contextmenu.prevent="handleClick"
        >
          <span
            v-if="settings.show_type"
            class="absolute top-0 right-1 ma-0 text-white text-shadow-[0_1px_2px_rgb(0_0_0_/_0.8)] truncate opacity-50 text-xs"
          >
            {{ data.type }}
          </span>
          <n-image
            v-if="data.icon"
            :src="data.icon"
            alt=""
            width="32"
            height="32"
            preview-disabled
          />
          <n-icon v-else :component="icon" size="32" />
          <p class="ma-0 text-white text-shadow-[0_1px_2px_rgb(0_0_0_/_0.8)] truncate max-w-full">
            {{ data.name }}
          </p>
        </n-card>
      </template>
      <span> {{ data.description }} </span>
    </n-popover>
  </n-dropdown>
</template>
<script setup lang="ts">
import { useRender } from '@/shared/composables/useRender'
import { Pad, PadType } from '@/shared/interfaces/models'
import { useAppStore } from '@/stores/app-store'

import {
  PencilOutline,
  TrashOutline,
  CopyOutline,
  AppsOutline,
  LinkOutline,
} from '@vicons/ionicons5'
import { DropdownOption } from 'naive-ui'
import { storeToRefs } from 'pinia'

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePad } from './composables/usePad'

const props = defineProps<{ data: Pad }>()
const emits = defineEmits<{
  edit: []
  delete: []
}>()

const appStore = useAppStore()

const { renderIcon } = useRender()
const { t } = useI18n()
const { onPad } = usePad()

const { settings } = storeToRefs(appStore)

const showDropdown = ref(false)

const icon = computed(() => {
  switch (props.data.type) {
    case PadType.App:
      return AppsOutline

    case PadType.URL:
      return LinkOutline

    case PadType.Clipboard:
      return CopyOutline

    default:
      return ''
  }
})

const options: DropdownOption[] = [
  {
    label: t('pads.context.edit'),
    key: 'edit',
    icon: renderIcon(PencilOutline),
  },
  {
    label: t('pads.context.delete'),
    key: 'delete',
    props: {
      class: '*:text-red!',
    },
    icon: renderIcon(TrashOutline),
  },
]

function handleSelect(key: keyof typeof emits) {
  emits(key)
}

function handleClick() {
  showDropdown.value = !showDropdown.value
}
</script>
