<template>
  <div class="dk-export-center-template">
    <vxe-table
      :data="templates"
      class="dk-export-center-template__table"
      :row-config="rowConfig"
      :loading="loading"
    >
      <vxe-column field="name" title="名称">
        <template #default="{ row, rowIndex }">
          <div class="dk-export-center-template__name-row">
            <div class="dk-export-center-template__name-text">
              <el-link type="primary" :underline="false" @click="$emit('select', row, rowIndex)">{{ row.name }}</el-link>
            </div>
            <el-link type="primary" v-if="isEditingTemplate(rowIndex)" @click="$emit('update', row)">保存</el-link>
          </div>
        </template>
      </vxe-column>
      <vxe-column field="operation" title="操作" :width="schedule ? 200 : 120">
        <template #default="{ row }">
          <div class="dk-export-center-template__operation">
            <el-button type="primary" link :disabled="loading" @click="$emit('export', row)">导出</el-button>
            <span v-if="schedule">
              <el-divider direction="vertical" />
              <el-button type="primary" link @click="$emit('schedule', row)">定时导出</el-button>
            </span>
            <template v-if="row.creator_id == userId">
              <el-divider direction="vertical" />
              <el-button type="danger" link @click="$emit('delete', row)">删除</el-button>
            </template>
          </div>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script setup name="ExportTemplateList">
defineProps({
  templates: {
    type: Array,
    default: () => [],
  },
  schedule: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: [String, Number],
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isEditingTemplate: {
    type: Function,
    default: () => false,
  },
})

defineEmits(["select", "update", "export", "schedule", "delete"])

const rowConfig = {
  isCurrent: true,
  isHover: true,
}
</script>
