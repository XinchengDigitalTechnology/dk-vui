<template>
  <div class="dk-export-center-field">
    <div class="dk-export-center-field__title">字段列表</div>
    <div class="dk-export-center-field__table-wrap">
      <vxe-table ref="tableRef" :data="fields" :height="690" border class="dk-export-center-field__table"
        :row-config="rowConfig" :checkbox-config="checkboxConfig" @checkbox-change="handleCheckboxChange"
        @checkbox-all="handleCheckboxChange">
        <vxe-column type="checkbox" width="50" />
        <vxe-column type="seq" title="序号" width="60" />
        <vxe-column field="field_name" title="字段" />
        <vxe-column title="排序" width="130">
          <template #default="{ rowIndex }">
            <el-link type="primary" :underline="false" @click="moveField(rowIndex, -1)">上移</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" :underline="false" @click="moveField(rowIndex, 1)">下移</el-link>
          </template>
        </vxe-column>
      </vxe-table>

      <div class="dk-iconfont icon-ArrowUp dk-export-center-field__back-top" @click="setScrollTop(0)"></div>
    </div>
  </div>
</template>

<script setup name="ExportFieldList">
import { ref } from "vue"
import { ElMessage } from "element-plus"

const props = defineProps({
  fields: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(["selection-change", "fields-change"])
const tableRef = ref()

const rowConfig = {
  keyField: "field_key",
  isCurrent: true,
  isHover: true,
}

// reserve 对齐原 el-table reserve-selection，字段重排 / 刷新后保留勾选
const checkboxConfig = {
  reserve: true,
  highlight: true,
}

const getSelection = () => {
  const $table = tableRef.value
  if (!$table) return []

  const records = $table.getCheckboxRecords?.() || []
  const reserves = $table.getCheckboxReserveRecords?.() || []
  if (!reserves.length) return records

  const map = new Map()
    ;[...records, ...reserves].forEach((row) => {
      if (row?.field_key != null) map.set(row.field_key, row)
    })
  return [...map.values()]
}

const handleCheckboxChange = () => {
  emit("selection-change", getSelection())
}

const moveField = (index, direction) => {
  const targetIndex = index + direction
  const isFirst = targetIndex < 0
  const isLast = targetIndex >= props.fields.length

  if (isFirst || isLast) {
    ElMessage.error(isFirst ? "已经是第一条，不可上移" : "已经是最后一条，不可下移")
    return
  }

  const fields = [...props.fields]
  const targetRow = fields[targetIndex]
  fields.splice(targetIndex, 1)
  fields.splice(index, 0, targetRow)
  emit("fields-change", fields)
}

const clearSelection = () => {
  const $table = tableRef.value
  if (!$table) return

  $table.clearCheckboxRow?.()
  $table.clearCheckboxReserve?.()
  emit("selection-change", [])
}

const toggleRowSelection = (row, selected) => {
  tableRef.value?.setCheckboxRow?.(row, selected)
  emit("selection-change", getSelection())
}

const setScrollTop = (top) => {
  tableRef.value?.scrollTo?.(null, top)
}

defineExpose({
  clearSelection,
  toggleRowSelection,
  setScrollTop,
})
</script>
