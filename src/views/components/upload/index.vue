<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
const img = "https://xc-pms.oss-cn-shenzhen.aliyuncs.com/20240312/06ccd35be353cb9313878ede7321a9e3121cd644.png"

const text = '\r\n```html\r\n<VUpload v-model="list" title="基础上传" />\r\n```\r\n'
const text1 = '\r\n```html\r\n<VUpload v-model="list" drag />\r\n```\r\n'
const text2 = '\r\n```html\r\n<VUpload v-model="list" drag card />\r\n```\r\n'
const text3 = '\r\n```html\r\n<VUpload v-model="list1" title="编辑上传" edit />\r\n```\r\n'

const content = ref(doc)
const list = ref([img])
const list1 = ref([{file_url: img, file_name: '图片'}])
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
      <VUpload v-model="list" drag card :upload="upload" />
      <Md v-model="text2" view />

      <h2>编辑模式</h2>
      <p>
        绑定值为 list1:
        <div v-for="(d, i) in list1" :key="i">[{ file_url: url, file_name: {{ d.file_name }} }]</div>
      </p>
      <VUpload v-model="list1" title="编辑上传" edit :upload="upload" />
      <Md v-model="text3" view />
    </div>
  </VPage>
</template>
