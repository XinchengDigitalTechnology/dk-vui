<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
import { ElMessageBox } from "element-plus"
const content = ref(doc)
const text = '\r\n```js\r\n<VText value="无标题文本内容"></VText>\r\n```\r\n'
const title = '\r\n```js\r\n<VText title="标题" value="文本内容"></VText>\r\n```\r\n'
const copy = '\r\n```js\r\n<VText title="复制" value="可复制文本内容" copy></VText>\r\n```\r\n'
const button = '\r\n```js\r\n<VText title="标题" value="文本内容" type="button"></VText>\r\n```\r\n'
const link = '\r\n```js\r\n<VText title="标题" value="文本内容" type="link"></VText>\r\n```\r\n'
const overflow = '\r\n```js\r\n<VText title="标题" value="溢出文本内容溢出文本内容"></VText>\r\n```\r\n'
const overflow2 = '\r\n```js\r\n<VText title="标题" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2"></VText>\r\n```\r\n'
const overflowcopy = '\r\n```js\r\n<VText title="标题" value="复制+2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2" copy></VText>\r\n```\r\n'
const log = () => {
  ElMessageBox.confirm('提示', {
    confirmButtonText: '确定',
    showCancelButton: false,
    title: '提示',
    message: '仅做了样式处理，功能需要监听点击事件去处理'
  })
}
</script>

<template>
  <VPage edit>
    <div class="page">
      <Md v-model="content" view />

      <h4>无标题</h4>
      <VText value="文本内容"></VText>
      <Md v-model="text" view />

      <h4>有标题</h4>
      <VText title="标题" value="文本内容"></VText>
      <Md v-model="title" view />

      <h4>复制</h4>
      <VText title="标题" value="可复制文本内容" copy></VText>
      <Md v-model="copy" view />

      <h4>溢出</h4>
      <div style="width: 200px;">
        <VText title="标题" value="溢出文本内容溢出文本内容"></VText>
      </div>
      <Md v-model="overflow" view />

      <h4>2行溢出</h4>
      <div style="width: 200px;">
        <VText title="标题" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2"></VText>
      </div>
      <Md v-model="overflow2" view />

      <h4>2行溢出+复制</h4>
      <div style="width: 240px;">
        <VText title="标题" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2" copy></VText>
      </div>
      <Md v-model="overflowcopy" view />

      <h4>按钮</h4>
      <VText title="标题" value="文本内容" type="button" @click="log"></VText>
      <Md v-model="button" view />

      <h4>链接</h4>
      <VText title="标题" value="文本内容" type="link" @click="log"></VText>
      <p style="width: 240px;">
        <VText title="2行溢出可复制" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2" type="link" copy @click="log"></VText>
      </p>
      <Md v-model="link" view />
    </div>
  </VPage>
</template>
