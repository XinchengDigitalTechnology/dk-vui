<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
const content = ref(doc)
</script>

<template>
  <VPage edit>
    <div class="page">
      <Md v-model="content" view />
      <VButton>权限按钮</VButton>
    </div>
  </VPage>
</template>
