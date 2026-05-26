<template>
  {{ hasPermi }}
  <VButton type="" @click="open" v-hasPermi="[hasPermi]">
    <div class="dk-iconfont icon-Upload"></div>
      导出
  </VButton>

  <el-dialog v-model="visible" title="导出中心" width="950" draggable :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose" :z-index="2000">
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
          <slot v-if="hasImportBtnSlot" name="importBtn"></slot>
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

        <el-table :data="templates" style="width: 100%" highlight-current-row border @row-click="tabRowClick">
          <el-table-column prop="name" label="名称">
            <template #default="{ row, $index }">
              <div class="flex">
                <div class="flex-1">
                  <el-link type="primary" :underline="false" @click="selectField(row, $index)">{{ row.name }}</el-link>
                </div>
                <el-link type="primary" v-if="isEditingTemplate($index)" @click="updateTemplate(row)">保存</el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="operation" label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" link @click="exportRow(scope.row)">导出</el-button>
              <span v-if="schedule">
                <el-divider direction="vertical" />
                <el-button type="primary" link @click="openScheduledExport(scope.row)">定时导出</el-button>
              </span>
              <template v-if="scope.row.creator_id == userId">
                <el-divider direction="vertical" />
                <el-button type="danger" link @click="exportDelete(scope.row)">删除</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>

  <ScheduledExport ref="scheduledExportRef" :schedule-option="scheduleOption" />
</template>
<script setup name="DerivedCenter">
import { ref, computed, useSlots } from "vue"

import { ElMessage, ElMessageBox } from "element-plus"
import GlobalConfig from "~/packages/config"
// import action from "@/utils/action.js"
import api from "./api.js"
import ExportFieldList from "./ExportFieldList.vue"
import ScheduledExport from "../ScheduledExport/index.vue"

const EMPTY_INDEX = ""

const emit = defineEmits(["query", "callback"])
const props = defineProps({
  // 控制定时导出入口是否展示
  schedule: {
    type: Boolean,
    default: false,
  },
  // 作为定时导出弹窗配置透传给 ScheduledExport 组件
  scheduleOption: {
    type: Array,
    default: () => [],
  },
  home_system: {
    type: Number,
    default: 3,
  },
  tag_name: { type: String, default: "" }, // 模块名称
  hasPermi: { type: String, default: "" }, // 权限
  getFormData: { type: Function, default: () => {} }, // 获取表单数据
})

const slots = useSlots()
const hasImportBtnSlot = computed(() => Boolean(slots.importBtn))

const loading = ref(false)
const visible = ref(false)
const tableRef = ref()
const scheduledExportRef = ref()

const form = ref({
  config_id: null,
  config_name: null,
  condition: null,
})
const exportFields = ref([])
const multipleSelection = ref([])

const exportName = ref("")
const templates = ref([])

// 导出模板当前编辑态：只有选中过模板后，字段变更才展示“保存”入口。
const handleTemplateRow = ref({
  index: "",
  change: false,
})
// 从全局用户信息派生当前用户，userId 用于判断模板删除权限。
const currentUser = computed(() => window?.userInfo?.user || {})
const userId = computed(() => currentUser.value.user_id)

// 统一兜底接口返回值，避免模板字段、模板列表为空时后续数组操作报错。
const toArray = (value) => (Array.isArray(value) ? value : [])
// 导出和保存模板只需要字段 key，顺序由当前左侧字段列表决定。
const getSelectedFieldKeys = () => multipleSelection.value.map((field) => field?.field_key).filter(Boolean)
const getCurrentFieldOrder = () => exportFields.value.map((field) => field?.field_key).filter(Boolean)
// 条件和系统来源允许外部不传，统一在构造接口参数时兜底。
const getSafeCondition = () => form.value.condition || {}
const getHomeSystem = () => GlobalConfig.derived?.home_system ?? props.home_system ?? 0
// 只有选中过模板且字段发生变化时，右侧模板行才展示“保存”。
const isEditingTemplate = (index) => handleTemplateRow.value.index === String(index) && handleTemplateRow.value.change

const resetTemplateEditState = () => {
  handleTemplateRow.value.index = ""
  handleTemplateRow.value.change = false
}

// 选中过模板后，字段勾选或排序变化时标记为可保存状态。
const markTemplateChanged = () => {
  if (handleTemplateRow.value.index !== "") {
    handleTemplateRow.value.change = true
  }
}

// 导出和保存模板前必须至少选择一个字段。
const validateSelectedFields = () => {
  if (multipleSelection.value.length > 0) return true
  ElMessage.error("至少勾选一条导出项")
  return false
}

const buildExportTitle = (name = "") => `${name || ""}${currentUser.value.realname || ""}`

const buildExportRecordParams = (extra = {}) => ({
  ...form.value,
  ...extra,
  module: extra.tag_name || props.tag_name,
})

const getSortedSelectedFieldKeys = () => {
  const fieldOrderMap = new Map(getCurrentFieldOrder().map((key, index) => [key, index]))

  // 模板保存要求字段顺序跟随左侧列表，避免只保存勾选顺序导致恢复后排序错乱。
  return getSelectedFieldKeys().sort((a, b) => (fieldOrderMap.get(a) ?? 0) - (fieldOrderMap.get(b) ?? 0))
}

const open = async () => {
  if (!props?.tag_name) {
    ElMessage.error("缺少必要参数")
    return
  }

  visible.value = true
  form.value.condition = props.getFormData()
  console.log(form.value.condition)

  try {
    await getTemplate()
  } catch (err) {
    console.error("[DerivedCenter] 获取模板失败:", err)
    ElMessage.error("获取模板失败")
  }
}

