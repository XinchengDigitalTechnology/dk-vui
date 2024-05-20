<script setup>
import DKVui from '~/packages'
import Md from '@/components/Md'
const Virtualized = '\r\n```html\r\n<VSelect v-model="form.field" placeholder="请选择" :options="options"/>\r\n```\r\n'
const select = '\r\n```html\r\n<VSelect v-model="form.field1" placeholder="请选择" select :options="options"/>\r\n```\r\n'
const paste = '\r\n```html\r\n<VSelect v-model="form.field1" placeholder="店铺" multiple collapse-tags paste :options="options"/>\r\n```\r\n'
const type = '\r\n```html\r\n<VSelect v-model="form.field1" placeholder="店铺"  type="role"/>\r\n```\r\n'
const form = ref({})
const options = [
  { label: '选项1', value: 1 },
  { label: '选项2', value: 2 },
  { label: '长长长长长长长长长长长长选项', value: 3 },
]
</script>

<template>
  <VPage edit>
    <div class="page">
      <h1>
        Select 组件
        <router-link to="/api/select" style="margin-left: 20px;">
          <el-link type="primary" style="font-size: 24px;">API</el-link>
        </router-link>
      </h1>
      <p>基于 element-plus 的 el-select-v2 和 el-select 组件二次封装</p>
      <p>默认开启 filterable（可筛选） clearable（可清空）</p>
      <h2>Virtualized 模式</h2>
      <p>默认使用 Virtualized Select 虚拟化选择器</p>
      <VSelect v-model="form.field" placeholder="请选择" :options="options" class="w-200" />
      <Md v-model="Virtualized" view />

      <h2>select 模式</h2>
      <p>选项比较少或者有长选项时，可以用 select 模式渲染</p>
      <p>Virtualized渲染长选项时会溢出隐藏选项，select 模式能完整显示选项</p>
      <VSelect v-model="form.field1" placeholder="请选择" select :options="options" class="w-200" />
      <Md v-model="select" view />

      <h2>paste 粘贴</h2>
      <p>multiple 多选模式下，可以使用 paste 粘贴功能快速追加选项</p>
      <VSelect v-model="form.field2" placeholder="店铺" multiple collapse-tags paste :options="options" class="w-400" />
      <Md v-model="paste" view />

      <h2>confusedPaste 模糊粘贴</h2>
      <p>multiple 多选模式下，可以使用 confusedPaste 模糊粘贴功能快速追加选项</p>
      <VSelect v-model="form.field2" placeholder="店铺" multiple collapse-tags confusedPaste :options="options" class="w-400" />
      <Md v-model="paste" view />

      <h2>配置选项</h2>
      <p>
        使用 types 定义配置，结合 type 参数来使用
        <router-link to="/api/select" style="margin-left: 10px;">
          <el-link type="primary">查看API</el-link>
        </router-link>
      </p>
      <VSelect v-model="form.fiel3" placeholder="店铺" type="role" class="w-400" />
      <Md v-model="type" view />
      <p>如果options是动态变化的，比如在标签列表增加标签之后，所有标签options是需要动态更新的，这时候可以调用全局方法 updateSelectOptions 来更新</p>
      <el-button @click="() => DKVui.updateSelectOptions('role')">更新options</el-button>
    </div>
  </VPage>
</template>

<style>
.w-200 {
  width: 200px;
}

.w-400 {
  width: 400px;
}
</style>