<script setup>
import XEUtils from 'xe-utils'
import VPaste from './Paste'
import { store } from './store'
import GlobalConfig from "~/packages/config"

const props = defineProps({
  modelValue: { type: [String, Number, Array, Object], default: () => '' },
  options: [Function, Array],
  types: { type: Object, default: () => GlobalConfig.select.types },
  type: { type: String, default: '' },
  filterable: { type: Boolean, default: () => GlobalConfig.select.filterable },
  clearable: { type: Boolean, default: () => GlobalConfig.select.clearable },
  multiple: Boolean,
  select: { type: Boolean, default: false }, // 是否使用el-select组件渲染
  paste: { type: [Boolean, String], default: false }, // 粘贴功能，存在则开启粘贴功能，粘贴弹窗的标题默认使用传入的placeholder，如果类型为字符串则会作为弹窗的标题
  confusedPaste: Boolean,
})
const attrs = useAttrs()
// 插槽处理
let slots = computed(() => Object.keys(useSlots()))
if (props.paste && !props.multiple) {
  console.error('VSelect组件在粘贴模式下，multiple必须为true')
}

const emit = defineEmits(['update:modelValue', 'change', 'visible-change'])
const selectValue = computed({
  get() {
    return !props.modelValue ? (props.multiple ? [] : undefined) : props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const opts = ref([])
const { types, type } = props

watch(
  () => props.options,
  async (options) => {
    if (type) {
      if (!store[type]) {
        store[type] = {
          options: [],
        }
      }
      if (store[type].options?.length) {
        opts.value = store[type].options
        return
      }
    }
    if (type && types[type]) options = types[type]
    if (XEUtils.isArray(options)) {
      opts.value = options
    } else if (XEUtils.isFunction(options)) {
      const res = await options()
      opts.value = (XEUtils.isArray(res) ? res : res.data)
      store[type].update = async function () {
        this.options = await options()
      }
    } else {
      opts.value = []
    }
    if(type) {
      store[type].options = opts.value
    }
  },
  { immediate: true }
)

const handleChange = (value) => {
  const option = opts.value.find(d => d.value === value)
  emit('change', { value, option })
}

const visibleChange = val => {
  if (val && type) {
    opts.value = store[type].options || []
  }
  emit('visible-change', val)
}

const pasteChange = (pastes) => {
  const pastesValue = opts.value.reduce((acc, cur) => {
    return (props.confusedPaste && pastes.some(d => cur.label.indexOf(d) > -1) || pastes.includes(cur.label)) ? acc.concat(cur.value) : acc
  }, [])
  selectValue.value = [...new Set((selectValue.value || []).concat(pastesValue))]
}
</script>

<template>
  <VGroup v-if="(paste || confusedPaste) && multiple">
    <el-select v-if="select" v-model="selectValue" v-bind="$attrs" :filterable="filterable" :clearable="clearable"
      :multiple="multiple" collapse-tags-tooltip @change="handleChange" @visible-change="visibleChange">
      <el-option v-for="(d, i) in opts" :key="i" :label="d.label" :value="d.value"></el-option>
    </el-select>
    <el-select-v2 v-else v-model="selectValue" v-bind="$attrs" :filterable="filterable" :clearable="clearable"
      :multiple="multiple" :options="opts" collapse-tags-tooltip @change="handleChange" @visible-change="visibleChange">
      <template v-for="name in slots" #[name]="obj">
        <slot :name="name" v-bind="obj" />
      </template>
    </el-select-v2>
    <VPaste :title="typeof paste === 'string' ? paste : attrs.placeholder" @change="pasteChange" />
  </VGroup>
  <template v-else>
    <el-select v-if="select" v-model="selectValue" v-bind="$attrs" :filterable="filterable" :clearable="clearable"
      :multiple="multiple" collapse-tags-tooltip @change="handleChange" @visible-change="visibleChange">
      <el-option v-for="(d, i) in opts" :key="i" :label="d.label" :value="d.value"></el-option>
    </el-select>
    <el-select-v2 v-else v-model="selectValue" v-bind="$attrs" :filterable="filterable" :clearable="clearable"
      :multiple="multiple" :options="opts" collapse-tags-tooltip @change="handleChange" @visible-change="visibleChange">
      <template v-for="name in slots" #[name]="obj">
        <slot :name="name" v-bind="obj" />
      </template>
    </el-select-v2>
  </template>
</template>