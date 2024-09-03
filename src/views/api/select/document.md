# Select API

## Select 属性

| 属性名        | 说明                   | 类型                 | 默认值 |
| ------------- | ---------------------- | -------------------- | ------ |
| modelValue         | 文本                   | string/number/array        | -      |
| options         | 选项集合                   | array        | -      |
| types | 配置项               | object    | {}   |
| type          | 选项类型，结合配置项使用               | string  | -      |
| filterable          | 是否可筛选           | boolean        | true      |
| clearable          | 是否可清除           | boolean        | true      |
| multiple          | 是否多选           | boolean        | false      |
| select          | 是否使用select模式           | boolean        | false      |
| paste         | 是否使用粘贴功能   | boolean  | false    |
| confusedPaste         | 是否使用模糊粘贴功能快速追加选项   | boolean  | false    |
| showCheckAll         | 是否使用全选功能   | boolean  | false    |

Select 事件

| 名称 | 说明                                  | 类型    |
| ------ | ------------------------------------- | ------- |
| change   | 选中值发生变化时触发                  | function({ value, option }) |

## Select Types 配置项使用

#### types 设置，main.js （建议只配置公共options）

```js
import App from './App'
import DKVui from 'dk-vui'
import { warehouse, supplier, platforms, warehouseList, role } from '@/api/public'

app.use(DKVui)
DKVui.setup({
  select: {
    types: {
      {
        warehouse, // 仓库
        warehouseList, // 仓库平台
        supplier, // 供应商
        platforms, // 平台
        role, // 角色
      }
    }
  }
})
```

#### 结合 type 使用

```html
<VSelect v-model="form.role_id" placeholder="供应商" type='role' />
```

#### 全局方法 updateSelectOptions 更新options

```js
import DKVui from 'dk-vui'
DKVui.updateSelectOptions('role')
```

