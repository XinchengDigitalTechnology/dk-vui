<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
const img = "https://image.baidu.com/search/detail?adpicid=0&b_applid=11202622938512024804&bdtype=0&commodity=&copyright=&cs=730900948%2C1953288996&di=7523999300557209601&fr=click-pic&fromurl=http%253A%252F%252Fwww.cnblogs.com%252FFreya0607%252Fp%252F18517912&gsm=1e&hd=&height=0&hot=&ic=&ie=utf-8&imgformat=&imgratio=&imgspn=0&is=0%2C0&isImgSet=&latest=&lid=&lm=&objurl=https%253A%252F%252Fimg2024.cnblogs.com%252Fblog%252F2348451%252F202410%252F2348451-20241031152845456-774640159.png&os=658527335%2C1998742330&pd=image_content&pi=0&pn=0&rn=1&simid=730900948%2C1953288996&tn=baiduimagedetail&width=0&word=const%2Ba%2B%3D%2Bdocument.createElement(%27a%27)%2B%2B%2B%2B%2B%2B%2B%2Ba.href%2B%3D%2Burl%2B%2B%2B%2B%2B%2B%2B%2Ba.download%2B%3D%2Bfilename%2B%2B%2B%2B%2B%2B%2B%2Ba.click()%E8%BF%99%E4%B8%AA%E4%BB%A3%E7%A0%81%E4%B8%8B%E8%BD%BDpng%E5%9B%BE%E7%89%87%E4%B8%BA%E4%BB%80%E4%B9%88%E4%B8%8D%E6%98%AF%E4%B8%8B%E8%BD%BD%EF%BC%8C%E8%80%8C%E6%98%AF%E6%8A%8A%E5%BD%93%E5%89%8D%E9%A1%B5%E9%9D%A2%E7%9A%84url%E6%8D%A2%E6%88%90%E4%BA%86%E5%9B%BE%E7%89%87%E5%9C%B0%E5%9D%80&z="

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
