<template>
  <VButton type="" @click="open" v-hasPermi="[hasPermi]">
    <div class="dk-iconfont icon-Upload"></div>
      导出1
  </VButton>

  <el-dialog v-model="visible" title="导出中心" width="950" draggable :close-on-click-modal="false" :close-on-press-escape="false" :before-close="handleBeforeClose" :z-index="2000">
    <div class="flex">
      <ExportFieldList ref="tableRef" :fields="exportFields" @selection-change="handleSelectionChange" @fields-change="handleFieldsChange" />

      <div class="right flex-1">
        <!-- 外部传入 importBtn 插槽时，提示信息放到按钮区上方，避免和自定义按钮布局挤在一起。 -->
        <div class="flex items-center mb-[6px]" v-if="hasImportBtnSlot">
          <el-tag type="danger">提示:</el-tag>
          <svg-icon icon-class="hint_line01"></svg-icon>导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
        </div>

        <div class="flex justify-between items-end mb-4">
          <!-- 支持外部接管导出按钮；未提供 importBtn 插槽时使用默认导出按钮。 -->
          <slot v-if="hasImportBtnSlot" name="importBtn" v-bind="{ outerExport }"></slot>
          <template v-else>
            <div v-loading="loading">
              <el-button type="primary" @click="handleImport" :disabled="loading">导出</el-button>
            </div>

            <div class="flex text-xs text-gray-400 ml-5">
              <svg-icon icon-class="hint_line01"></svg-icon>导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
            </div>
          </template>
        </div>
        <div class="flex items-center mb-2">
          <el-input v-model="exportName" class="w-full" placeholder="请输入名称" />
          <el-button type="primary" plain @click="saveTemplate">保存模版</el-button>
        </div>

        <ExportTemplateList
          :templates="templates"
          :schedule="schedule"
          :user-id="userId"
          :is-editing-template="isEditingTemplate"
          @select="selectField"
          @update="updateTemplate"
          @export="exportRow"
          @schedule="openScheduledExport"
          @delete="exportDelete"
        />
      </div>
    </div>
    <template #footer>
      <el-button @click="handleBeforeClose">关闭</el-button>
    </template>
  </el-dialog>

  <ScheduledExport ref="scheduledExportRef" :schedule-option="scheduleOption" />
</template>
<script setup name="ExportCenter">
import { computed, useSlots } from "vue"
import GlobalConfig from "~/packages/config"
// import action from "@/utils/action.js"
import ExportFieldList from "./ExportFieldList.vue"
import ExportTemplateList from "./ExportTemplateList.vue"
import { useExportCenter } from "./useExportCenter.js"
import { useExportTemplate } from "./useExportTemplate.js"
import ScheduledExport from "../ScheduledExport/index.vue"

const emit = defineEmits(["callback"])
const props = defineProps({
  // 控制定时导出入口是否展示
  schedule: { type: Boolean, default: false },
  // 作为定时导出弹窗配置透传给 ScheduledExport 组件
  scheduleOption: { type: Array, default: () => [] },
  home_system: { type: Number, default: undefined },
  tag_name: { type: String, default: "" }, // 模块名称
  titleAppend: { type: String, default: "" }, // 导出标题后缀
  hasPermi: { type: String, default: "" }, // 权限
  getFormData: { type: Function, default: () => {} }, // 获取表单数据
})

const slots = useSlots()
const hasImportBtnSlot = computed(() => Boolean(slots.importBtn))

const {
  loading,
  visible,
  tableRef,
  scheduledExportRef,
  form,
  exportFields,
  exportName,
  templates,
  handleTemplateRow,
  userId,
  toArray,
  getLatestCondition,
  getTemplate,
  isEditingTemplate,
  validateSelectedFields,
  buildExportTitle,
  buildExportRecordParams,
  getSortedSelectedFieldKeys,
  open,
  handleSelectionChange,
  handleFieldsChange,
  handleImport,
  handleBeforeClose,
  outerExport,
} = useExportCenter(props, emit)

const { selectField, saveTemplate, updateTemplate, exportRow, exportDelete, openScheduledExport } = useExportTemplate({
  tableRef,
  scheduledExportRef,
  exportFields,
  exportName,
  templates,
  form,
  handleTemplateRow,
  toArray,
  validateSelectedFields,
  getLatestCondition,
  getSortedSelectedFieldKeys,
  buildExportTitle,
  buildExportRecordParams,
  getTemplate,
  emit,
})

// 跳转 个人中心
const navPersonal = () => {
  GlobalConfig?.action.setGlobalState({
    changeMicoTabsPath: {
      path: "/user/profile",
      type: "push",
    },
  })
}
</script>
