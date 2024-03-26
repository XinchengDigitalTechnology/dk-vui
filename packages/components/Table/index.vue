<script lang="jsx" setup>
import XEUtils from 'xe-utils'
import GlobalConfig from "~/packages/config"
import { ArrowUpBold } from '@element-plus/icons-vue'
import Pagination from './Pagination'
import SaveForm from './SaveForm'
import HighForm from './HighForm'
import HScroll from './HScroll.vue'

// 插槽处理
let slots = computed(() => [...new Set(Object.keys(useSlots()).concat(['toolbar_btns']))])
// 搜索表单处理
const merge = XEUtils.merge({}, XEUtils.clone(GlobalConfig.table, true), useAttrs())
// column不传slots时，默认用 VText组件渲染，支持设置 line 参数
merge.columns = merge.columns.map(d => {
  const { type, field, slots, line = 1, copy = false } = d
  if (!type && !slots) {
    d.slots = {}
    d.slots.default = ({ row }) => <VText value={row[field]} line={line} copy={copy} />
  }
  return d
})
const attrs = XEUtils.clone(Object.assign({}, merge, { pagerConfig: undefined }), true)
const { formConfig } = attrs
const defaultValue = Object.assign({}, formConfig.data)
const getSourceValue = () => XEUtils.clone(defaultValue, true)
const form = ref(getSourceValue())
// 设置表单方法
const getForm = () => form.value
const getQueryForm = () => {
  const searchForm = {}
  const noNull = (val) => val || val === 0 // 非空值
  for (const key in form.value) {
    if (!key) continue
    const val = form.value[key];
    if (XEUtils.isObject(val)) { // 值为对象
      const keys = Object.keys(val)
      const { range, value } = val
      if (keys.includes('type')) { // 有type的特殊对象
        const { type, start, end } = val
        if (!noNull(type)) continue
        // 处理结构为 { type: '', value: '' } 的对象
        if (keys.includes('value')) {
          // range代表值需要拆分成 { start, end }
          if (range && Array.isArray(value)) {
            const [s, e] = value || [undefined, undefined]
            if (noNull(s) || noNull(e)) {
              searchForm[type] = { start: s, end: e }
            }
          } else {
            if (noNull(value)) {
              searchForm[type] = value
            }
          }
        }
        // 处理结构为 { type: '', start: '', end: '' } 的对象
        if (keys.includes('start') && keys.includes('end')) {
          (noNull(start) || noNull(end)) && (searchForm[type] = { start, end })
        }
      } else { // 没有type的普通对象
        if (range && Array.isArray(value)) {
          // range代表值需要拆分成 { start_key, end_key }
          const [startKey, endKey] = val.rangeKeys // 自定义key
          const [s, e] = value || [undefined, undefined]
          noNull(s) && (searchForm[startKey || 'start_' + key] = s)
          noNull(e) && (searchForm[endKey || 'end_' + key] = e)
        } else {
          if (noNull(val)) {
            searchForm[key] = val
          }
        }
      }
    } else { // 值为非对象
      if (noNull(val)) {
        searchForm[key] = val
      }
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

// 分页变化及搜索条件变化
const isChange = ref(false)

// 分页处理
const gridRef = ref()
const { pageSize, pageNum } = merge.pagerConfig || {}
const pager = reactive({ pageSize: pageSize || 20, pageNum: pageNum || 1, total: 0 })
const pageChange = ({ type, pageNum, pageSize }) => {
  if (type === 'current') {
    isChange.value = true
  }
  pager.pageNum = type === 'size' ? 1 : pageNum // 分页大小变化重置分页
  pager.pageSize = pageSize
  gridRef?.value?.commitProxy('query')
}

// 设置分页方法
const setPager = ({ pageNum, pageSize } = {}) => {
  pageChange({ type: pageNum ? 'current' : 'size', pageNum: pageNum || pager.pageNum, pageSize: pageSize || pager.pageSize })
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
    formChange.value = false
    // 分页变化及搜索条件变化返回顶部
    if (isChange.value) {
      offsetHeight.value = 0
      gridRef?.value.clearScroll()
      isChange.value = false
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
      const data = XEUtils.get(res, props.result).map(d => {
        d._CHECKED_ = false
        return d
      })
      return data
    }).catch(() => [])
  }
}

// 监听查询条件变化
const formChange = ref(false)
watch(
  () => form.value,
  () => {
    formChange.value = true
    isChange.value = true
  },
  {
    deep: true
  }
)

// 查询方法
const query = async () => {
  await 1
  // 如果查询条件变化则重置分页
  if (formChange.value) {
    pager.pageNum = 1
  }
  gridRef?.value.commitProxy('query')
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
const tableHeight = computed(() => offsetHeight.value ? contentHeight.value + offsetHeight.value : attrs.height)

let timer = null
const handleScroll = async ({ scrollLeft, scrollTop, isY }) => {
  bodyRect.value.scrollLeft = scrollLeft
  if (!scrollHideForm || !headerHeight.value) return
  if (isY) {
    offsetHeight.value = Math.min(scrollTop, headerHeight.value)
  }
  if (!scrollTop) {
    offsetHeight.value = 0
    return
  }
  if (activating.value) return
  clearTimeout(timer)
  timer = setTimeout(() => {
    const endTop = gridRef?.value.getScroll().scrollTop
    if (endTop === 0) {
      offsetHeight.value = 0
    }
    clearTimeout(timer)
  }, 50)
}
// const throttleScorll = XEUtils.throttle(handleScroll, 10)

// 横线滚动
const handleScrollX = (scrollLeft) => {
  gridRef.value.scrollTo(scrollLeft)
}

const activating = ref(false)
const headerResize = async ({ width, height }) => {
  if (!scrollHideForm) return
  headerHeight.value = height
  if (activating.value || !width) return
  offsetHeight.value = 0
  gridRef?.value.clearScroll()
  await 1
  contentHeight.value = contentRef?.value.offsetHeight
}

const tableRef = ref()
const bodyRect = ref({ ffsetWidth: 0, scrollWidth: 0, clientWidth: 0, scrollLeft: 0 })

const updateScroll = () => {
  const tableBody = tableRef.value.querySelector('.vxe-table--body-wrapper')
  if(!tableBody) return
  const { scrollWidth, clientWidth } = tableBody
  bodyRect.value = { ...bodyRect.value, scrollWidth, clientWidth, mouseOffset: clientWidth > 900 ? 0 : Math.min(240, 900 - clientWidth) }
}

const tableResize = ({ width }) => {
  if (!scrollHideForm) return
  headerResize({ width, height: headerHeight.value })
  updateScroll()
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

let atimer = null
onActivated(() => {
  const { tableForm } = JSON.parse(sessionStorage.getItem('_table_form') || '{}')
  const handleQuery = sessionStorage.getItem('DK_VUI_TABLE_QUERY')
  if (tableForm) {
    query()
  }
  if (handleQuery) {
    query()
    sessionStorage.removeItem('DK_VUI_TABLE_QUERY')
  }
  activating.value = true
  clearTimeout(atimer)
  atimer = setTimeout(() => {
    activating.value = false
    clearTimeout(atimer)
  }, 100)
})

nextTick(() => {
  // 表格加载完毕后，没有加载数据，则主动请求一次
  if (!loadData.value && merge.autoLoadQuery) query()
})

provide('table', { getForm, setForm, formConfig })

// 暴露属性及方法
defineExpose({ getForm, setForm, setFormField, resetForm, query, getQueryForm, resetAndQuery, setPager, updateScroll, $table: gridRef })
</script>

<template>
  <div ref="tableRef" class="vx-table" v-dom-resize="tableResize">
    <div class="vx-table__header" :style="{ height: `${offsetHeight ? (headerHeight - offsetHeight) + 'px' : 'auto'}` }">
      <div v-dom-resize="headerResize" :style="{ transform: `translateY(${-offsetHeight + 'px'})` }">
        <div v-if="slots.includes('form')" class="vx-table__form">
          <div class="vx-table__form-content">
            <slot name="form" v-bind="{ form }" />
            <div class="vx-table__form-handle">
              <slot name="form_handle">
                <el-button type="primary" @click="query">查询</el-button>
                <el-button @click="resetAndQuery">重置</el-button>
                <SaveForm v-if="formConfig.save" @query="query" />
                <template v-if="slots.includes('high_form')">
                  <HighForm @query="query" @reset="resetAndQuery">
                    <slot name="high_form" v-bind="{ form }" />
                  </HighForm>
                </template>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div ref="contentRef" v-dom-load="tableLoad" class="vx-table__content">
      <vxe-grid ref="gridRef" v-bind="attrs" :height="tableHeight" @scroll="handleScroll" @resizable-change="updateScroll">
        <template v-for="name in slots.filter(d => !['form', 'high_form'].includes(d))" #[name]="row">
          <slot :name="name" v-bind="row"></slot>
        </template>
        <template #pager>
          <div class="v-pagination-container">
            <Pagination v-bind="merge.pagerConfig" v-model:pageSize="pager.pageSize" :hidden="pageHidden"
              v-model:pageNum="pager.pageNum" :total="pager.total" @change="pageChange" />
            <HScroll v-if="merge.crossSlip" :bodyRect="bodyRect" @scroll="handleScrollX" />
          </div>
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