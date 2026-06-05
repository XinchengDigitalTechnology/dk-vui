<template>
  <VButton type="" @click="open" v-hasPermi="[hasPermi]" v-if="type === 'button'">
    <div class="dk-iconfont icon-Upload"></div>
      导出
  </VButton>

  <el-dialog v-model="visible" title="导出中心" width="950" draggable :close-on-click-modal="false" :close-on-press-escape="false" :before-close="handleClose" :destroy-on-close="true">
    <div class="dk-export-center">
      <ExportFieldList ref="tableRef" :fields="exportFields" @selection-change="handleSelectionChange" @fields-change="handleFieldsChange" />

      <div class="dk-export-center__right">
        <!-- 外部传入 exportButton 插槽时，提示信息放到按钮区上方，避免和自定义按钮布局挤在一起。 -->
        <div class="dk-export-center__custom-tip" v-if="hasExportButtonSlot">
          <el-tag type="danger">提示:</el-tag>
          <!-- <div class="dk-iconfont icon-Warning"></div> -->
          导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
        </div>

        <div class="dk-export-center__action-bar" v-loading="loading">
          <!-- 支持外部接管导出按钮；未提供 exportButton 插槽时使用默认导出按钮。 -->
          <slot v-if="hasExportButtonSlot" name="exportButton" v-bind="{ outerExport }"></slot>
          <template v-else>
            <div class="dk-export-center__export-button">
              <el-button type="primary" @click="handleImport" :disabled="loading">导出</el-button>

              <div class="dk-export-center__default-tip">
                <div class="dk-iconfont icon-Warning"></div>
                导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
              </div>
            </div>
          </template>
        </div>
        <div class="dk-export-center__template-save">
          <el-input v-model="exportName" class="dk-export-center__template-name" placeholder="请输入名称" />
          <el-button class="dk-export-center__template-save-button" type="primary" plain @click="saveTemplate">保存模版</el-button>
        </div>

        <ExportTemplateList
          :templates="templates"
          :schedule="schedule"
          :user-id="userId"
          :loading="templateExportLoading"
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
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>

  <ScheduledExport v-if="schedule" ref="scheduledExportRef" :schedule-option="scheduleOption" />
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
  type: { type: String, default: "button" }, // button: 按钮模式, dialog: 弹窗模式
  tag_name: { type: String, required: true }, // 模块名称
  // 控制定时导出入口是否展示
  schedule: { type: Boolean, default: false },
  // 作为定时导出弹窗配置透传给 ScheduledExport 组件
  scheduleOption: { type: Array, default: () => [] },
  home_system: { type: Number, default: null },
  titleAppend: { type: String, default: "" }, // 导出标题后缀
  hasPermi: { type: String, default: "" }, // 权限
  getFormData: { type: Function, default: () => {} }, // 获取表单数据
})

const slots = useSlots()
const hasExportButtonSlot = computed(() => Boolean(slots.exportButton))

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

const { templateExportLoading, selectField, saveTemplate, updateTemplate, exportRow, cancelPendingTemplateExport, exportDelete, openScheduledExport } = useExportTemplate({
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

const handleClose = (done) => {
  cancelPendingTemplateExport()
  handleBeforeClose(done)
}

// 跳转 个人中心
const navPersonal = () => {
  GlobalConfig?.action.setGlobalState({
    changeMicoTabsPath: {
      path: "/user/profile",
      type: "push",
    },
  })
}

defineExpose({
  open,
})
</script>
<style lang="scss" src="./index.scss"></style>
