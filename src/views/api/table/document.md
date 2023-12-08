## 内置功能

#### 带条件搜索

- 表格在请求数据时，如果游览器缓存存在 _table_form，则会把当前 _table_form 中的数据作为搜索条件消费，消费后清空该数据
- 因此，只需要设置 _table_form，然后跳转对应页面既可

```js
tableOptions: {
  formConfig: {
    data: {
      input: { type: 'change_no', value: '' },
    }
  }
}

// data格式与formConfig中的data一致
const tableForm = { input: { type: 'demand_no', value: '168168' } }
sessionStorage.setItem('_table_form', JSON.stringify({ tableForm }))
router.push('/demand/plan')
```

# Table API

- ...
<!-- - 基础页面为列表页，页面高度100%，溢出隐藏
- edit为true时为编辑页，横向溢出隐藏，纵向溢出为自动
- 编辑页保留滚动位置

## Attributes

| 属性名 | 说明                                  | 类型    | 默认值 |
| ------ | ------------------------------------- | ------- | ------ |
| edit   | 是否为编辑页                          | boolean | —      |
| footer | 为编辑页时底部固定区域配置 { offset } | object  | {}     |

## Slots

| 插槽名 | 说明               |
| ------ | ------------------ |
| left   | 左侧区域           |
| footer | 编辑页底部固定区域 |

## 按钮

```js
<VPage>页面内容</VPage>
``` -->
