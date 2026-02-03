<template>
  <n-space vertical>
    <n-form :model="model">
      <n-form-item :label="t('pads.form.name')" path="name" required>
        <n-input v-model:value="model.name" type="text" maxlength="30" show-count placeholder="" />
      </n-form-item>
      <n-form-item :label="t('pads.form.description')" path="description">
        <n-input
          v-model:value="model.description"
          type="textarea"
          maxlength="200"
          show-count
          placeholder=""
        />
      </n-form-item>

      <n-form-item :label="t('pads.form.color')" path="color">
        <n-color-picker
          v-model:value="model.color"
          :swatches="swatches"
          :modes="['hex']"
          :show-alpha="false"
        />
      </n-form-item>
      <n-form-item :label="t('pads.form.hotkey')" path="hotkey">
        <template #label>
          {{ t('pads.form.hotkey') }}

          <n-checkbox v-model:checked="withHotkey" class="ml-2" @update:checked="onCheckHotkey" />
        </template>
        <n-input
          :disabled="!withHotkey"
          :value="hotkey"
          type="text"
          placeholder="Control+Shift+Digit1"
          clearable
          @clear="hotkey = ''"
          @keyup="onKeyUp"
        />
        <n-button :disabled="!withHotkey" type="primary" ghost @click="saveHotkey">
          {{ t('action.save') }}
        </n-button>
      </n-form-item>
      <n-form-item :label="t('pads.form.icon')" path="icon" content-class="gap-2">
        <n-avatar :src="model.icon">
          <n-icon v-if="!model.icon" :component="defaultIcon" />
        </n-avatar>
        <InputFile @update="saveIcon" />
        <n-checkbox v-model:checked="onlyCustomIcon"> {{ t('pads.form.onlyCustom') }} </n-checkbox>
        <template #feedback> {{ t('placeholder.maxSize') }} </template>
      </n-form-item>
      <n-form-item :label="t('pads.form.icon_size.title')" path="icon" class="mt-6">
        <n-select
          v-model:value="model.icon_size"
          :disabled="!model.icon"
          :options="iconSizeOpts"
          :show-checkmark="false"
          size="small"
          style="width: 120px"
        />
      </n-form-item>
      <n-radio-group
        v-model:value="model.type"
        name="type"
        class="mb-2"
        @update:value="model.target = null"
      >
        <n-radio-button
          v-for="type in padTypes"
          :key="type.value"
          :value="type.value"
          :label="type.label"
        />
      </n-radio-group>
      <n-form-item
        v-if="model.type === PadType.Clipboard"
        :label="t('pads.form.clipboard')"
        path="clipboard_json"
        required
      >
        <div class="w-full">
          <QuillEditor
            v-model:content="model.clipboard_json"
            theme="snow"
            @ready="(v) => (quill = v)"
            @text-change="(v) => (model.clipboard_text = quill?.getText() || v)"
          />
        </div>
      </n-form-item>

      <n-form-item
        v-if="model.type === PadType.URL"
        :label="t('pads.form.url')"
        path="target"
        required
      >
        <n-input-group>
          <n-input v-model:value="model.target" placeholder="https://" />
          <n-button type="primary" ghost @click="saveTargetIcon">
            {{ t('action.load_icon') }}
          </n-button>
        </n-input-group>
      </n-form-item>
      <n-form-item
        v-if="model.type === PadType.App"
        :label="t('pads.form.path')"
        path="target"
        required
      >
        <n-input-group>
          <n-input disabled :value="model.target" readonly placeholder="" />
          <n-button type="primary" ghost @click="openFile"> {{ t('action.select') }} </n-button>
        </n-input-group></n-form-item
      >
    </n-form>
  </n-space>
