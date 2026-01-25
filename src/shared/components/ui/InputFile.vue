<template>
  <label for="file">
    <input
      id="file"
      class="hidden"
      type="file"
      name="file"
      multiple
      accept="image/*"
      @change="onChange"
    />
    <n-button tag="div" type="primary" ghost>
      {{ t('action.edit') }}
    </n-button>
  </label>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  update: [value: File]
  error: [value: boolean]
}>()

const { t } = useI18n()

const onChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const maxSize = 2000 * 1024

  if (file.size < maxSize) {
    emit('error', false)
    emit('update', file)
  } else {
    emit('error', true)
  }

  input.value = ''
}
</script>
