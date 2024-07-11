<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
const img = 'data:image/png;base64,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'

const text = '\r\n```html\r\n<VUpload v-model="list" title="图片" />\r\n```\r\n'
const text1 = '\r\n```html\r\n<VUpload v-model="list" drag />\r\n```\r\n'
const text2 = '\r\n```html\r\n<VUpload v-model="list" drag card />\r\n```\r\n'

const content = ref(doc)
const list = ref([img])
const upload = async () => {
  return { data: [{ file_preview: img }] }
}
</script>
<template>
  <VPage edit>
    <div class="page">
      <h1>
        Upload 上传组件
        <router-link to="/api/upload" style="margin-left: 20px;">
          <el-link type="primary" style="font-size: 24px;">API</el-link>
        </router-link>
      </h1>

      <VUpload v-model="list" title="基础上传" :upload="upload" />
      <Md v-model="text" view />

      <h2>点击粘贴拖拽上传</h2>
      <VUpload v-model="list" drag :upload="upload" />
      <Md v-model="text1" view />

      <h2>卡片模式</h2>
      <VUpload v-model="list" drag card />
      <Md v-model="text2" view />
    </div>
  </VPage>
</template>