const getTemplate = async () => {
  try {
    const res = await getTemplateConfig(props.tag_name)
    const { config_id = null, config_name = null, templates: tpls = [], export_field: fields = [] } = res?.data || {}

    form.value.config_id = config_id
    form.value.config_name = config_name
    templates.value = toArray(tpls)
    exportFields.value = toArray(fields)
  } catch (e) {
    console.error("[DerivedCenter] 获取模板配置失败:", e)
    throw e
  }
}

const tabRowClick = () => {
  // 表格行点击事件
}

// 选择导出模板
const selectField = (item = {}, index) => {
  if (!tableRef.value) return

  tableRef.value.clearSelection()

  const fieldKeys = toArray(item.fields)
  const fieldSet = new Set(fieldKeys)
  const selectedFields = exportFields.value.filter((field) => fieldSet.has(field.field_key))
  selectedFields.forEach((val) => {
    tableRef.value.toggleRowSelection(val, true)
  })

  const fieldOrder = new Map(fieldKeys.map((key, idx) => [key, idx]))
  exportFields.value = [...exportFields.value].sort((a, b) => {
    return (fieldOrder.get(a.field_key) ?? Infinity) - (fieldOrder.get(b.field_key) ?? Infinity)
  })

  handleTemplateRow.value.index = String(index)
  handleTemplateRow.value.change = false
}

// 字段列表 选项变动
const handleSelectionChange = (val) => {
  multipleSelection.value = toArray(val)
  markTemplateChanged()
}

const handleFieldsChange = (fields) => {
  exportFields.value = toArray(fields)
  markTemplateChanged()
}

const handleImport = async () => {
  if (!validateSelectedFields() || loading.value) return

  loading.value = true
  const params = buildExportRecordParams({
    fields: getSelectedFieldKeys(),
    title: buildExportTitle(form.value.config_name),
  })

  try {
    const res = await api.exportRord(params)
    ElMessage.success(res.message)
    emit("callback")
  } catch (e) {
    console.error("[DerivedCenter] 导出失败:", e)
    ElMessage.error("导出失败")
  } finally {
    loading.value = false
  }
}

// 保存 导出模版
const saveTemplate = async () => {
  if (!validateSelectedFields()) return

  const templateName = exportName.value.trim()
  if (!templateName) {
    ElMessage.error("请输入名称")
    return
  }
  if (templates.value.some((v) => v.name === templateName)) {
    ElMessage.error("保存模板的名称不可以重复")
    return
  }

  try {
    const res = await api.exporttpl({
      config_id: form.value.config_id,
      name: templateName,
      fields: getSelectedFieldKeys(),
      condition: getSafeCondition(),
    })
    ElMessage.success(res.data.message)
    exportName.value = ""
    await getTemplate()
  } catch (e) {
    console.error("[DerivedCenter] 保存模板失败:", e)
    ElMessage.error("保存模板失败")
  }
}

// 编辑 导出模版
const updateTemplate = async (row) => {
  if (!validateSelectedFields()) return

  const params = {
    id: row.tpl_id,
    name: row.name,
    fields: getSortedSelectedFieldKeys(),
  }

  try {
    const res = await api.exportTemplateUpdate(params)
    ElMessage.success(res.data.message)
    resetTemplateEditState()
    await getTemplate()
  } catch (e) {
    console.error("[DerivedCenter] 更新模板失败:", e)
    ElMessage.error("更新模板失败")
  }
}

const exportRow = async (row) => {
  try {
    const res = await api.exportRord(
      buildExportRecordParams({
        tpl_id: row.tpl_id,
        title: buildExportTitle(row.name),
        fields: [],
      }),
    )
    ElMessage.success(res.message)
    emit("callback")
  } catch (e) {
    throw e
  }
}

const exportDelete = async (row) => {
  try {
    await ElMessageBox.confirm("删除该导出模板将同步删除模板的定时导出任务，是否确认删除？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    const res = await api.exportTemplateDelete(row.tpl_id)
    ElMessage.success(res.data.message)
    await getTemplate()
  } catch (e) {
    if (e === "cancel") return
    // console.error("删除模板失败:", e)
    // ElMessage.error("删除模板失败")
  }
}

// 打开定时导出弹窗
const openScheduledExport = async (row) => {
  scheduledExportRef.value?.open({ ...row, condition: getSafeCondition() })
}

const handleClose = () => {
  exportName.value = ""
  multipleSelection.value = []
  resetTemplateEditState()

  visible.value = false
}

// 获取 导出配置
const getTemplateConfig = async (tagName) => {
  try {
    return await api.exportTemplateOne({
      home_system: getHomeSystem(),
      tag_name: tagName,
    })
  } catch (e) {
    console.error("[DerivedCenter] 获取导出配置失败:", e)
    throw e
  }
}

// 组件外部调用导出
const outerExport = async (module, moduleName, type = "") => {
  try {
    const templateRes = await getTemplateConfig(module)
    const configData = templateRes?.data || {}
    const allFieldKeys = toArray(configData.export_field)
      .map((field) => field?.field_key)
      .filter(Boolean)

    const params = buildExportRecordParams({
      config_id: configData.config_id,
      fields: type === "all" ? allFieldKeys : getSelectedFieldKeys(),
      title: buildExportTitle(moduleName),
      tag_name: module,
    })

    const res = await api.exportRord(params)
    ElMessage.success(res.message || "导出成功")
    return res
  } catch (e) {
    console.error("[DerivedCenter] 外部导出失败:", e)
    ElMessage.error("导出失败")
    throw e
  }
}

// 跳转 个人中心
const navPersonal = () => {
  // action.setGlobalState({
  //   changeMicoTabsPath: {
  //     path: "/user/profile",
  //     type: "push",
  //   },
  // })
}
defineExpose({
  open,
  outerExport,
})
</script>
