<template>
  <el-table :data="templates" style="width: 100%" highlight-current-row border>
    <el-table-column prop="name" label="名称">
      <template #default="{ row, $index }">
        <div class="flex">
          <div class="flex-1">
            <el-link type="primary" :underline="false" @click="$emit('select', row, $index)">{{ row.name }}</el-link>
          </div>
          <el-link type="primary" v-if="isEditingTemplate($index)" @click="$emit('update', row)">保存</el-link>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="operation" label="操作" width="200">
      <template #default="{ row }">
        <el-button type="primary" link :loading="loading" :disabled="loading" @click="$emit('export', row)">导出</el-button>
        <span v-if="schedule">
          <el-divider direction="vertical" />
          <el-button type="primary" link @click="$emit('schedule', row)">定时导出</el-button>
        </span>
        <template v-if="row.creator_id == userId">
          <el-divider direction="vertical" />
          <el-button type="danger" link @click="$emit('delete', row)">删除</el-button>
        </template>
      </template>
    </el-table-column>
  </el-table>
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
</script>
