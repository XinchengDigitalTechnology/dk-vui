## 使用

- column 中的 header 插槽支持配置数组
- 使用 VSort 组件做排序

```js
const tableOptins = reactive({
  formConfig: {
    data: {
      sort: {}
    }
  },
  rowConfig: { height: 150 },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    {
      title: '默认排序', width: 100, field: 'sort1', sortable: true, slots: {
        default: ({row}) => 'sortable: true'
      }
    },
    {
      width: 200,slots: {
        header: [
          {title: '配置排序', sort: 'sort2'}
        ],
        default: () => <VText value={`[{title: '字段1排序', sort: 'sort2'}] 单字段排序`} line='2' />
      }
    },
    {
      width: 200,slots: {
        header: [
          {title: '字段1排序', sort: 'sort3'},
          {title: '字段2排序', sort: 'sort4'},
        ],
        default: () => <VText value={`[{title: '字段1排序', sort: 'sort3'}, {title: '字段2排序', sort: 'sort4'}] 多字段排序`} line='3' />
      }
    },
    {
      width: 296, slots: {
        header: [
          { title: '标题在前面', question: '提示', sort: 'sort5'},
          { question: '提示', title: '提示在前面', sort: 'sort6'},
          { sort: 'sort7', title: '排序在前面', question: '提示'},
        ],
        default: () => <VText value={`[{ title: '标题在前面', question: '提示', sort: 'sort5'}, { question: '提示', title: '提示在前面', sort: 'sort6'}, { sort: 'sort7', title: '排序在前面', question: '提示'},] { title, question, line} 字段顺序决定排序`} line='4' />
      }
    },
    {
      width: 240, slots: {
        header: () => <VSort value={[
          {label: '组件排序第一行', value: 'sort8'},
          {label: '组件排序第二行', value: 'sort9'},
        ]} />,
        default: ({ row }) => <VText value={
          `<VSort value={[
            {label: '第一行', value: 'sort8'},
            {label: '第二行', value: 'sort9'},
          ]} />`} line='4' />
      }
    },
    {
      width: 240, slots: {
        header: () => <div>
          组件下拉排序
          <VSort value={[
          {label: '第一行', value: 'sort10'},
          {label: '第二行', value: 'sort11'},
        ]} dropdown />
        </div>,
        default: ({ row }) => <VText value={
          `<div>
            组件下拉排序
            <VSort value={[
              {label: '第一行', value: 'sort10'},
              {label: '第二行', value: 'sort11'},
            ]} dropdown />
          </div>`} line='7' />
      }
    },
    {
      title: '占位列', minWidth: 120
    },
  ],
  proxyConfig: {
    ajax: {
      // 接收 Promise
      query: ({ page, form }) => {
        console.log('提交后端的form: ', JSON.stringify(form, null, 2))
        return findPageList(page.pageNum, page.pageSize)
      }
    }
  }
})
```


