export const gridConfig = {
  size: 'small',
  height: 'auto',
  scrollHideForm: false, // 滚动时是否收起搜索区域
  showOverflow: 'tooltip', // 单元格溢出显示 tooltip
  showHeaderOverflow: 'tooltip', // 表头溢出显示 tooltip
  columnConfig: { resizable: true }, // 列宽可拖动
  checkboxConfig: { checkField: '_CHECKED_' }, // 列宽可拖动
  scrollY: { enabled: true, gt: 0, oSize: 4 }, // 默认启用虚拟滚动
  sortConfig: { remote: true, trigger: 'cell', orders: ['desc', 'asc', 'null'] }, // 默认远程排序
  formConfig: {
    proxy: {
      mainKey: 'sc_id', // 主键
      query: async (obj) => { // 查询方法
        const { save } = obj.formConfig
        if (!obj.formConfig.save) {
          console.error('请配置 formConfig.save 字段')
          return
        }
        const _table_form_save = JSON.parse(localStorage.getItem('DK_VUI_TABLE_FROM_SAVE'))
        return {
          data: _table_form_save && _table_form_save[save] || []
        }
      },
      remove: async (obj) => { // 删除方法
        if (!obj.formConfig.save) {
          console.error('请配置 formConfig.save 字段')
          return
        }
        const { sc_id, formConfig } = obj
        const { save } = formConfig
        const _table_form_save = JSON.parse(localStorage.getItem('DK_VUI_TABLE_FROM_SAVE'))
        _table_form_save[save] = _table_form_save[save].filter(d => d.sc_id !== sc_id)
        localStorage.setItem('DK_VUI_TABLE_FROM_SAVE', JSON.stringify(_table_form_save))
      },
      save: async (obj) => { // 保存方法
        if (!obj.formConfig.save) {
          console.error('请配置 formConfig.save 字段')
          return
        }
        const { name, conditions, formConfig } = obj
        const { save } = formConfig
        const _table_form_save = JSON.parse(localStorage.getItem('DK_VUI_TABLE_FROM_SAVE')) || { [save]: [] }
        _table_form_save[save].unshift({ name, sc_id: Date.now(), conditions })
        localStorage.setItem('DK_VUI_TABLE_FROM_SAVE', JSON.stringify(_table_form_save))
      }
    }
  },
  rowConfig: {
    height: 60,
    isHover: true
  },
  tooltipConfig: {
    enterable: true
  },
  toolbarConfig: {
    slots: {
      buttons: 'toolbar_btns'
    }
  },
  pagerConfig: {
    pageNum: 1,
    pageSize: 20,
    pageSizes: [20, 50, 100, 200, 500]
  },
  proxyConfig: {
    autoLoad: false,
    seq: true, // 启用动态序号代理（分页之后索引自动计算为当前页的起始序号）
    props: {
      result: 'data',
      total: 'total'
    }
  }
}
