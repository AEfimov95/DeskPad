<template>
  <n-form :model="model">
    <n-form-item :label="t('category.form.name')" path="name" required>
      <n-input v-model:value="model.name" maxlength="30" show-count type="text" placeholder="" />
    </n-form-item>
    <n-form-item :label="t('category.form.icon')" path="icon" content-class="gap-2">
      <n-avatar :src="model.icon">
        <n-icon v-if="!model.icon" :component="FolderOutline" />
      </n-avatar>
      <input-file @update="saveIcon" />
      <template #feedback> {{ t('placeholder.maxSize') }} </template>
    </n-form-item>
  </n-form>
</template>
<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CategoryPayload } from '@/shared/interfaces/models'
import { getBase64File } from '@/shared/utils/base64'
import { FolderOutline } from '@vicons/ionicons5'
import InputFile from '@/shared/components/ui/InputFile.vue'

const { t } = useI18n()

const props = defineProps<{
  modelValue?: CategoryPayload
}>()

const emits = defineEmits<{
  update: [value: CategoryPayload]
}>()

const model = reactive<CategoryPayload>({
  name: props.modelValue?.name ?? '',
  icon: props.modelValue?.icon ?? null,
})

const saveIcon = async (icon: File | null) => {
  model.icon = await getBase64File(icon)
}

watch(model, () => emits('update', model), { immediate: true })
</script>
