<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
const content = ref(doc)
const value = ref('')
</script>

<template>
  <VPage edit>
    <div class="page">
      <h1>BatchInput 批量输入框组件</h1>
      <VBatchInput v-model="value" style="width: 320px" />
      <Md v-model="content" view />
    </div>
  </VPage>
</template>
