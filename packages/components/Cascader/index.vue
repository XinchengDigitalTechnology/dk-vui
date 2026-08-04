<template>
  <el-cascader ref="contentRef" v-bind="$attrs" v-model="cascaderValue" :filterable="filterable" :clearable="clearable"
    :options="opts" :props="cascaderProps" :show-all-levels="showAllLevels"
    :collapse-tags-tooltip="collapseTagsTooltip" :filter-method="filterMethod" :before-filter="beforeFilter"
    @change="change" />
</template>
<script setup>
import XEUtils from 'xe-utils'
import { store } from './store'
import GlobalConfig from "~/packages/config"

const props = defineProps({
  modelValue: { type: [Object, Array, String, Number], default: () => '' },
  options: [Function, Array],
  types: { type: Object, default: () => GlobalConfig.cascader.types },
  type: { type: String, default: '' },
  multiple: Boolean,
  filterable: { type: Boolean, default: () => GlobalConfig.cascader.filterable },
  clearable: { type: Boolean, default: () => GlobalConfig.cascader.clearable },
  checkStrictly: Boolean,
  showAllLevels: { type: Boolean, default: false },
  emitPath: { type: Boolean, default: false },
  level: { type: Number, default: 0 },
  collapseTagsTooltip: { type: Boolean, default: true },
  sortDisabled: { type: Boolean, default: true }, // 筛选时是否将包含「已禁用」的建议项沉底
})
const emit = defineEmits(['update:modelValue', 'change'])

const { types, type, level } = props
const typeConfig = computed(() => {
  const conf = types[type]
  if (!conf) return {}
  if (XEUtils.isFunction(conf) || XEUtils.isArray(conf)) {
    return { options: conf }
  }
  return conf
})

const cascaderValue = computed({
  get() {
    let val = props.modelValue
    const { joinPath } = typeConfig.value
    if (!joinPath || val == null || val === '') return val
    if (props.multiple && Array.isArray(val)) {
      return val.map(d => (typeof d === 'string' ? d.split(joinPath) : d))
    }
    if (!props.multiple && typeof val === 'string') {
      return val.split(joinPath)
    }
    return val
  },
  set(val) {
    const { joinPath } = typeConfig.value
    if (joinPath && val != null && val !== '') {
      if (props.multiple && Array.isArray(val)) {
        val = val.map(d => (Array.isArray(d) ? d.join(joinPath) : d))
      } else if (!props.multiple && Array.isArray(val)) {
        val = val.join(joinPath)
      }
    }
    emit('update:modelValue', val)
  }
})

const childKey = computed(() => typeConfig.value.children || 'sub')

function clearArrayLevels(arr, lv) {
  if (lv <= 0) return []
  if (!Array.isArray(arr)) return arr
  return arr.map(item => {
    const next = { ...item }
    if (Array.isArray(next[childKey.value])) {
      next[childKey.value] = clearArrayLevels(next[childKey.value], lv - 1)
    }
    return next
  })
}

const storeKey = computed(() => {
  if (!type) return ''
  return level ? `${type}${level}` : type
})

const opts = ref([])

const resolveOptions = async (options) => {
  let source = options
  if (type && types[type] && source == null) {
    const conf = types[type]
    source = (XEUtils.isFunction(conf) || XEUtils.isArray(conf)) ? conf : conf.options
  }
  if (XEUtils.isArray(source)) {
    return source
  }
  if (XEUtils.isFunction(source)) {
    const res = await source()
    return XEUtils.isArray(res) ? res : (res?.data || [])
  }
  return []
}

watch(
  () => props.options,
  async (options) => {
    if (typeConfig.value.lazy) {
      opts.value = []
      return
    }

    const key = storeKey.value
    if (key) {
      if (!store[key]) {
        store[key] = { options: [] }
      }
      if (store[key].options?.length) {
        opts.value = store[key].options
        return
      }
    }

    let data = await resolveOptions(options)
    if (level) {
      data = clearArrayLevels(XEUtils.clone(data, true), level)
    }
    opts.value = data

    if (key) {
      store[key].options = opts.value
      const typeOpts = types[type]
      const canUpdate = XEUtils.isFunction(options)
        || XEUtils.isFunction(typeOpts)
        || XEUtils.isFunction(typeOpts?.options)
      if (canUpdate) {
        store[key].update = async function () {
          let next = await resolveOptions(options)
          if (level) {
            next = clearArrayLevels(XEUtils.clone(next, true), level)
          }
          this.options = next
          opts.value = next
        }
      }
    }
  },
  { immediate: true }
)

const cascaderProps = computed(() => {
  const {
    lazy,
    lazyLoad,
    label = 'name',
    value = 'id',
    children = 'sub',
    emitPath: typeEmitPath,
  } = typeConfig.value
  if (lazy) return { lazy, lazyLoad }
  return {
    emitPath: typeEmitPath ?? props.emitPath,
    checkStrictly: props.checkStrictly,
    multiple: props.multiple,
    label,
    value,
    children,
  }
})

const sortSuggestionList = () => {
  setTimeout(() => {
    const suggestionList = contentRef?.value?.contentRef?.querySelector(".el-cascader__suggestion-list")
    if (!suggestionList) return

    const liElements = Array.from(suggestionList.querySelectorAll("li"))
    if (!liElements.length) return

    const normalItems = []
    const disabledItems = []
    for (const li of liElements) {
      if (li.textContent.includes("已禁用")) {
        disabledItems.push(li)
      } else {
        normalItems.push(li)
      }
    }

    suggestionList.querySelectorAll(".el-cascader__suggestion-item").forEach((item) => item.remove())
    const emptyText = suggestionList.querySelector(".el-cascader__empty-text")
    if (emptyText) return

    normalItems.concat(disabledItems).forEach((li) => suggestionList.appendChild(li))
  }, 50)
}

const beforeFilter = () => {
  if (typeConfig.value.sortDisabled ?? props.sortDisabled) {
    sortSuggestionList()
  }
  return true
}

const filterMethod = (node, val) => {
  if (!!~node.text.indexOf(val) || !!~node.text.toUpperCase().indexOf(val.toUpperCase())) {
    return true
  }
}

const contentRef = ref()
const change = (value) => {
  const getCheckedNodes = contentRef?.value.getCheckedNodes()
  const useEmitPath = typeConfig.value.emitPath ?? props.emitPath
  const labels = useEmitPath
    ? (getCheckedNodes[0]?.pathLabels || [])
    : props.multiple
      ? getCheckedNodes.map(d => d['label'])
      : getCheckedNodes[0]['label']
  emit('change', { value, labels })
}

defineExpose({ contentRef })
</script>
