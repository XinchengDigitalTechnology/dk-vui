<template>
  <el-dialog v-model="visible" title="导出中心" width="950" draggable :close-on-click-modal="false" :close-on-press-escape="false" @close="close" :z-index="2000">
    <div class="flex">
      <div class="left flex-1 mr-5">
        <div class="font-medium text-black">字段列表1</div>
        <div style="width: 432px" class="relative">
          <el-table :data="export_field" height="600" style="width: 100%" highlight-current-row @selection-change="handleSelectionChange" border ref="tableRef">
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="field_name" label="字段" />
            <el-table-column prop="operation" label="排序" width="120">
              <template #default="scope">
                <el-link type="primary" :underline="false" @click="moveUp(scope.$index, scope.row)">上移</el-link>
                <el-divider direction="vertical" />
                <el-link type="primary" :underline="false" @click="moveDown(scope.$index, scope.row)">下移</el-link>
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
                <el-link type="primary" v-if="handleTemplateRow.index == $index && handleTemplateRow.change" @click="updateTemplate(row)">保存</el-link>
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
              <template v-if="scope.row.creator_id == user_id">
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
      <el-button @click="close">关闭</el-button>
      <!-- </div> -->
    </template>
  </el-dialog>

  <VScheduledExport ref="scheduledExportRef" :scheduleOption="scheduleOption" />
</template>
<script setup name="DerivedCenter">
import { reactive, toRefs, ref, onMounted } from "vue"

import { ElMessage, ElMessageBox } from "element-plus"
// import action from "@/utils/action.js"
import api from "./api"

// const { proxy } = getCurrentInstance()
const emits = defineEmits(["query", "callback"])
const props = defineProps({
  home_system: {
    type: Number,
    default: 3,
  },
  schedule: {
    type: Boolean,
    default: false,
  },
  scheduleOption: {
    type: Array,
    default: () => [],
  },
})
const loading = ref(false)

const data = reactive({
  visible: false,
  form: {
    config_id: null,
    config_name: null,
    condition: null,
  },

  export_field: [], // 字段列表
  multipleSelection: [], // 字段列表 选项

  user_id: "", // 当前操作人
  tag_name: "", // 导出模块 key

  exportName: "", // 保存 导出模板名称
  templates: [], // 导出模板 列表
})

const tagNamesOpt = ref({})
const { visible, form, tag_name, user_id, export_field, multipleSelection, exportName, templates } = toRefs(data)
const importBtnSlot = ref("")
const open = async (item) => {
  if (!item?.tag_name) {
    ElMessage.error("缺少必要参数")
    return
  }
  visible.value = true
  form.value.condition = item.condition
  tag_name.value = item.tag_name
  importBtnSlot.value = item.importBtnSlot
  try {
    await getTemplate()
  } catch (err) {
    console.error("获取模板失败:", err)
    ElMessage.error("获取模板失败")
  }
}
const getTemplate = async () => {
  try {
    const res = await getTemplateConfig(tag_name.value)
    const { config_id, config_name, templates: tpls, export_field: fields } = res.data
    form.value.config_id = config_id
    form.value.config_name = config_name
    templates.value = tpls
    export_field.value = fields
  } catch (e) {
    console.error("获取模板配置失败:", e)
    throw e
  }
}

const tableRef = ref()
const tableUp = () => {
  if (tableRef.value) {
    tableRef.value.setScrollTop(0)
  }
}
// 导出模板 当前操作行
const handleTemplateRow = ref({
  index: "",
  change: false,
})

const tabRowClick = () => {
  // 表格行点击事件
}
// 选择导出模板
const selectField = (item, index) => {
  if (!tableRef.value) return

  tableRef.value.clearSelection()

  // 创建字段集合以提高查找性能
  const fieldSet = new Set(item.fields)
  const selectedFields = export_field.value.filter((v) => fieldSet.has(v.field_key))
  selectedFields.forEach((val) => {
    tableRef.value.toggleRowSelection(val, true)
  })

  // 优化排序逻辑
  const fieldOrder = new Map(item.fields.map((key, idx) => [key, idx]))
  export_field.value = export_field.value.sort((a, b) => {
    return (fieldOrder.get(a.field_key) ?? Infinity) - (fieldOrder.get(b.field_key) ?? Infinity)
  })

  handleTemplateRow.value.index = String(index)
  handleTemplateRow.value.change = false
}

