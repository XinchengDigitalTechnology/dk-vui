<template>
  <el-cascader ref="contentRef" v-bind="$attrs" v-model="cascaderValue" :filterable="filterable" :clearable="clearable" :options="options" :props="cascaderProps"
    :show-all-levels="showAllLevels" :collapse-tags-tooltip="collapseTagsTooltip" :filter-method="filterMethod" :before-filter="beforeFilter" @change="change" />
</template>
<script setup>
import useCommonStore from "@/store/modules/common";
import * as api from '@/api/public'
import GlobalConfig from "~/packages/config"
const config = {
  0: {
    key: 'personnel', // 人员
    value: 'user_id',
    children: 'sub'
  },
  1: {
    key: 'department', // 部门
    children: 'sub',
  },
  2: {
    key: 'classify', // 分类
    children: 'son'
  },
  3: {
    key: 'areaTree', // 国内省市区
    children: 'sub'
  },
  department: {
    key: 'department', // 部门
    children: 'sub',
    value: 'name',
    emitPath: true
  },
}


const props = defineProps({
  modelValue: { type: [String, Number, Array, Object, Boolean], default: () => '' },
  type: { type: String, default: '0' },
  multiple: Boolean,
  filterable: { type: Boolean, default: true },
  clearable: { type: Boolean, default: true },
  checkStrictly: Boolean,
  showAllLevels: { type: Boolean, default: false },
  emitPath: { type: Boolean, default: false },
  level: { type: Number, default: 0 },
  collapseTagsTooltip: { type: Boolean, default: true },
});
const emit = defineEmits(['update:modelValue', 'change'])
const cascaderValue = computed({
  get() {
    let val = props.modelValue
    if (Array.isArray(val) && props.type === 'department') {
      val = (val || []).map(d => d.split('/'))
    }
    return val
  },
  set(val) {
    if (Array.isArray(val) && props.type === 'department') {
      val = (val || []).map(d => d.join('/'))
    }
    emit('update:modelValue', val)
  }
})
const commonStore = useCommonStore();
const item = config[props.type]
const { key } = item

// 指定层级
const { level } = props
const child = item.children
function clearArrayLevels(arr, level) {
  if (level <= 0) return []
  if (!Array.isArray(arr)) {
    return arr;
  }

  return arr.map(item => {
    if (Array.isArray(item[child])) {
      item[child] = clearArrayLevels(item[child], level - 1);
    }
    return item;
  })
}

const keyName = level ? key + (level || '') : key
if (!commonStore.options[keyName] && !item.lazy) {
  try {
    api[key]().then(data => {
      let opts = []
      if (level) {
        opts = clearArrayLevels(data, level)
      } else {
        opts = data
      }
      commonStore.setOptions(keyName, opts)
    })
  } catch (error) {
    console.log('error', error)
  }
}

const options = computed(() => item.lazy ? [] : commonStore.options[keyName])

const cascaderProps = computed(() => {
  const { lazy, lazyLoad, label = 'name', value = 'id', children = 'sub' } = item
  if (item.lazy) return { lazy, lazyLoad }
  return {
    emitPath: item.emitPath || props.emitPath,
    checkStrictly: props.checkStrictly,
    multiple: props.multiple,
    label,
    value,
    children,
  }
})


const sortSuggestionList = (contentRef) => {
  setTimeout(() => {
    // 获取 suggestion-list DOM 元素
    const suggestionList = contentRef?.value?.contentRef?.querySelector(".el-cascader__suggestion-list")
    if (!suggestionList) return

    // 获取所有li元素并转换为数组
    const liElements = Array.from(suggestionList.querySelectorAll("li"))
    if (!liElements.length) return

    // 单次遍历分离元素
    const normalItems = []
    const disabledItems = []
    for (const li of liElements) {
      if (li.textContent.includes("已禁用")) {
        disabledItems.push(li)
      } else {
        normalItems.push(li)
      }
    }

    // 清空原有列表
    suggestionList.querySelectorAll(".el-cascader__suggestion-item").forEach((item) => item.remove())
    // 检查是否存在空文本提示，如果存在则不执行排序
    const emptyText = suggestionList.querySelector(".el-cascader__empty-text")
    if (emptyText) {
      // console.log("存在空文本提示，跳过排序")
      return
    }
    // 重新添加排序后的元素
    const sortedItems = normalItems.concat(disabledItems)
    sortedItems.forEach((li) => suggestionList.appendChild(li))
  }, 50)
}

const beforeFilter = () => {
  if (props.type == "0") {
    sortSuggestionList(contentRef)
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
  const labels = props.emitPath ? (getCheckedNodes[0]?.pathLabels || []) : props.multiple ? getCheckedNodes.map(d => d['label']) : getCheckedNodes[0]['label']
  emit('change', { value, labels })
}

defineExpose({ contentRef })
</script>