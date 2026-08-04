<script setup>
import DKVui from '~/packages'
import Md from '@/components/Md'

const basic = '\r\n```html\r\n<VCascader v-model="form.area" placeholder="请选择" :options="options" class="w-200" />\r\n```\r\n'
const multiple = '\r\n```html\r\n<VCascader v-model="form.areas" placeholder="请选择" multiple collapse-tags :options="options" class="w-400" />\r\n```\r\n'
const level = '\r\n```html\r\n<VCascader v-model="form.province" placeholder="仅展示两级" :options="options" :level="2" class="w-200" />\r\n```\r\n'
const type = '\r\n```html\r\n<VCascader v-model="form.dept" placeholder="请选择部门" type="department" multiple collapse-tags class="w-400" />\r\n```\r\n'

const form = ref({
  area: '',
  areas: [],
  province: '',
  dept: [],
})

const options = [
  {
    name: '华南',
    id: 'south',
    sub: [
      {
        name: '广东',
        id: 'gd',
        sub: [
          { name: '广州', id: 'gz' },
          { name: '深圳', id: 'sz' },
        ],
      },
      {
        name: '广西',
        id: 'gx',
        sub: [
          { name: '南宁', id: 'nn' },
          { name: '桂林', id: 'gl' },
        ],
      },
    ],
  },
  {
    name: '华东',
    id: 'east',
    sub: [
      {
        name: '浙江',
        id: 'zj',
        sub: [
          { name: '杭州', id: 'hz' },
          { name: '宁波', id: 'nb' },
        ],
      },
    ],
  },
]
</script>

<template>
  <VPage edit>
    <div class="page">
      <h1>
        Cascader 组件
        <router-link to="/api/cascader" style="margin-left: 20px;">
          <el-link type="primary" style="font-size: 24px;">API</el-link>
        </router-link>
      </h1>
      <p>基于 element-plus 的 el-cascader 组件二次封装</p>
      <p>默认开启 filterable（可筛选） clearable（可清空）</p>

      <h2>基础用法</h2>
      <p>通过 options 传入选项数据，默认字段映射为 label=name、value=id、children=sub</p>
      <VCascader v-model="form.area" placeholder="请选择" :options="options" class="w-200" />
      <Md v-model="basic" view />

      <h2>多选</h2>
      <VCascader v-model="form.areas" placeholder="请选择" multiple collapse-tags :options="options" class="w-400" />
      <Md v-model="multiple" view />

      <h2>限制层级</h2>
      <p>通过 level 限制展示的层级深度</p>
      <VCascader v-model="form.province" placeholder="仅展示两级" :options="options" :level="2" class="w-200" />
      <Md v-model="level" view />

      <h2>配置选项</h2>
      <p>
        使用 types 定义配置，结合 type 参数来使用
        <router-link to="/api/cascader" style="margin-left: 10px;">
          <el-link type="primary">查看API</el-link>
        </router-link>
      </p>
      <VCascader v-model="form.dept" placeholder="请选择部门" type="department" multiple collapse-tags class="w-400" />
      <Md v-model="type" view />
      <p>如果 options 是动态变化的，可以调用全局方法 updateCascaderOptions 来更新</p>
      <el-button @click="() => DKVui.updateCascaderOptions('department')">更新options</el-button>
    </div>
  </VPage>
</template>

<style>
.w-200 {
  width: 200px!important;
}

.w-400 {
  width: 400px!important;
}
</style>
