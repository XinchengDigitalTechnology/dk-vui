# Cascader API

## Cascader 属性

| 属性名 | 说明 | 类型 | 默认值 |
| ------------- | ---------------------- | -------------------- | ------ |
| modelValue | 绑定值 | string/number/array/object | - |
| options | 选项集合，支持数组或返回数组的异步方法 | array/function | - |
| types | 配置项 | object | {} |
| type | 选项类型，结合配置项使用 | string | - |
| filterable | 是否可筛选 | boolean | true |
| clearable | 是否可清除 | boolean | true |
| multiple | 是否多选 | boolean | false |
| checkStrictly | 是否严格遵守父子节点不互相关联 | boolean | false |
| showAllLevels | 输入框中是否显示选中值的完整路径 | boolean | false |
| emitPath | 在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组 | boolean | false |
| level | 限制展示的层级，0 表示不限制 | number | 0 |
| collapseTagsTooltip | 当鼠标悬停于折叠标签的文本时，是否显示所有选中标签的文本 | boolean | true |
| sortDisabled | 筛选时是否将包含「已禁用」的建议项沉底 | boolean | true |

其余属性透传至 `el-cascader`。

## Cascader 事件

| 名称 | 说明 | 类型 |
| ------ | ------------------------------------- | ------- |
| change | 选中值发生变化时触发 | function({ value, labels }) |

## Cascader Types 配置项使用

#### types 设置，main.js（建议只配置公共 options）

```js
import App from './App'
import DKVui from 'dk-vui'
import { personnel, department, areaTree } from '@/api/public'

app.use(DKVui)
DKVui.setup({
  cascader: {
    types: {
      // 简单写法：同 VSelect，直接配置异步方法或数组
      areaTree,
      // 完整写法：可配置字段映射等
      personnel: {
        options: personnel,
        value: 'user_id',
        children: 'sub',
        sortDisabled: true, // 筛选时将「已禁用」项沉底
      },
      department: {
        options: department,
        value: 'name',
        children: 'sub',
        emitPath: true,
        joinPath: '/', // 选中路径用 / 拼接后写入 v-model
      },
    }
  }
})
```

#### types 完整配置项

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ------------------------------------- | ------- | ------ |
| options | 选项集合，支持数组或返回数组的异步方法 | array/function | - |
| label | 指定选项标签为选项对象的某个属性值 | string | name |
| value | 指定选项的值为选项对象的某个属性值 | string | id |
| children | 指定选项的子选项为选项对象的某个属性值 | string | sub |
| emitPath | 是否返回完整路径数组 | boolean | - |
| joinPath | 将路径数组用指定分隔符拼接后写入 v-model（常与 emitPath 搭配） | string | - |
| sortDisabled | 筛选时是否将包含「已禁用」的建议项沉底 | boolean | true |
| lazy | 是否动态加载子节点 | boolean | false |
| lazyLoad | 加载动态数据的方法，仅 lazy 为 true 时生效 | function | - |

#### 结合 type 使用

```html
<VCascader v-model="form.user_id" placeholder="请选择人员" type="personnel" />
```

#### 直接传入 options

```html
<VCascader v-model="form.area" placeholder="请选择" :options="options" />
```

#### 全局方法 updateCascaderOptions 更新 options

```js
import DKVui from 'dk-vui'
DKVui.updateCascaderOptions('personnel')
```
