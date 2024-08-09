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
  batchInput: {
    rows: 200, // 限制行数
  },
  page: {
    edit: Boolean, // 是否是表单页
    leftConfig: {
      width: 200, // 左侧宽度
      collapse: false, // 是否可折叠
      lineClass: false, // 右侧线条 class
      collapseValue: false, // 是否默认折叠
      showArrow: true, // 是否显示箭头按钮
      arrowClass: '', // 箭头class
      drag: false, // 宽度是否可拖动
      dragLineClass: '', // 可拖动线条 class
      dragMinWidth: 50, // 拖动时的最小宽度
      dragMaxWidth: 500, // 拖动时的最大宽度
      dragMaxWidth: 500, // 拖动时的最大宽度
      duration: 200, // 左侧交互动画时长, 单位毫秒
    },
    footerConfig: {
      height: 50, // 底部高度
      align: 'center', // 对齐方式
      offset: 0 // 偏移
    },
  },
  upload: {
    modelValue: { type: [String, Array] },
    title: { type: String, default: '' }, // 标题，无标题时不展示
    types: { type: Array, default: () => (['png', 'jpg', 'jpeg']) },
    limit: { type: [String, Number], default: () => '' },
    drag: Boolean, // 是否开启拖动、粘贴上传
    card: Boolean, // 是否使用卡片模式展示
    size: { type: Number, default: 144 }, // 卡片模式展示大小
    edit: Boolean, // 是否开启名称编辑功能
    disabled: Boolean, // 是否禁用
    multiple: Boolean, // 是否开启多个上传
    required: Boolean, // 是否必填，仅展示样式，校验用el-form-item包一层来处理，也可以使用插槽 title 来自定义标题
    inline: { type: [Boolean, Number], default: true }, // 列表是否在一行展示，默认一行展示三个，传入数字可控制一行展示数量
    params: { type: Object, default: () => ({}) }, // 上传时的额外参数
    upload: { type: Function, default: async() => ({}) }, //上传方法
  },
})
```


