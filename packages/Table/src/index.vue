<script lang="jsx" setup name="VTable">
import XEUtils from 'xe-utils'
import { gridConfig } from "./config";
import { ArrowUpBold } from '@element-plus/icons-vue';

// 插槽处理
let slots = computed(() => Object.keys(useSlots()))

// 搜索表单处理
const attrs = XEUtils.clone(XEUtils.merge({}, gridConfig, useAttrs()), true)
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
      searchForm[key] = val
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
// 代理query请求，把form参数修改为当前组件form
let qr = attrs.proxyConfig?.ajax?.query
if (qr) {
  attrs.proxyConfig.ajax.query = (ags) => {
    const fn = (data) => qr(data)
    ags.form = getQueryForm()
    const { total, pageSize, currentPage: pageNum } = ags.page
    ags.page = { total, pageSize, pageNum }
    return fn(ags)
  }
}

const gridRef = ref()
// 查询方法
const query = () => {
  gridRef?.value.commitProxy('query')
}
const resetAndQuery = () => {
  resetForm()
  query()
}

// 表格滚动隐藏搜索及操作区
const headerHeight = ref()
const toolbarHeight = ref()
const contentRef = ref()
const contentHeight = ref()
const offsetHeight = ref(0)
const { scrollHideForm } = attrs
const tableHeight = computed(() => offsetHeight.value ? contentHeight.value + offsetHeight.value - 4 : attrs.height)
const hideHeight = computed(() => headerHeight.value - (toolbarHeight.value + 15))

let timer = null
const handleScroll = async({ scrollTop, isY }) => {
  if (!scrollHideForm) return
  if (isY) {
    offsetHeight.value = Math.min(scrollTop, hideHeight.value)
    clearTimeout(timer)
    timer = setTimeout(() => {
      const endTop = gridRef?.value.getScroll().scrollTop
      if(endTop === 0) {
        offsetHeight.value = 0
      }
      clearTimeout(timer)
    }, 100);
  }
}
const throttleScorll = XEUtils.throttle(handleScroll, 10)
const pageChange = () => {
  if (!scrollHideForm) return
  setTimeout(() => {
    offsetHeight.value = 0
  }, 200);
}

const headerResize = async ({ height }) => {
  if (!scrollHideForm) return
  headerHeight.value = height
  offsetHeight.value = 0
  gridRef?.value.clearScroll()
  await 1
  contentHeight.value = contentRef?.value.offsetHeight
}

const tableLoad = ({ height }) => {
  if (!scrollHideForm) return
  contentHeight.value = height
}

const toolbarResize = ({ height }) => {
  if (!scrollHideForm) return
  toolbarHeight.value = height
}

const toTop = () => {
  gridRef?.value.scrollTo(null, 0)
}

// 暴露属性及方法
defineExpose({ getForm, setForm, setFormField, resetForm, query, getQueryForm, resetAndQuery, $table: gridRef })
</script>

<template>
  <div class="vx-table">
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
        <div class="vx-table__toolbar" v-dom-resize="toolbarResize">
          <slot name="toolbar_btns" />
        </div>
      </div>
    </div>
    <div ref="contentRef" v-dom-load="tableLoad" class="vx-table__content">
      <vxe-grid ref="gridRef" v-bind="attrs" :height="tableHeight" @scroll="throttleScorll" @page-change="pageChange">
        <template v-for="name in slots.filter(d => d !== 'form' && d !== 'toolbar_btns')" #[name]>
          <slot :name="name"></slot>
        </template>
      </vxe-grid>
      <div v-if="offsetHeight && offsetHeight === hideHeight" class="vx-table--to-top" @click="toTop">
        <el-icon><ArrowUpBold /></el-icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss">@import './table.scss';</style>