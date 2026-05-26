export default {
  /**
   * 获取导出模板枚举数据。
   * @param {string|number} id - 导出模板 ID
   */
  drop_down(id) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl/${id}`,
      method: "get",
    })
  },

  /**
   * 新增定时导出任务。
   * @param {Object} data - 任务配置
   */
  export_cron(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_cron`,
      method: "POST",
      data,
    })
  },

  /**
   * 新增导出记录。
   * @param {Object} data - 导出参数
   */
  exportRord(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_record`,
      method: "post",
      data,
    })
  },

  /**
   * 新增导出模板。
   * @param {Object} data - 模板配置
   */
  exporttpl(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl`,
      method: "POST",
      data,
    })
  },

  /**
   * 编辑导出模板。
   * @param {Object} data - 模板配置
   * @param {string|number} data.id - 模板 ID
   */
  exportTemplateUpdate(data) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl/${data.id}`,
      method: "PUT",
      data,
    })
  },

  /**
   * 获取指定模块的导出配置。
   * @param {Object} params - 查询参数
   */
  exportTemplateOne(params) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_config/one`,
      method: "get",
      params,
    })
  },

  /**
   * 删除导出模板。
   * @param {string|number} id - 模板 ID
   */
  exportTemplateDelete(id) {
    return window?.$httpRequest({
      baseURL: window.APP_GETEWAY.dexh,
      url: `/export_tpl/${id}`,
      method: "delete",
    })
  },
}
