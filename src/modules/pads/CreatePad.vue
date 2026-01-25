<template>
  <n-card
    hoverable
    class="w-full aspect-square border-dashed! cursor-pointer"
    content-class="flex items-center justify-center"
  >
    <n-icon :component="AddOutline" />
  </n-card>
</template>
<script setup lang="ts">
import { AddOutline } from '@vicons/ionicons5'
</script>
