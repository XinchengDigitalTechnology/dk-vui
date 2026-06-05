import { ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
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

export const useExportTemplate = ({
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
}) => {
  const templateExportLoading = ref(false)

  // 选择导出模板
  const selectField = (item = {}, index) => {
    if (!tableRef.value) return

    // 切换模板前先清空旧选择，避免不同模板字段状态叠加。
    tableRef.value.clearSelection()

    // 按模板保存的字段 key 回显左侧字段勾选状态。
    const fieldKeys = toArray(item.fields)
    const fieldSet = new Set(fieldKeys)
    const selectedFields = exportFields.value.filter((field) => fieldSet.has(field.field_key))
    selectedFields.forEach((val) => {
      tableRef.value.toggleRowSelection(val, true)
    })

    // 模板字段顺序优先，未包含在模板中的字段保留在列表后方。
    const fieldOrder = new Map(fieldKeys.map((key, idx) => [key, idx]))
    exportFields.value = [...exportFields.value].sort((a, b) => {
      return (fieldOrder.get(a.field_key) ?? Infinity) - (fieldOrder.get(b.field_key) ?? Infinity)
    })

    handleTemplateRow.value.index = String(index)
    handleTemplateRow.value.change = false
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
        fields: getSortedSelectedFieldKeys(),
        condition: getLatestCondition(),
      })
      ElMessage.success(res.data.message)
      exportName.value = ""
      await getTemplate()
    } catch (e) {
      console.error("[ExportCenter] 保存模板失败:", e)
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
      // 保存后继续保留当前模板编辑上下文，后续字段变化时还能再次展示“保存”入口。
      handleTemplateRow.value.change = false
      await getTemplate()
    } catch (e) {
      console.error("[ExportCenter] 更新模板失败:", e)
      ElMessage.error("更新模板失败")
    }
  }

  const executeExportRow = async (row) => {
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
      console.error("[ExportCenter] 模板导出失败:", e)
      ElMessage.error("导出失败")
    } finally {
      templateExportLoading.value = false
    }
  }

  // 模板行导出加 500ms 防抖，避免连续点击重复创建导出记录。
  const debouncedExportRow = createDebouncedAsync(executeExportRow)
  const exportRow = (row) => {
    if (templateExportLoading.value) return Promise.resolve()

    templateExportLoading.value = true
    return debouncedExportRow.run(row)
  }

  const cancelPendingTemplateExport = () => {
    debouncedExportRow.cancel()
    templateExportLoading.value = false
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
      if (e === "cancel" || e === "close") return
      console.error("[ExportCenter] 删除模板失败:", e)
      ElMessage.error("删除模板失败")
    }
  }

  // 打开定时导出弹窗
  const openScheduledExport = async (row) => {
    scheduledExportRef.value?.open({ ...row, condition: getLatestCondition() })
  }

  return {
    templateExportLoading,
    selectField,
    saveTemplate,
    updateTemplate,
    exportRow,
    cancelPendingTemplateExport,
    exportDelete,
    openScheduledExport,
  }
}
