<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
const content = ref(doc)
</script>

<template>
  <VPage edit>
    <div class="page">
      <Md v-model="content" view />
      <VAuth>区域权限</VAuth>
    </div>
  </VPage>
</template>
