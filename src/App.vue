<template>
  <n-config-provider :theme="systemTheme" :locale="nLocale" :date-locale="dateLocale">
    <n-message-provider placement="bottom-right">
      <message-container />
      <n-modal-provider>
        <n-layout has-sider position="absolute" content-class="h-full" :native-scrollbar="false">
          <categories-menu />
          <n-layout-content :native-scrollbar="false" content-class="h-full">
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { darkTheme, ruRU, dateRuRU, enUS, dateEnUS } from 'naive-ui'
import CategoriesMenu from './modules/categories/CategoriesMenu.vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from './stores/app-store'
import MessageContainer from './shared/components/MessageContainer.vue'

const { locale } = useI18n()

const appStore = useAppStore()

const { settings } = storeToRefs(appStore)

const systemTheme = computed(() => (settings.value.theme === 'dark' ? darkTheme : null))
const nLocale = computed(() => (locale.value === 'ru' ? ruRU : enUS))
const dateLocale = computed(() => (locale.value === 'ru' ? dateRuRU : dateEnUS))

onBeforeMount(async () => {
  await appStore.initSettings()
  if (appStore.settings.lang) locale.value = appStore.settings.lang
  appStore.refreshHotkeyPads()
})
</script>