</template>
<script setup lang="ts">
import { Pad, PadPayload, PadType } from '@/shared/interfaces/models'
import { useI18n } from 'vue-i18n'
import { Delta, Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import '@vueup/vue-quill/dist/vue-quill.core.css'
import { computed, reactive, ref, watch } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { loadAppIcon } from '../utils/app'
import { AppsOutline, CopyOutline, LinkOutline } from '@vicons/ionicons5'
import { getImage } from '../utils/http'
import InputFile from '@/shared/components/ui/InputFile.vue'
import { getBase64File } from '@/shared/utils/base64'
import { isRegistered } from '@tauri-apps/plugin-global-shortcut'
import { notify } from '@/shared/services/notify'

const props = defineProps<{ categoryId: string; modelValue?: Pad }>()
const emits = defineEmits<{ update: [value: PadPayload] }>()
const { t } = useI18n()

const padTypes = computed(() => [
  { label: t('pads.form.clipboard'), value: PadType.Clipboard },
  { label: t('pads.form.url'), value: PadType.URL },
  { label: t('pads.form.path'), value: PadType.App },
])

const iconSizeOpts = computed(() => [
  { label: t('pads.form.icon_size.option.small'), value: 'small' },
  { label: t('pads.form.icon_size.option.middle'), value: 'middle' },
  { label: t('pads.form.icon_size.option.big'), value: 'big' },
  { label: t('pads.form.icon_size.option.full'), value: 'full' },
])

const withHotkey = ref(!!props.modelValue?.hotkey)
const onlyCustomIcon = ref(false)
const hotkey = ref(props.modelValue?.hotkey ?? '')

const defaultIcon = computed(() => {
  switch (model.type) {
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

const onCheckHotkey = (value: boolean) => {
  if (!value) {
    hotkey.value = ''
    model.hotkey = null
  }
}

const normalizeHotkey = (e: KeyboardEvent): string | null => {
  const modifiers: string[] = []

  if (e.ctrlKey) modifiers.push('Control')
  if (e.altKey) modifiers.push('Alt')
  if (e.shiftKey) modifiers.push('Shift')
  if (e.metaKey) modifiers.push('Meta')

  const isModifierOnly =
    e.code === 'ControlLeft' ||
    e.code === 'ControlRight' ||
    e.code === 'ShiftLeft' ||
    e.code === 'ShiftRight' ||
    e.code === 'AltLeft' ||
    e.code === 'AltRight' ||
    e.code === 'MetaLeft' ||
    e.code === 'MetaRight'

  if (isModifierOnly) return null

  const mainKey = e.code

  return [...modifiers, mainKey].join('+')
}

const onKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Backspace') return
  const normalized = normalizeHotkey(e)
  if (!normalized) return

  hotkey.value = normalized
}

const saveHotkey = async () => {
  try {
    const is = await isRegistered(hotkey.value)
    if (is) {
      return notify.error(t('message.error.hotkey'))
    }
  } catch {
    return notify.error(t('message.error.hotkey'))
  }
  model.hotkey = hotkey.value
}

const saveIcon = async (icon: File | null) => {
  if (!icon) {
    return notify.error(t('message.error.icon'))
  }
  model.icon = await getBase64File(icon)
}

const saveTargetIcon = async () => {
  if (onlyCustomIcon.value) return
  const file = await getImage(model.target)
  saveIcon(file)
}

const openFile = async () => {
  model.target = await open({
    multiple: false,
    directory: false,
  })
  if (onlyCustomIcon.value || !model.target) return
  model.icon = await loadAppIcon(model.target)
}

const quill = ref<Quill>()

const model = reactive<PadPayload>({
  name: props.modelValue?.name ?? '',
  description: props.modelValue?.description ?? '',
  color: props.modelValue?.color ?? '#34C759',
  clipboard_json: props.modelValue?.clipboard_json
    ? new Delta({ ops: JSON.parse(props.modelValue?.clipboard_json) })
    : new Delta(),
  clipboard_text: props.modelValue?.clipboard_text ?? '',
  icon: props.modelValue?.icon ?? null,
  icon_size: props.modelValue?.icon_size ?? 'small',
  type: props.modelValue?.type ?? PadType.Clipboard,
  target: props.modelValue?.target ?? null,
  categoryId: props.categoryId,
  hotkey: props.modelValue?.hotkey ?? null,
})

const swatches = [
  '#FF3B30', // red
  '#FF9500', // orange
  '#FFD60A', // yellow
  '#34C759', // green
  '#1DB954', // dark green
  '#007AFF', // blue
  '#5AC8FA', // cyan
  '#AF52DE', // purple
  '#5856D6', // violet
  '#3A3A3C', // dark gray
]

watch(model, () => emits('update', model), { immediate: true })
</script>
