export default {
  drop_down(id) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl/${id}`,
      method: "get",
    })
  },

  /**
   * 修改任务
   * @param {Object} data - 任务数据
   */
  update(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_cron/${data.cron_id}`,
      method: "put",
      data: data,
    })
  },

  /**
   * 新增定时导出任务
   * @param {Object} data - 任务数据
   */
  export_cron(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_cron`,
      method: "POST",
      data,
    })
  },

  // 任务详情
  exportCronDtl(params) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_cron/${params.cron_id}`,
      method: "get",
    })
  },
}
