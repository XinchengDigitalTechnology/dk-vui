# ImportDataBase 导入组件

`VImportDataBase` 用于 xlsx 数据导入，内置模板下载、文件选择、提交 loading、导入结果展示。

## 基础用法

```html
<VImportDataBase
  v-model="visible"
  title="用户导入"
  :template-link="templateLink"
  template-name="用户导入模板.xlsx"
  :xlsx-match="xlsxMatch"
  :on-change="handleImport"
/>
```

## 模板文件

`templateLink` 支持传入远程 URL 字符串，也支持传入本地 `File` 或 `Blob` 对象。

远程模板：

```js
const templateLink = 'https://example.com/templates/user-import.xlsx'
```

本地模板文件：

```js
const templateFile = new File(
  [xlsxBuffer],
  '用户导入模板.xlsx',
  { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
)
```

```html
<VImportDataBase
  v-model="visible"
  :template-link="templateFile"
  template-name="用户导入模板.xlsx"
/>
```

通过 Vite 导入的本地静态资源通常会解析为 URL 字符串，也可以直接传入：

```js
import templateLink from '@/assets/用户导入模板.xlsx?url'
```

## 前端解析

未传 `upload` 时，组件会在浏览器端解析 `.xlsx` 文件，并把解析后的数组传给 `onChange`。

```js
const xlsxMatch = {
  '备库单号*': 'order_no',
  '跟踪号': 'tracking_number',
  '物流商编码': 'logistics_code',
  '物流渠道编码': 'logistics_channel_code',
  '计划到货时间': 'plan_arrival_time',
}

const handleImport = async (data, callback) => {
  const res = await importApi(data)
  callback(res.data)
}
```

`callback(res.data)` 会把接口返回的数据回传给组件，用于导入结果展示。

传入 `xlsxMatch` 后，解析结果会把表头转换成映射字段。例如 `备库单号*` 会转换成 `order_no`。

## 后端解析

传入 `upload` 时，组件不会解析 xlsx，会把文件追加到 `FormData` 后交给父组件传入的方法。

```html
<VImportDataBase
  v-model="visible"
  :template-link="templateLink"
  :upload="uploadImportFile"
/>
```

```js
const uploadImportFile = async formData => {
  return await uploadApi(formData)
}
```

组件默认从接口返回值中读取 `res.data`，并展示 `data` 或 `data.list`。

## Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 控制弹窗显示隐藏，支持 `v-model` | boolean | false |
| title | 导入弹窗标题 | string | 导入数据 |
| multiple | 是否允许多文件导入 | boolean | false |
| templateLink | 模板远程链接或本地模板文件 | string / File / Blob | - |
| templateName | 模板下载文件名 | string | 导入模板.xlsx |
| xlsxMatch | xlsx 表头与提交字段的映射对象 | object | {} |
| onChange | 前端解析成功后的回调 | function(data, callback) | - |
| upload | 直接上传 xlsx 给后端解析的方法 | function(formData, files) | - |
| width | 弹窗宽度 | string / number | 550 |

## Events

| 名称 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 弹窗显示状态变化 | visible |
| change | 前端解析完成后触发 | data |
| success | 导入流程成功后触发 | data |
| refresh | 导入流程成功后触发，可用于刷新列表 | - |

## Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| msg | 自定义导入结果展示 | `{ list, data }` |

## 导入结果格式

默认展示接口返回的 `data` 数据：

```js
{
  data: [
    '成功：第 1 行导入完成',
    '失败：第 2 行手机号格式不正确',
  ]
}
```

也支持 `data.list`：

```js
{
  data: {
    total: 2,
    list: [
      '成功：第 1 行导入完成',
      '失败：第 2 行手机号格式不正确',
    ]
  }
}
```

默认结果列表中，包含 `失败` 或 `错误` 的文本会以错误颜色展示。

## 自定义结果展示

```html
<VImportDataBase v-model="visible" :template-link="templateLink" :on-change="handleImport">
  <template #msg="{ list, data }">
    <el-alert type="warning" :closable="false" show-icon>
      共处理 {{ data.total }} 条数据
    </el-alert>
    <div v-for="(item, index) in list" :key="index">
      {{ index + 1 }}. {{ item }}
    </div>
  </template>
</VImportDataBase>
```
