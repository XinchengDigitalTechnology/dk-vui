import { computed, ref } from "vue"
import { ElMessage } from "element-plus"
import GlobalConfig from "~/packages/config"
import api from "./api.js"

export const useExportCenter = (props, emit) => {
  const loading = ref(false)
  const visible = ref(false)
  const tableRef = ref()
  const scheduledExportRef = ref()

  const form = ref({
    config_id: null,
    config_name: null,
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
  // condition 不在组件内缓存，每次从父组件获取最新表单条件。
  const getLatestCondition = () => props.getFormData?.() || {}
  // home_system 优先使用父组件传参；未传时再使用全局配置兜底。
  const getHomeSystem = () => props.home_system ?? GlobalConfig.derived?.home_system ?? 0
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

  const buildExportTitle = (name = "") => `${name || ""}${currentUser.value.realname || ""}${props.titleAppend}`

  // 导出记录参数只开放明确支持的覆盖项，避免调用方意外覆盖 condition、config_name 等内部字段。
  const buildExportRecordParams = ({ config_id, fields, title, tpl_id, tag_name } = {}) => {
    const params = {
      config_id: config_id ?? form.value.config_id,
      config_name: form.value.config_name,
      condition: getLatestCondition(),
      fields,
      title,
      module: tag_name || props.tag_name,
    }
    if (tpl_id !== undefined) params.tpl_id = tpl_id
    if (tag_name !== undefined) params.tag_name = tag_name
    return params
  }

  const getSortedSelectedFieldKeys = () => {
    const fieldOrderMap = new Map(getCurrentFieldOrder().map((key, index) => [key, index]))
    // 模板保存要求字段顺序跟随左侧列表，避免只保存勾选顺序导致恢复后排序错乱。
    return getSelectedFieldKeys().sort((a, b) => (fieldOrderMap.get(a) ?? 0) - (fieldOrderMap.get(b) ?? 0))
  }

  const getTemplateConfig = async (tagName) => {
    try {
      return await api.exportTemplateOne({
        home_system: getHomeSystem(),
        tag_name: tagName,
      })
    } catch (e) {
      console.error("[ExportCenter] 获取导出配置失败:", e)
      throw e
    }
  }

  const getTemplate = async () => {
    try {
      const res = await getTemplateConfig(props.tag_name)
      const { config_id = null, config_name = null, templates: tpls = [], export_field: fields = [] } = res?.data || {}

      form.value.config_id = config_id
      form.value.config_name = config_name
      templates.value = toArray(tpls)
      exportFields.value = toArray([...fields])
    } catch (e) {
      console.error("[ExportCenter] 获取模板配置失败:", e)
      throw e
    }
  }

  const open = async () => {
    if (!props?.tag_name) {
      ElMessage.error("缺少必要参数")
      return
    }

    visible.value = true

    try {
      await getTemplate()
    } catch (err) {
      console.error("[ExportCenter] 获取模板失败:", err)
      ElMessage.error("获取模板失败")
    }
  }

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
      console.error("[ExportCenter] 导出失败:", e)
      ElMessage.error("导出失败")
    } finally {
      loading.value = false
    }
  }

  const clearExportCenterData = () => {
    tableRef.value?.clearSelection()
    form.value.config_id = null
    form.value.config_name = null
    exportFields.value = []
    templates.value = []
    exportName.value = ""
    multipleSelection.value = []
    loading.value = false
    resetTemplateEditState()
  }

  const handleBeforeClose = (done) => {
    // 关闭弹窗前先释放导出字段、模板列表等大对象引用，避免弹窗关闭后继续持有旧数据。
    clearExportCenterData()

    if (typeof done === "function") {
      done()
      return
    }

    visible.value = false
  }

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
      console.error("[ExportCenter] 外部导出失败:", e)
      ElMessage.error("导出失败")
      throw e
    }
  }

  return {
    loading,
    visible,
    tableRef,
    scheduledExportRef,
    form,
    exportFields,
    multipleSelection,
    exportName,
    templates,
    handleTemplateRow,
    currentUser,
    userId,
    toArray,
    getSelectedFieldKeys,
    getLatestCondition,
    getTemplate,
    isEditingTemplate,
    resetTemplateEditState,
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
  }
}
