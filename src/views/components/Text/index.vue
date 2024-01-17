<script setup>
import Md from '@/components/Md'
import { ElMessageBox } from "element-plus"
const text = '\r\n```html\r\n<VText value="无标题文本内容"></VText>\r\n```\r\n'
const title = '\r\n```html\r\n<VText title="标题" value="文本内容"></VText>\r\n```\r\n'
const copy = '\r\n```html\r\n<VText title="复制" value="可复制文本内容" copy></VText>\r\n```\r\n'
const button = '\r\n```html\r\n<VText title="标题" value="文本内容" type="button"></VText>\r\n```\r\n'
const link = '\r\n```html\r\n<VText title="标题" value="文本内容" type="link"></VText>\r\n```\r\n'
const overflow = '\r\n```html\r\n<VText title="标题" value="溢出文本内容溢出文本内容"></VText>\r\n```\r\n'
const overflow2 = '\r\n```html\r\n<VText title="标题" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2"></VText>\r\n```\r\n'
const overflowcopy = '\r\n```html\r\n<VText title="标题" value="复制+2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2" copy></VText>\r\n```\r\n'
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
      <h1>
        Text 组件
        <router-link to="/api/text" style="margin-left: 20px;">
          <el-link type="primary" style="font-size: 24px;">API</el-link>
        </router-link>
      </h1>
      <h2>无标题</h2>
      <VText value="文本内容"></VText>
      <Md v-model="text" view />

      <h2>有标题</h2>
      <VText title="标题" value="文本内容"></VText>
      <Md v-model="title" view />

      <h2>复制</h2>
      <VText title="标题" value="可复制文本内容" copy></VText>
      <Md v-model="copy" view />

      <h2>溢出</h2>
      <div style="width: 200px;">
        <VText title="标题" value="溢出文本内容溢出文本内容溢出文本内容溢出文本内容溢出文本内容溢出文本内容"></VText>
      </div>
      <Md v-model="overflow" view />

      <h2>2行溢出</h2>
      <div style="width: 200px;">
        <VText title="标题" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2" @click="log"></VText>
      </div>
      <Md v-model="overflow2" view />

      <h2>2行溢出+复制</h2>
      <div style="width: 240px;">
        <VText title="标题" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2" copy @click="log"></VText>
      </div>
      <Md v-model="overflowcopy" view />

      <h2>按钮</h2>
      <VText title="标题" value="文本内容" type="button" @click="log"></VText>
      <p>
        <VText title="禁用" value="文本内容" type="button" disabled @click="log"></VText>
      </p>
      <Md v-model="button" view />

      <h2>链接</h2>
      <VText title="标题" value="文本内容" type="link" @click="log"></VText>
      <p>
        <VText title="禁用" value="文本内容" type="link" disabled @click="log"></VText>
      </p>
      <p style="width: 240px;">
        <VText title="2行溢出可复制" value="2行溢出文本内容2行溢出文本内容2行溢出文本内容2行溢出文本内容" line="2" type="link" copy @click="log">
        </VText>
      </p>
      <Md v-model="link" view />
    </div>
  </VPage>
</template>
