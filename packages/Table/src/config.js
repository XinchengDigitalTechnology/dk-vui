export const gridConfig = {
  height: 'auto',
  scrollHideForm: false,
  showOverflow: 'tooltip', // 单元格溢出显示 tooltip
  showHeaderOverflow: 'tooltip', // 表头溢出显示 tooltip
  columnConfig: { resizable: true }, // 列宽可拖动
  sortConfig: { remote: true, trigger: 'cell', orders: ['desc', 'asc', 'null'] }, // 默认远程排序
  rowConfig: {
    height: 40,
    isHover: true
  },
  tooltipConfig: {
    enterable: true
  },
  pagerConfig: {
    pageNum: 1,
    pageSize: 20
  },
  proxyConfig: {
    seq: true, // 启用动态序号代理（分页之后索引自动计算为当前页的起始序号）
    props: {
      result: 'data',
      total: 'total'
    }
  }
}