// 字段列表 选项变动
const handleSelectionChange = (val) => {
  multipleSelection.value = val
  if (handleTemplateRow.value.index) {
    handleTemplateRow.value.change = true
  }
}
// 字段列表 上移
const moveUp = (index, row) => {
  if (index > 0) {
    if (handleTemplateRow.value.index) {
      handleTemplateRow.value.change = true
    }
    const upDate = export_field.value[index - 1]
    export_field.value.splice(index - 1, 1)
    export_field.value.splice(index, 0, upDate)
  } else {
    ElMessage.error("已经是第一条，不可上移")
  }
}
// 字段列表 下移
const moveDown = (index, row) => {
  if (index + 1 === export_field.value.length) {
    ElMessage.error("已经是最后一条，不可下移")
  } else {
    if (handleTemplateRow.value.index) {
      handleTemplateRow.value.change = true
    }
    const downDate = export_field.value[index + 1]
    export_field.value.splice(index + 1, 1)
    export_field.value.splice(index, 0, downDate)
  }
}

const handleImport = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.error("至少勾选一条导出项")
    return
  }

  loading.value = true
  const params = {
    ...form.value,
    fields: multipleSelection.value.map((i) => i.field_key),
    title: `${form.value.config_name}${window.userInfo.user.realname}`,
    module: tag_name.value,
  }

  try {
    const res = await api.exportRord(params)
    ElMessage.success(res.message)
    emits("callback")
  } catch (e) {
    console.error("导出失败:", e)
    ElMessage.error("导出失败")
  } finally {
    loading.value = false
  }
}

// 保存 导出模版
const saveTemplate = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.error("至少勾选一条导出项")
    return
  }
  if (!exportName.value.trim()) {
    ElMessage.error("请输入名称")
    return
  }
  if (templates.value.some((v) => v.name === exportName.value)) {
    ElMessage.error("保存模板的名称不可以重复")
    return
  }

  const fields = multipleSelection.value.map((i) => i.field_key)
  try {
    const res = await api.exporttpl({
      config_id: form.value.config_id,
      name: exportName.value.trim(),
      fields,
      condition: form.value.condition || {},
    })
    ElMessage.success(res.data.message)
    exportName.value = ""
    await getTemplate()
  } catch (e) {
    console.error("保存模板失败:", e)
    ElMessage.error("保存模板失败")
  }
}
// 编辑 导出模版
const updateTemplate = async (row) => {
  if (multipleSelection.value.length === 0) {
    ElMessage.error("至少勾选一条导出项")
    return
  }

  const fieldSort = export_field.value.map((v) => v.field_key)
  const fieldOrderMap = new Map(fieldSort.map((key, idx) => [key, idx]))

  const fields = multipleSelection.value.map((i) => i.field_key).sort((a, b) => (fieldOrderMap.get(a) ?? 0) - (fieldOrderMap.get(b) ?? 0))

  const params = {
    id: row.tpl_id,
    name: row.name,
    fields,
  }

  try {
    const res = await api.exportTemplateUpdate(params)
    ElMessage.success(res.data.message)
    handleTemplateRow.value.index = ""
    handleTemplateRow.value.change = false
    await getTemplate()
  } catch (e) {
    console.error("更新模板失败:", e)
    ElMessage.error("更新模板失败")
  }
}

// 导出模板 导出行配置
const tplId = ref("")
const exportRow = async (row) => {
  const title = row.name + window.userInfo.user.realname
  try {
    const res = await api.exportRord({
      tpl_id: row.tpl_id,
      ...form.value,
      title,
      fields: [],
      module: tag_name.value, // 导出模版  默认第一个
    })
    ElMessage.success(res.message)
    tplId.value = row.tpl_id
    emits("callback")
  } catch (e) {
    throw Error(e)
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
const scheduledExportRef = ref()
// 打开定时导出弹窗
const openScheduledExport = async (row) => {
  scheduledExportRef.value.open({ ...row, condition: form.value.condition || {} })
}

onMounted(() => {
  user_id.value = window.userInfo?.user?.user_id
})

const close = () => {
  exportName.value = ""
  handleTemplateRow.value.index = ""
  handleTemplateRow.value.change = false

  visible.value = false
}

// 获取 导出配置
const getTemplateConfig = async (tagName) => {
  try {
    return await api.exportTemplateOne({
      home_system: props.home_system,
      tag_name: tagName,
    })
  } catch (e) {
    console.error("获取导出配置失败:", e)
    throw e
  }
}
// 组件外部调用导出
const outerExport = async (module, moduleName, type = "") => {
  try {
    const templateRes = await getTemplateConfig(module)

    const params = {
      ...form.value,
      config_id: templateRes.data.config_id,
      fields: type === "all" ? templateRes.data.export_field.map((i) => i.field_key) : multipleSelection.value?.map((i) => i.field_key) || [],
      title: `${moduleName}${window.userInfo.user.realname}`,
      module,
    }

    const res = await api.exportRord(params)
    ElMessage.success(res.message || "导出成功")
    return res
  } catch (e) {
    console.error("外部导出失败:", e)
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
