<template/>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { notify } from '../services/notify';


notify.init(useMessage())
</script>

