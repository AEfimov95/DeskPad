<template>
  <n-card embedded :bordered="false" :title="t('settings.title')" class="h-full">
    <n-space vertical>
      <n-space vertical>
        <h4 class="ma-0">{{ t('settings.lang') }}</h4>
        <n-select
          v-model:value="locale"
          :options="localeOpts"
          :show-checkmark="false"
          size="small"
          style="width: 120px"
        />
      </n-space>
      <n-space vertical>
        <h4 class="ma-0">{{ t('settings.theme') }}</h4>
        <n-switch
          checked-value="light"
          unchecked-value="dark"
          :value="settings.theme"
          :rail-style="railStyle"
          size="large"
          @update:value="(v: Theme) => appStore.setSettings({ theme: v })"
        >
          <template #checked-icon>
            <n-icon :component="SunnyOutline" />
          </template>
          <template #unchecked-icon>
            <n-icon :component="MoonOutline" />
          </template>
        </n-switch>
      </n-space>
      <n-space vertical>
        <h4 class="ma-0">{{ t('settings.show_type') }}</h4>
        <n-switch
          :value="settings.show_type"
          :checked-value="1"
          :unchecked-value="0"
          :rail-style="railStyle"
          size="large"
          @update:value="(v: number) => appStore.setSettings({ show_type: v })"
        />
      </n-space>
      <n-space vertical>
        <h4 class="ma-0">{{ t('settings.autostart') }}</h4>
        <n-switch
          :value="settings.autostart"
          :checked-value="true"
          :unchecked-value="false"
          :rail-style="railStyle"
          size="large"
          @update:value="(v: boolean) => appStore.setSettings({ autostart: v })"
        />
      </n-space>
    </n-space>
  </n-card>
</template>
<script setup lang="ts">
import { type CSSProperties, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5'
import { Lang, Theme } from '@/shared/interfaces/models'
import { useAppStore } from '@/stores/app-store'
import { storeToRefs } from 'pinia'

const { t, locale } = useI18n()

const appStore = useAppStore()

const { settings } = storeToRefs(appStore)

const localeOpts = [
  { label: 'Русский', value: 'ru' },
  { label: 'English', value: 'en' },
]

function railStyle({ _focused, checked }: { _focused: boolean; checked: boolean }) {
  const style: CSSProperties = {}
  if (checked) {
    style.background = '#2080f0'
  }
  return style
}

watch(
  () => locale.value,
  (v) => {
    appStore.setSettings({ lang: v as Lang })
  }
)
</script>
