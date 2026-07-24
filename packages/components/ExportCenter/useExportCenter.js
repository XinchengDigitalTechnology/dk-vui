import { computed, ref } from "vue"
import { ElMessage } from "element-plus"
import GlobalConfig from "~/packages/config"
import api from "./api.js"

const EXPORT_DEBOUNCE_DELAY = 500

/**
 * 创建异步方法防抖包装器。
 * 连续触发时会取消上一次未执行的调用，只在 delay 后执行最后一次。
 * @param {Function} fn - 需要防抖的异步方法
 * @param {number} delay - 防抖等待时间
 * @returns {{ run: Function, cancel: Function }}
 */
const createDebouncedAsync = (fn, delay = EXPORT_DEBOUNCE_DELAY) => {
  let timer = null
  let resolvePending = null

  const cancel = () => {
    if (!timer) return

    clearTimeout(timer)
    timer = null
    resolvePending?.()
    resolvePending = null
  }

  const run = (...args) => {
    cancel()

    return new Promise((resolve, reject) => {
      resolvePending = resolve
      timer = setTimeout(async () => {
        timer = null
        resolvePending = null

        try {
          resolve(await fn(...args))
        } catch (e) {
          reject(e)
        }
      }, delay)
    })
  }

  return { run, cancel }
}

