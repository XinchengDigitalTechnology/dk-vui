<template>
  <el-dialog
    v-model="visible"
    :title="`${formData.cron_id ? '编辑' : '新增'}定时导出任务`"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
    append-to-body
    draggable
    :destroy-on-close="true"
  >
    <div>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <!-- 导出模板 -->
        <el-form-item label="导出模板：">
          <span>{{ formData.templateName }}</span>
        </el-form-item>

        <!-- 导出时间 -->
        <el-form-item label="导出时间：" prop="cycle_field">
          <div class="flex gap-2">
            <el-select v-model="formData.cycle_field" placeholder="请选择" style="width: 120px" @change="handlePeriodChange">
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
            <el-form-item label="" prop="cycle_value">
              <VSelect v-model="formData.cycle_value" placeholder="请选择" style="width: 150px" :options="originOption?.[formData.cycle_field]" :fit-input-width="false"> </VSelect>
            </el-form-item>
            <el-form-item label="" prop="time_point">
              <el-time-picker v-model="formData.time_point" placeholder="时间" style="width: 120px" format="HH:mm" value-format="HH:mm"></el-time-picker>
            </el-form-item>
          </div>
        </el-form-item>

        <!-- 导出范围 -->
        <el-form-item label="导出范围：" prop="range_field">
          <div class="flex gap-2">
            <el-select v-model="formData.range_field" placeholder="-" style="width: 120px" disabled>
              <el-option :label="formData.range_field_desc" :value="formData.range_field" />
            </el-select>

            <el-form-item label="" prop="range_value" v-if="formData.range_field">
              <VSelect v-model="formData.range_value" placeholder="请选择" style="width: 240px" :options="originOption.range_value" :fit-input-width="false"> </VSelect>
            </el-form-item>

            <el-tooltip content="时间范围说明：前一周为上周一00:00:00至上周日23:59:59；前一月为上月1号00:00:00至上月最后一天23:59:59" placement="top">
              <div class="dk-iconfont icon-Warning"></div>
            </el-tooltip>
          </div>
        </el-form-item>

        <!-- 导出次数 -->
        <el-form-item :label="formData.cron_id ? '剩余次数：' : '导出次数：'" prop="limits" required>
          <div class="flex items-center gap-2">
            <el-input-number v-model="formData.limits" :min="1" :max="maxExportCount" controls-position="right" style="width: 150px" />
            <span>次</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">说明：定时任务执行次数，按月导出，最高6次；按周导出，最多24次</div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose" :disabled="loading">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from "vue"
import { ElMessage } from "element-plus"
import api from "./api"

