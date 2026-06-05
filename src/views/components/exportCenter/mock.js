import { onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref } from "vue"
import { ElMessage } from "element-plus"

const exportFields = [
  { field_key: "order_no", field_name: "订单号" },
  { field_key: "customer_name", field_name: "客户名称" },
  { field_key: "amount", field_name: "订单金额" },
  { field_key: "status", field_name: "订单状态" },
  { field_key: "create_time", field_name: "创建时间" },
  { field_key: "pay_time", field_name: "付款时间" },
]

export const useExportCenterDemo = () => {
  const form = reactive({
    keyword: "DK-202606",
    status: "paid",
    create_time: ["2026-06-01", "2026-06-30"],
  })

  const scheduleOption = [
    { label: "创建时间", value: "create_time" },
    { label: "付款时间", value: "pay_time" },
  ]

  const demoTemplates = ref([
    {
      tpl_id: 1001,
      name: "常用订单字段",
      fields: ["order_no", "customer_name", "amount"],
      creator_id: 1,
    },
    {
      tpl_id: 1002,
      name: "财务字段",
      fields: ["order_no", "amount", "pay_time", "status"],
      creator_id: 2,
    },
  ])

  const getFormData = () => ({ ...form })

  const handleExportCallback = () => {
    ElMessage.success("导出回调已触发")
  }

  const getTemplateResponse = () => ({
    code: 200,
    data: {
      config_id: 9001,
      config_name: "示例订单",
      export_field: exportFields,
      templates: demoTemplates.value,
    },
  })

  const mockHttpRequest = async ({ url, method = "get", data, params }) => {
    console.log("[ExportCenter demo request]", method, url, data || params)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const lowerMethod = method.toLowerCase()

    if (url === "/export_config/one" && lowerMethod === "get") {
      return getTemplateResponse()
    }

    if (url === "/export_record" && lowerMethod === "post") {
      return {
        code: 200,
        message: `已创建导出任务：${data?.title || "示例导出"}`,
      }
    }

    if (url === "/export_tpl" && lowerMethod === "post") {
      demoTemplates.value = [
        {
          tpl_id: Date.now(),
          name: data.name,
          fields: data.fields,
          creator_id: 1,
        },
        ...demoTemplates.value,
      ]
      return {
        code: 200,
        data: { message: "模板保存成功" },
      }
    }

    if (url.startsWith("/export_tpl/") && lowerMethod === "put") {
      demoTemplates.value = demoTemplates.value.map((item) => {
        if (item.tpl_id !== data.id) return item
        return {
          ...item,
          name: data.name,
          fields: data.fields,
        }
      })
      return {
        code: 200,
        data: { message: "模板更新成功" },
      }
    }

    if (url.startsWith("/export_tpl/") && lowerMethod === "delete") {
      const tplId = Number(url.split("/").pop())
      demoTemplates.value = demoTemplates.value.filter((item) => item.tpl_id !== tplId)
      return {
        code: 200,
        data: { message: "模板删除成功" },
      }
    }

    if (url.startsWith("/export_tpl/") && lowerMethod === "get") {
      return {
        code: 200,
        data: {
          enums: {
            cycle_weekly: [
              { label: "周一", value: 1 },
              { label: "周五", value: 5 },
            ],
            cycle_monthly: [
              { label: "1号", value: 1 },
              { label: "15号", value: 15 },
            ],
            range_value: [
              { label: "最近7天", value: "7d" },
              { label: "最近30天", value: "30d" },
            ],
          },
        },
      }
    }

    if (url === "/export_cron" && lowerMethod === "post") {
      return {
        code: 200,
        success: true,
        data: { message: "定时导出任务创建成功" },
      }
    }

    return {
      code: 200,
      data: {},
    }
  }

  const originHttpRequest = window.$httpRequest
  const originGateway = window.APP_GETEWAY
  const originUserInfo = window.userInfo

  const applyDemoGlobals = () => {
    window.APP_GETEWAY = {
      ...originGateway,
      dexh: originGateway?.dexh || "/mock-dexh",
    }
    window.userInfo = {
      ...originUserInfo,
      user: {
        user_id: 1,
        realname: "演示用户",
        ...(originUserInfo?.user || {}),
      },
    }
    window.$httpRequest = mockHttpRequest
  }

  const restoreDemoGlobals = () => {
    window.$httpRequest = originHttpRequest
    window.APP_GETEWAY = originGateway
    window.userInfo = originUserInfo
  }

  onMounted(applyDemoGlobals)
  onActivated(applyDemoGlobals)
  onDeactivated(restoreDemoGlobals)
  onBeforeUnmount(restoreDemoGlobals)

  return {
    form,
    scheduleOption,
    getFormData,
    handleExportCallback,
  }
}
