<template>
  <VButton :type="buttonType" @click="open" :auth="hasPermi" v-if="type === 'button'">
    <div class="dk-iconfont icon-Upload"></div>
      导出
  </VButton>

  <el-dialog v-model="visible" :title="`导出中心${dialogConfigName ? ' - ' + dialogConfigName : ''}`" width="950" draggable
    align-center class="dk-export-center-dialog" :close-on-click-modal="false" :close-on-press-escape="false"
    :before-close="handleClose" :destroy-on-close="true">
    <div class="dk-export-center">
      <ExportFieldList ref="tableRef" :fields="exportFields" @selection-change="handleSelectionChange"
        @fields-change="handleFieldsChange" />

      <div class="dk-export-center__toolbar" v-if="hasExportButtonSlot">
        <div class="dk-export-center__custom-tip">
          <el-tag type="danger">提示:</el-tag>
          导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
        </div>
      </div>
      <div class="dk-export-center__toolbar" v-else v-loading="loading">
        <div class="dk-export-center__export-button">
          <el-button type="primary" @click="handleImport" :disabled="loading">导出</el-button>

          <div class="dk-export-center__default-tip">
            <div class="dk-iconfont icon-Warning"></div>
            导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
          </div>
        </div>
      </div>

      <div class="dk-export-center__right-main">
        <div class="dk-export-center__action-bar" v-if="hasExportButtonSlot" v-loading="loading">
          <slot name="exportButton" v-bind="{ outerExport }"></slot>
        </div>
        <div class="dk-export-center__template-save">
          <VGroup class="dk-export-center__template-group">
            <el-input v-model="exportName" class="dk-export-center__template-name" placeholder="请输入名称" />
            <el-button class="dk-export-center__template-save-button" type="primary" plain @click="saveTemplate">保存模版</el-button>
          </VGroup>
        </div>

        <ExportTemplateList :templates="templates" :schedule="schedule" :user-id="userId"
          :loading="templateExportLoading" :is-editing-template="isEditingTemplate" @select="selectField"
          @update="updateTemplate" @export="exportRow" @schedule="openScheduledExport" @delete="exportDelete" />
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
import ExportFieldList from "./ExportFieldList.vue"
import ExportTemplateList from "./ExportTemplateList.vue"
import { useExportCenter } from "./useExportCenter.js"
import { useExportTemplate } from "./useExportTemplate.js"
import ScheduledExport from "../ScheduledExport/index.vue"

const emit = defineEmits(["callback"])
const props = defineProps({
  type: { type: String, default: "button" }, // button: 按钮模式, dialog: 弹窗模式
  buttonType: { type: String, default: "" }, // 按钮类型
  config_name: { type: String, default: "" }, // 配置名称
  tag_name: { type: String, required: true }, // 模块名称
  restriction: Function, // 导出限制，type Promise
  // 控制定时导出入口是否展示
  schedule: { type: Boolean, default: false },
  // 作为定时导出弹窗配置透传给 ScheduledExport 组件
  scheduleOption: { type: Array, default: () => [] },
  home_system: { type: Number, default: null },
  titleAppend: { type: String, default: "" }, // 导出标题后缀
  hasPermi: { type: String, default: "" }, // 权限
  getFormData: { type: Function, default: () => { } }, // 获取表单数据

  dynamic_fields: { type: Array, default: () => [] }, // 动态字段

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

// 弹窗标题：优先用 prop，未传时取 /export_config/one 返回的 config_name
const dialogConfigName = computed(() => props.config_name || form.value.config_name || "")

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
