// import request from "@/utils/request"
export default {
  // 枚举
  drop_down(id) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl/${id}`,
      method: "get",
    })
  },
  // 新增任务
  export_cron(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_cron`,
      method: "POST",
      data,
    })
  },
  // 新增导出详情
  exportRord(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_record`,
      method: "post",
      data,
    })
  },

  // 新增导出模版
  exporttpl(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl`,
      method: "POST",
      data,
    })
  },
  // 编辑导出模版
  exportTemplateUpdate(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl/${data.id}`,
      method: "PUT",
      data,
    })
  },
  // 编辑导出模版
  exportTemplateOne(params) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_config/one`,
      method: "get",
      params,
    })
  },

  // 删除模板
  exportTemplateDelete(id) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl/${id}`,
      method: "delete",
    })
  },
}