export const useExportCenter = (props, emit) => {
  const loading = ref(false)
  const visible = ref(false)
  const tableRef = ref()
  const scheduledExportRef = ref()
  let templateLoadVersion = 0

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

  /**
   * 将接口返回值统一兜底成数组，避免模板字段、模板列表为空时后续数组操作报错。
   * @param {*} value - 需要转换的值
   * @returns {Array}
   */
  const toArray = (value) => (Array.isArray(value) ? value : [])

  /**
   * 获取当前勾选字段的 field_key。
   * 导出和保存模板只需要字段 key，顺序由当前左侧字段列表决定。
   * @returns {Array<string>}
   */
  const getSelectedFieldKeys = () => multipleSelection.value.map((field) => field?.field_key).filter(Boolean)

  /**
   * 获取左侧字段列表当前排序，用于保存模板时稳定字段顺序。
   * @returns {Array<string>}
   */
  const getCurrentFieldOrder = () => exportFields.value.map((field) => field?.field_key).filter(Boolean)

  /**
   * 获取父页面最新查询条件。
   * condition 不在组件内缓存，避免导出时使用旧搜索条件。
   * @returns {Object}
   */
  const getLatestCondition = () => props.getFormData?.() || {}

  /**
   * 获取当前导出配置所属系统。
   * home_system 优先使用父组件传参；未传时再使用全局配置兜底。
   * @returns {number}
   */
  const getHomeSystem = () => props.home_system ?? GlobalConfig.derived?.home_system ?? 0

  /**
   * 判断模板行是否处于可保存的编辑态。
   * 只有选中过模板且字段发生变化时，右侧模板行才展示“保存”。
   * @param {number|string} index - 模板行索引
   * @returns {boolean}
   */
  const isEditingTemplate = (index) => handleTemplateRow.value.index === String(index) && handleTemplateRow.value.change

  /**
   * 重置模板编辑态，关闭弹窗或重新加载数据时使用。
   */
  const resetTemplateEditState = () => {
    handleTemplateRow.value.index = ""
    handleTemplateRow.value.change = false
  }

  /**
   * 标记当前模板字段已变化。
   * 只有在用户先选中过模板后，字段勾选或排序变化才会触发模板行“保存”入口。
   */
  const markTemplateChanged = () => {
    if (handleTemplateRow.value.index !== "") {
      handleTemplateRow.value.change = true
    }
  }

  /**
   * 校验当前是否至少选择一个导出字段。
   * 导出和保存模板前必须通过该校验。
   * @returns {boolean}
   */
  const validateSelectedFields = () => {
    if (multipleSelection.value.length > 0) return true
    ElMessage.error("至少勾选一条导出项")
    return false
  }

  /**
   * 生成导出标题。
   * 标题规则：业务名称 + 当前用户真实姓名 + 父组件传入的标题后缀。
   * @param {string} name - 业务名称或模板名称
   * @returns {string}
   */
  const buildExportTitle = (name = "") => `${name || ""}${currentUser.value.realname || ""}${props.titleAppend}`

  /**
   * 构造新增导出记录接口参数。
   * 只开放明确支持的覆盖项，避免调用方意外覆盖 condition、config_name 等内部字段。
   * @param {Object} options - 导出参数覆盖项
   * @param {string|number} [options.config_id] - 导出配置 ID，不传时使用当前配置
   * @param {Array<string>} [options.fields] - 导出字段 key 列表
   * @param {string} [options.title] - 导出标题
   * @param {string|number} [options.tpl_id] - 模板 ID，模板导出时使用
   * @param {string} [options.tag_name] - 模块标识，外部导出时可覆盖当前模块
   * @returns {Object}
   */
  const buildExportRecordParams = ({ config_id, fields, title, tpl_id, tag_name } = {}) => {
    const params = {
      config_id: config_id ?? form.value.config_id,
      config_name: form.value.config_name,
      condition: getLatestCondition(),
      fields,
      title,
      module: GlobalConfig.derived?.module_name || tag_name || props.tag_name,
    }
    if (tpl_id !== undefined) params.tpl_id = tpl_id
    if (tag_name !== undefined) params.tag_name = tag_name
    return params
  }

  /**
   * 获取按当前字段列表顺序排序后的已选字段 key。
   * 模板保存要求字段顺序跟随左侧列表，避免只保存勾选顺序导致恢复后排序错乱。
   * @returns {Array<string>}
   */
  const getSortedSelectedFieldKeys = () => {
    const fieldOrderMap = new Map(getCurrentFieldOrder().map((key, index) => [key, index]))
    return getSelectedFieldKeys().sort((a, b) => (fieldOrderMap.get(a) ?? 0) - (fieldOrderMap.get(b) ?? 0))
  }

  /**
   * 将父组件传入的默认导出字段放到 fields 最前面。
   * 已选字段中若包含相同 key，会去重，避免重复提交。
   * @param {Array<string>} fields - 当前已选字段 key 列表
   * @returns {Array<string>}
   */
  const prependDefaultFields = (fields = []) => {
    const defaults = toArray(props.defaultFields).filter(Boolean)
    if (!defaults.length) return fields

    const defaultSet = new Set(defaults)
    return [...defaults, ...fields.filter((key) => !defaultSet.has(key))]
  }

  /**
   * 按模块标识获取后端导出配置。
   * @param {string} tagName - 业务模块标识
   * @returns {Promise<Object>}
   */
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

  /**
   * 加载当前模块的导出配置、字段列表和模板列表。
   * 打开弹窗、保存模板、删除模板后都会调用它刷新页面状态。
   * @returns {Promise<void>}
   */
  const getTemplate = async () => {
    const loadVersion = ++templateLoadVersion

    try {
      const res = await getTemplateConfig(props.tag_name)
      if (!visible.value || loadVersion !== templateLoadVersion) return

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

  /**
   * 打开导出中心弹窗，并初始化当前模块的字段和模板配置。
   * 缺少 tag_name 时会阻止打开并提示错误。
   * @returns {Promise<void>}
   */
  const open = async () => {
    if (!props?.tag_name) {
      ElMessage.error("缺少必要参数")
      return
    }

    // 打开前给业务方一次拦截机会；未传或返回 true 时继续打开，返回 false 时阻止打开。
    const canOpen = props.restriction ? await props.restriction() : true
    if (canOpen === false) return

    visible.value = true

    try {
      await getTemplate()
    } catch (err) {
      console.error("[ExportCenter] 获取模板失败:", err)
      ElMessage.error("获取模板失败")
    }
  }

  /**
   * 处理左侧字段表格勾选变化。
   * @param {Array<Object>} val - Element Plus 表格返回的选中行
   */
  const handleSelectionChange = (val) => {
    multipleSelection.value = toArray(val)
    markTemplateChanged()
  }

  /**
   * 处理左侧字段列表排序变化。
   * @param {Array<Object>} fields - 排序后的字段列表
   */
  const handleFieldsChange = (fields) => {
    exportFields.value = toArray(fields)
    markTemplateChanged()
  }

  const executeImport = async () => {
    const params = buildExportRecordParams({
      fields: prependDefaultFields(getSelectedFieldKeys()),
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

  /**
   * 使用当前勾选字段发起即时导出。
   * 方法带 500ms 防抖，连续点击只执行最后一次导出。
   * 成功后触发 callback 事件，父页面可据此刷新列表或提示用户。
   * @returns {Promise<void>}
   */
  const importDebounce = createDebouncedAsync(executeImport)
  const handleImport = () => {
    if (!validateSelectedFields() || loading.value) return

    loading.value = true
    return importDebounce.run()
  }

  /**
   * 清空导出中心内部状态。
   * 关闭弹窗时释放字段、模板、选择状态等大对象引用，避免下次打开复用旧数据。
   */
  const clearExportCenterData = () => {
    templateLoadVersion += 1
    importDebounce.cancel()
    outerExportDebounce.cancel()
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

  /**
   * 弹窗关闭前的统一处理。
   * 兼容 Element Plus before-close 传入 done 回调，以及 footer 按钮直接调用两种场景。
   * @param {Function} [done] - Element Plus 弹窗关闭回调
   */
  const handleBeforeClose = (done) => {
    // 关闭弹窗前先释放导出字段、模板列表等大对象引用，避免弹窗关闭后继续持有旧数据。
    clearExportCenterData()

    if (typeof done === "function") {
      done()
      return
    }

    visible.value = false
  }

  const executeOuterExport = async (module, moduleName, type = "") => {
    try {
      const templateRes = await getTemplateConfig(module)
      const configData = templateRes?.data || {}
      const allFieldKeys = toArray(configData.export_field)
        .map((field) => field?.field_key)
        .filter(Boolean)

      const params = buildExportRecordParams({
        config_id: configData.config_id,
        condition: getLatestCondition(),
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
    } finally {
      loading.value = false
    }
  }

  /**
   * 给 exportButton 插槽使用的外部导出方法。
   * 方法带 500ms 防抖，连续点击只执行最后一次导出。
   * 支持导出指定模块的全部字段，或使用当前弹窗中已勾选的字段。
   * @param {string} module - 要导出的模块标识
   * @param {string} moduleName - 用于拼接导出标题的模块名称
   * @param {string} [type] - 传入 "all" 时导出指定模块全部字段
   * @returns {Promise<Object>} 导出接口响应
   */
  const outerExportDebounce = createDebouncedAsync(executeOuterExport)
  const outerExport = (module, moduleName, type = "") => {
    if (loading.value) return Promise.resolve()

    loading.value = true
    return outerExportDebounce.run(module, moduleName, type)
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
    prependDefaultFields,
    open,
    handleSelectionChange,
    handleFieldsChange,
    handleImport,
    handleBeforeClose,
    outerExport,
  }
}
