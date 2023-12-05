<script lang="jsx" setup name="VTable">
import XEUtils from 'xe-utils'
import { gridConfig } from "./config";
import { ArrowUpBold } from '@element-plus/icons-vue'
import Pagination from './Pagination'

// 插槽处理
let slots = computed(() => [...new Set(Object.keys(useSlots()).concat(['toolbar_btns']))])

// 搜索表单处理
const merge = XEUtils.merge({}, gridConfig, useAttrs())
const attrs = XEUtils.clone(Object.assign({}, merge, { pagerConfig: undefined }), true)
const { data } = attrs.formConfig || {}
const defaultValue = Object.assign({}, data)
const getSourceValue = () => XEUtils.clone(defaultValue, true)
const form = ref(getSourceValue())
// 设置表单方法
const getForm = () => form.value
const getQueryForm = () => {
  const searchForm = {}
  for (const key in form.value) {
    if (!key) continue
    const val = form.value[key];
    if (XEUtils.isObject(val)) { // 值为对象
      const keys = Object.keys(val)
      const { range, value } = val
      if (keys.includes('type')) { // 有type的特殊对象
        const { type, start, end } = val
        if (!type) continue
        // 处理结构为 { type: '', value: '' } 的对象
        if (keys.includes('value')) {
          // range代表值需要拆分成 { start, end }
          if (range && Array.isArray(value)) {
            const [s, e] = value || [undefined, undefined]
            if (s || e) {
              searchForm[type] = { start: s, end: e }
            }
          } else {
            value && (searchForm[type] = value)
          }
        }
        // 处理结构为 { type: '', start: '', end: '' } 的对象
        if (keys.includes('start') && keys.includes('end')) {
          (start || end) && (searchForm[type] = { start, end })
        }
      } else { // 没有type的普通对象
        if (range && Array.isArray(value)) {
          // range代表值需要拆分成 { start_key, end_key }
          const [startKey, endKey] = val.rangeKeys // 自定义key
          const [s, e] = value || [undefined, undefined]
          s && (searchForm[startKey || 'start_' + key] = s)
          e && (searchForm[endKey || 'end_' + key] = e)
        } else {
          val && (searchForm[key] = val)
        }
      }
    } else { // 值为非对象
      val && (searchForm[key] = val)
    }
  }
  return searchForm
}
// 设置表单方法
const setForm = (val) => {
  form.value = Object.assign({}, getSourceValue(), val)
}
// 设置表单字段方法
const setFormField = (field, val) => {
  form.value[field] = val
}
// 重置表单方法
const resetForm = () => {
  form.value = getSourceValue()
}

// 分页处理
const { pageSize, pageNum } = merge.pagerConfig || {}
const pager = reactive({ pageSize: pageSize || 20, pageNum: pageNum || 1, total: 0 })
const pageChange = val => {
  const { type, currentPage, pageSize } = val
  pager.pageNum = type === 'size' ? 1 : currentPage // 分页大小变化重置分页
  pager.pageSize = pageSize
  gridRef?.value.commitProxy('query')
}

// 代理query请求，把form参数修改为当前组件form
let qr = attrs.proxyConfig?.ajax?.query
const loadData = ref(false)
const pageHidden = ref(false)
if (qr) {
  const { props } = attrs.proxyConfig
  attrs.proxyConfig.ajax.query = (ags) => {
    loadData.value = true
    // 页面跳转携带参数处理
    const { tableForm } = JSON.parse(sessionStorage.getItem('_table_form') || '{}')
    if (tableForm) {
      setForm(tableForm)
      sessionStorage.setItem('_table_form', '{}')
    }
    // 表单数据及分页处理
    ags.form = getQueryForm()
    ags.page = pager
    return qr(ags).then(res => {
      if (Array.isArray(res)) {
        pageHidden.value = true
        return res
      }
      pager.total = XEUtils.get(res, props.total)
      return XEUtils.get(res, props.result)
    }).catch(() => [])
  }
}

// 监听查询条件变化
const formChange = ref(false)
watch(
  () => form.value,
  () => {
    formChange.value = true
  },
  {
    deep: true
  }
)

