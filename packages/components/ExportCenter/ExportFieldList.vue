<template>
  <div class="left flex-1 mr-5">
    <div class="font-medium text-black">字段列表2</div>
    <div style="width: 432px" class="relative">
      <el-table :data="fields" row-key="field_key" height="600" style="width: 100%" highlight-current-row border ref="tableRef" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" reserve-selection />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="field_name" label="字段" />
        <el-table-column prop="operation" label="排序" width="120">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="moveField(scope.$index, -1)">上移</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" :underline="false" @click="moveField(scope.$index, 1)">下移</el-link>
          </template>
        </el-table-column>
      </el-table>

      <div
        class="dk-iconfont icon-ArrowUp bg-[var(--base-primary-dark-bg)] w-[22px] h-[22px] text-center text-[var(--base-color)] pt-[2px] absolute right-[6px] bottom-[16px]"
        style="border-radius: 50px; z-index: 999"
        @click="setScrollTop(0)"
      ></div>
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

const handleSelectionChange = (selection) => {
  emit("selection-change", selection)
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
  tableRef.value?.clearSelection()
}

const toggleRowSelection = (row, selected) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

const setScrollTop = (top) => {
  tableRef.value?.setScrollTop(top)
}

defineExpose({
  clearSelection,
  toggleRowSelection,
  setScrollTop,
})
</script>
