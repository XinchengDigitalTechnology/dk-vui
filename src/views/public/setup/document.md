# 全局参数

```js
import DKVui from 'dk-vui'

DKVui.setup({
  table: {
    size: 'small',
    height: 'auto',
    scrollHideForm: true, // 滚动时是否收起搜索区域
    autoLoadQuery: true, // 加载完毕后是否主动请求数据
    crossSlip: true, // 是否开启鼠标滚轮横向滚动
    columnConfig: { resizable: true }, // 每一列是否启用列宽调整
    checkboxConfig: { checkField: '_CHECKED_' }, // 绑定选中属性（行数据中必须存在该字段，否则无效）
    scrollY: { enabled: true, gt: 0, oSize: 4 }, // 默认启用虚拟滚动
    sortConfig: { remote: true, trigger: 'cell', orders: ['desc', 'asc', 'null'] }, // 默认远程排序
    formConfig: {
      proxy: { // 保存搜索条件
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
      height: 52, // 只对 show-overflow 有效，每一行的高度
      isHover: true // 当鼠标移到行时，是否要高亮当前行
    },
    tooltipConfig: {
      enterable: true // 鼠标是否可进入到工具提示中
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
      autoLoad: false, // 是否自动加载查询数据
      seq: true, // 启用动态序号代理（分页之后索引自动计算为当前页的起始序号）
      props: {
        result: 'data',
        total: 'total'
      }
    }
  },
  text: {
    titlePosition: 'left', // 标题位置
    line: 1, // 溢出隐藏行数
    copy: false, // 是否可复制
    empty: '-' // 空值
  },
  select: {
    filterable: true, // 是否可筛选
    clearable: true, // 是否可清空
    types: {} // 配置选项
  },
  page: {
    edit: Boolean, // 是否是表单页
    leftConfig: {
      width: 200, // 左侧宽度
      collapse: false // 是否可折叠
    },
    footerConfig: {
      height: 50, // 底部高度
      align: 'center', // 对齐方式
      offset: 0 // 偏移
    },
  }
})
```