const gridRef = ref()
// 查询方法
const query = async () => {
  await 1
  // 如果查询条件变化则重置分页
  if (formChange.value) {
    pager.pageNum = 1
  }
  gridRef?.value.commitProxy('query')
  formChange.value = false
}
const resetAndQuery = () => {
  resetForm()
  query()
}

// 表格滚动隐藏搜索及操作区
const headerHeight = ref()
const contentRef = ref()
const contentHeight = ref()
const offsetHeight = ref(0)
const { scrollHideForm } = attrs
const tableHeight = computed(() => offsetHeight.value ? contentHeight.value + offsetHeight.value - 4 : attrs.height)

let timer = null
const handleScroll = async ({ scrollTop, isY }) => {
  if (!scrollHideForm || activating.value) return
  if (isY) {
    offsetHeight.value = Math.min(scrollTop, headerHeight.value)
  }
  if (!scrollTop) {
    offsetHeight.value = 0
    return
  }
  clearTimeout(timer)
  timer = setTimeout(() => {
    const endTop = gridRef?.value.getScroll().scrollTop
    if (endTop === 0) {
      offsetHeight.value = 0
    }
    clearTimeout(timer)
  }, 50);
}
const throttleScorll = XEUtils.throttle(handleScroll, 10)

const activating = ref(false)
const headerResize = async ({ height }) => {
  if (!scrollHideForm || activating.value) return
  headerHeight.value = height
  offsetHeight.value = 0
  gridRef?.value.clearScroll()
  await 1
  contentHeight.value = contentRef?.value.offsetHeight
}

const tableResize = () => {
  if (!scrollHideForm) return
  headerResize({ height: headerHeight.value })
}

const tableLoad = ({ height }) => {
  if (!scrollHideForm) return
  contentHeight.value = height
}

const toTop = () => {
  gridRef?.value.scrollTo(null, 0)
}


// 处理带参数的页面跳转
const _table_form = sessionStorage.getItem('_table_form')
if (!_table_form) sessionStorage.setItem('_table_form', '{}')

onActivated(() => {
  activating.value = true
  const { tableForm } = JSON.parse(sessionStorage.getItem('_table_form') || '{}')
  if (tableForm) {
    query()
  }
  clearTimeout(timer)
  timer = setTimeout(() => {
    activating.value = false
    clearTimeout(timer)
  }, 50)
})

nextTick(() => {
  // 表格加载完毕后，没有加载数据，则主动请求一次
  if (!loadData.value) query()
})

// 暴露属性及方法
defineExpose({ getForm, setForm, setFormField, resetForm, query, getQueryForm, resetAndQuery, $table: gridRef })
</script>

<template>
  <div class="vx-table" v-dom-resize="tableResize">
    <div class="vx-table__header" :style="{ height: `${offsetHeight ? (headerHeight - offsetHeight) + 'px' : 'auto'}` }">
      <div v-dom-resize="headerResize" :style="{ transform: `translateY(${-offsetHeight + 'px'})` }">
        <div v-if="slots.includes('form')" class="vx-table__form">
          <div class="vx-table__form-content">
            <slot name="form" v-bind="{ form }" />
            <div class="vx-table__form-handle">
              <slot name="form_handle">
                <el-button type="primary" @click="query">查询</el-button>
                <el-button @click="resetAndQuery">重置</el-button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div ref="contentRef" v-dom-load="tableLoad" class="vx-table__content">
      <vxe-grid ref="gridRef" v-bind="attrs" :height="tableHeight" @scroll="throttleScorll">
        <template v-for="name in slots.filter(d => d !== 'form')" #[name]>
          <slot :name="name"></slot>
        </template>
        <template #pager>
          <Pagination v-bind="merge.pagerConfig" v-model:pageSize="pager.pageSize" :hidden="pageHidden"
            v-model:pageNum="pager.pageNum" :total="pager.total" @change="pageChange" />
        </template>
      </vxe-grid>
      <div v-if="offsetHeight && offsetHeight === headerHeight" class="vx-table--to-top" @click="toTop">
        <el-icon>
          <ArrowUpBold />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './table.scss';
</style>