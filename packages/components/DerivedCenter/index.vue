<template>
  <el-dialog v-model="visible" title="导出中心" width="950" draggable :close-on-click-modal="false" :close-on-press-escape="false" @close="handleClose" :z-index="2000">
    <div class="flex">
      <div class="left flex-1 mr-5">
        <div class="font-medium text-black">字段列表1</div>
        <div style="width: 432px" class="relative">
          <el-table :data="exportFields" height="600" style="width: 100%" highlight-current-row @selection-change="handleSelectionChange" border ref="tableRef">
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="field_name" label="字段" />
            <el-table-column prop="operation" label="排序" width="120">
              <template #default="scope">
                <el-link type="primary" :underline="false" @click="moveUp(scope.$index)">上移</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary" :underline="false" @click="moveDown(scope.$index)">下移</el-link>
              </template>
            </el-table-column>
          </el-table>

          <div
            class="dk-iconfont icon-ArrowUp bg-[var(--base-primary-dark-bg)] w-[22px] h-[22px] text-center text-[var(--base-color)] pt-[2px] absolute right-[6px] bottom-[16px]"
            style="border-radius: 50px; z-index: 999"
            @click="tableUp"
          ></div>
        </div>
      </div>
      <div class="right flex-1">
        <div class="flex items-center mb-[6px]" v-if="importBtnSlot">
          <el-tag type="danger">提示:</el-tag>
          <svg-icon icon-class="hint_line01"></svg-icon>导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
        </div>

        <div class="flex justify-between items-end mb-4">
          <slot v-if="importBtnSlot" :name="importBtnSlot"></slot>
          <template v-else>
            <div v-loading="loading">
              <el-button type="primary" @click="handleImport" :disabled="loading">导出</el-button>
            </div>

            <div class="flex text-xs text-gray-400 ml-5">
              <svg-icon icon-class="hint_line01"></svg-icon>导出结果在 <el-link type="primary" :underline="false" @click="navPersonal">个人中心</el-link> 查看
            </div>
          </template>
        </div>
        <div class="flex items-center mb-2"><el-input v-model="exportName" class="w-full" placeholder="请输入名称" /><el-button type="primary" plain @click="saveTemplate">保存模版</el-button></div>
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
      <!-- <div class="flex justify-center"> -->
      <el-button @click="handleClose">关闭</el-button>
      <!-- </div> -->
    </template>
  </el-dialog>

  <VScheduledExport ref="scheduledExportRef" :schedule-option="scheduleOption" />
</template>
<script setup name="DerivedCenter">
import { ref, onMounted } from "vue"

import { ElMessage, ElMessageBox } from "element-plus"
import GlobalConfig from "~/packages/config"
// import action from "@/utils/action.js"
import api from "./api"

const EMPTY_INDEX = ""
const SELECT_FIELD_MESSAGE = "至少勾选一条导出项"
const MODULE_ALL = "all"

const emit = defineEmits(["query", "callback"])
const props = defineProps({
  schedule: {
    type: Boolean,
    default: false,
  },
  scheduleOption: {
    type: Array,
    default: () => [],
  },
  home_system: {
    type: Number,
    default: 3,
  },
})

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
const userId = ref("")
const tagName = ref("")
const importBtnSlot = ref("")
const exportName = ref("")
const templates = ref([])

// 导出模板当前编辑态：只有选中过模板后，字段变更才展示“保存”入口。
const handleTemplateRow = ref({
  index: EMPTY_INDEX,
  change: false,
})

const getUser = () => window?.userInfo?.user || {}
const getUserName = () => getUser().realname || ""
const getFieldKey = (field = {}) => field?.field_key
const toArray = (value) => (Array.isArray(value) ? value : [])
const getSelectedFieldKeys = () => multipleSelection.value.map(getFieldKey).filter(Boolean)
const getCurrentFieldOrder = () => exportFields.value.map(getFieldKey).filter(Boolean)
const getSafeCondition = () => form.value.condition || {}
const getHomeSystem = () => GlobalConfig.derived?.home_system ?? props.home_system ?? 0
const isEditingTemplate = (index) => handleTemplateRow.value.index === String(index) && handleTemplateRow.value.change

const resetTemplateEditState = () => {
  handleTemplateRow.value.index = EMPTY_INDEX
  handleTemplateRow.value.change = false
}

const markTemplateChanged = () => {
  if (handleTemplateRow.value.index !== EMPTY_INDEX) {
    handleTemplateRow.value.change = true
  }
}

const validateSelectedFields = () => {
  if (multipleSelection.value.length > 0) return true
  ElMessage.error(SELECT_FIELD_MESSAGE)
  return false
}

const buildExportTitle = (name = "") => `${name || ""}${getUserName()}`

const buildExportRecordParams = (extra = {}) => ({
  ...form.value,
  ...extra,
  module: extra.module || tagName.value,
})

const getSortedSelectedFieldKeys = () => {
  const fieldOrderMap = new Map(getCurrentFieldOrder().map((key, index) => [key, index]))

  // 模板保存要求字段顺序跟随左侧列表，避免只保存勾选顺序导致恢复后排序错乱。
  return getSelectedFieldKeys().sort((a, b) => (fieldOrderMap.get(a) ?? 0) - (fieldOrderMap.get(b) ?? 0))
}

const open = async (item = {}) => {
  if (!item?.tag_name) {
    ElMessage.error("缺少必要参数")
    return
  }

  visible.value = true
  form.value.condition = item.condition ?? null
  tagName.value = item.tag_name
  importBtnSlot.value = item.importBtnSlot || ""

  try {
    await getTemplate()
  } catch (err) {
    console.error("[DerivedCenter] 获取模板失败:", err)
    ElMessage.error("获取模板失败")
  }
}

const getTemplate = async () => {
  try {
    const res = await getTemplateConfig(tagName.value)
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

const tableUp = () => {
  tableRef.value?.setScrollTop(0)
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

const moveField = (index, direction) => {
  const targetIndex = index + direction
  const isFirst = targetIndex < 0
  const isLast = targetIndex >= exportFields.value.length

  if (isFirst || isLast) {
    ElMessage.error(isFirst ? "已经是第一条，不可上移" : "已经是最后一条，不可下移")
    return
  }

  markTemplateChanged()
  const targetRow = exportFields.value[targetIndex]
  exportFields.value.splice(targetIndex, 1)
  exportFields.value.splice(index, 0, targetRow)
}

// 字段排序会影响模板后续导出的列顺序，因此移动后需要标记当前模板已变更。
const moveUp = (index) => {
  moveField(index, -1)
}

// 字段列表 下移
const moveDown = (index) => {
  moveField(index, 1)
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

onMounted(() => {
  userId.value = getUser().user_id
})

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
    const allFieldKeys = toArray(configData.export_field).map(getFieldKey).filter(Boolean)

    const params = buildExportRecordParams({
      config_id: configData.config_id,
      fields: type === MODULE_ALL ? allFieldKeys : getSelectedFieldKeys(),
      title: buildExportTitle(moduleName),
      module,
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
