export const gridConfig = {
  height: 'auto',
  scrollHideForm: false, // 滚动时是否收起搜索区域
  showOverflow: 'tooltip', // 单元格溢出显示 tooltip
  showHeaderOverflow: 'tooltip', // 表头溢出显示 tooltip
  columnConfig: { resizable: true }, // 列宽可拖动
  checkboxConfig: { checkField: '_CHECKED_' }, // 列宽可拖动
  scrollY: { enabled: true, gt: 0, oSize: 4 }, // 默认启用虚拟滚动
  sortConfig: { remote: true, trigger: 'cell', orders: ['desc', 'asc', 'null'] }, // 默认远程排序
  rowConfig: {
    height: 40,
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
    seq: true, // 启用动态序号代理（分页之后索引自动计算为当前页的起始序号）
    props: {
      result: 'data',
      total: 'total'
    }
  }
}
