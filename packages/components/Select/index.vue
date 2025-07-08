<script setup>
import XEUtils from 'xe-utils'
import Select from './Select'
import VPaste from './Paste'
import { store } from './store'
import GlobalConfig from "~/packages/config"

const props = defineProps({
  modelValue: { type: [String, Number, Array, Object, Boolean] },
  options: [Function, Array],
  types: { type: Object, default: () => GlobalConfig.select.types },
  type: { type: String, default: '' },
  filterable: { type: Boolean, default: () => GlobalConfig.select.filterable },
  clearable: { type: Boolean, default: () => GlobalConfig.select.clearable },
  multiple: Boolean,
  showCheckAll: { type: Boolean, default: false }, // 是否使用全选功能
  select: { type: Boolean, default: false }, // 是否使用el-select组件渲染
  paste: { type: Boolean, default: false }, // 粘贴功能，存在则开启粘贴功能，粘贴弹窗的标题默认使用传入的placeholder，如果类型为字符串则会作为弹窗的标题
  confusedPaste: Boolean, // 是否使用模糊粘贴
})
const attrs = useAttrs()
// 插槽处理
const slots = computed(() => Object.keys(useSlots()))
if (props.paste && !props.multiple) {
  console.error('VSelect组件在粘贴模式下，multiple必须为true')
}

const emit = defineEmits(['update:modelValue', 'change', 'visible-change'])
const selectValue = computed({
  get() {
    return props.modelValue || (props.multiple ? [] : '')
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
      if(!store[type]) store[type] = {}
      store[type].update = async function () {
        this.options = await options()
      }
    } else {
      opts.value = []
    }
    if (type) {
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
const showHeader = computed(() => props.multiple && props.showCheckAll)

const _attrs = computed(() => {
  const {select, filterable, clearable, multiple} = props
  const ats = {
    showHeader: showHeader.value,
    options: opts.value,
    select,
    filterable,
    clearable,
    multiple,
    popperClass: 'v-select',
    collapseTagsTooltip: true,
    ...attrs,
  }
  return ats
})
</script>

<template>
  <VGroup v-if="(paste || confusedPaste) && multiple">
    <Select v-model="selectValue" v-bind="_attrs" @change="handleChange" @visible-change="visibleChange">
      <template v-for="name in slots" #[name]="obj">
        <slot :name="name" v-bind="obj" />
      </template>
    </Select>
    <VPaste @change="pasteChange" />
  </VGroup>
  <Select v-else v-model="selectValue" v-bind="_attrs" @change="handleChange" @visible-change="visibleChange">
    <template v-for="name in slots" #[name]="obj">
      <slot :name="name" v-bind="obj" />
    </template>
  </Select>
</template>

<style lang="scss">
.v-select {
  .v-select-checkAll {
    width: 100%;
    line-height: 30px;
    padding: 0 10px;
    margin: 2px 0;
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
  .el-select-dropdown__header {
    padding: 0;
  }
}
</style>