const props = defineProps({
  scheduleOption: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(["refresh"])

const visible = ref(false)
const formRef = ref()
const loading = ref(false)

// 内存泄漏防护
let closeTimer = null
let isUnmounted = false
let abortController = null

// 初始表单数据
const getInitialFormData = () => ({
  cycle_field: "weekly",
  cycle_value: "",
  time_point: "",
  range_field: "",
  range_value: "",
  limits: 1,
})

// 表单数据
const formData = ref(getInitialFormData())

// 表单验证规则
const rules = {
  cycle_field: [{ required: true, message: "请选择导出周期", trigger: "change" }],
  cycle_value: [{ required: true, message: "请选择导出日期", trigger: "change" }],
  time_point: [{ required: true, message: "请选择导出时间", trigger: "change" }],

  range_value: [{ required: true, message: "请选择导出范围", trigger: "change" }],
  limits: [
    { required: true, message: "请输入导出次数", trigger: "blur" },
    { type: "number", min: 1, message: "导出次数至少为1次", trigger: "blur" },
  ],
}

// 最大导出次数
const maxExportCount = computed(() => {
  return formData.value.cycle_field === "weekly" ? 24 : 6
})

// 周期变化处理
const handlePeriodChange = () => {
  formData.value.cycle_value = ""
  formData.value.limits = 1
}

// 初始选项数据
const getInitialOptions = () => ({
  monthly: [],
  weekly: [],
  range_value: [],
})

const originOption = ref(getInitialOptions())

// 打开弹窗
const open = async (params = {}, type = "add") => {
  if (!window?.APP_GETEWAY?.dexh) {
    return ElMessage.error("请配置接口地址，内部组件，不允许直接调用")
  }

  // 取消之前未完成的请求
  abortController?.abort()
  abortController = new AbortController()

  visible.value = true
  loading.value = false

  try {
    const res = await api.drop_down(params.tpl_id)

    // 组件已销毁则不继续处理
    if (isUnmounted) return
    if (res?.data?.enums) {
      originOption.value.range_value = res.data.enums.range_value || []
      originOption.value.weekly = res.data.enums.cycle_weekly || []
      originOption.value.monthly = res.data.enums.cycle_monthly || []
    }

    // 初始化表单数据
    const isAdd = type === "add"
    if (isAdd) {
      // 新增模式
      formData.value = {
        ...getInitialFormData(),
        tpl_id: params.tpl_id,
        templateName: params.name,
        range_field: "",
        range_field_desc: "",
      }

      const { condition = {} } = res.data
      const range = props.scheduleOption.find((item) => condition?.[item.value]) || {}
      formData.value.range_field = range?.value || ""
      formData.value.range_field_desc = range?.label || ""
    } else {
      // 编辑模式 - 获取任务详情
      const detailRes = await api.exportCronDtl(params)
      if (detailRes?.data) {
        const detail = detailRes.data
        // 剩余次数 = 总次数 - 已执行次数
        detail.limits = detail.limits - (detail.exec_times || 0)
        formData.value = { ...detail, templateName: params?.tpl_name || params?.name }
      }
    }
  } catch (error) {
    // 忽略取消请求的错误
    if (error?.name === "AbortError" || isUnmounted) return
    console.error("[ScheduledExport] 获取下拉选项失败:", error)
  }
}

// 关闭弹窗
const handleClose = (needRefresh = false) => {
  // 清除之前的定时器，防止重复触发
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }

  // 取消未完成的请求
  abortController?.abort()
  abortController = null

  // 重置表单
  formRef.value?.resetFields()

  // 清空所有数据
  formData.value = getInitialFormData()
  originOption.value = getInitialOptions()
  loading.value = false

  // 延迟200ms关闭弹窗
  closeTimer = setTimeout(() => {
    // 组件已销毁则不继续处理
    if (isUnmounted) return

    visible.value = false
    closeTimer = null

    // 触发父组件刷新
    if (needRefresh) {
      emit("refresh")
    }
  }, 200)
}

// 确认提交
const handleConfirm = async () => {
  // 防止重复提交
  if (loading.value) return

  try {
    // 表单验证
    await formRef.value?.validate()

    loading.value = true

    // 准备提交参数
    const params = { ...formData.value }
    const isEdit = !!formData.value.cron_id

    // 新增时需要添加秒数
    if (!isEdit) {
      params.time_point = `${formData.value.time_point}:00`
    }

    // 调用对应的API
    const apiMethod = isEdit ? api.update : api.export_cron
    const res = await apiMethod(params)

    if (res?.code === 200 || res?.success) {
      ElMessage.success(`定时导出任务${isEdit ? "更新" : "创建"}成功`)

      handleClose(true)
    } else {
      loading.value = false
    }
  } catch (error) {
    loading.value = false
    // 表单验证失败不打印日志
    if (!error?.errors) {
      console.error("[ScheduledExport] 任务提交失败:", error)
    }
  }
}

// 组件卸载前清理
onBeforeUnmount(() => {
  isUnmounted = true

  // 清除定时器
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }

  // 取消未完成的请求
  abortController?.abort()
  abortController = null

  // 重置所有状态
  formData.value = getInitialFormData()
  originOption.value = getInitialOptions()
  loading.value = false
  visible.value = false
})

defineExpose({
  open,
})
</script>

<style scoped lang="scss">
.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.items-center {
  align-items: center;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>
