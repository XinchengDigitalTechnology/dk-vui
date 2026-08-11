# ImportDataBase 导入组件

`VImportDataBase` 用于 xlsx 数据导入，内置模板下载、文件选择、提交 loading、导入结果展示。

## 基础用法

```html
<VImportDataBase
  title="用户导入"
  :template-link="templateLink"
  template-name="用户导入模板.xlsx"
  :xlsx-match="xlsxMatch"
  :on-change="handleImport"
/>
```

组件内部管理弹窗状态。未提供默认插槽时，会显示一个“导入”按钮，点击后打开弹窗。

通过默认插槽可以自定义触发内容：

```html
<VImportDataBase
  title="用户导入"
  :template-link="templateLink"
  :on-change="handleImport"
>
  <el-button type="success">导入用户</el-button>
</VImportDataBase>
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

`onChange` 的完整调用参数为 `(data, callback, context)`：

- `data`：从所有已选文件中解析、合并后的数据。
- `callback`：将处理结果回传给组件，用于展示导入结果。
- `context`：文件上下文，结构为 `{ file, files }`；`file` 是首个文件，`files` 是全部文件。

除了调用 `callback`，也可以直接返回处理结果：

```js
const handleImport = async (data, callback, { file, files }) => {
  console.log('当前文件', file)
  console.log('全部文件', files)
  return await importApi(data)
}
```

如果已经调用 `callback`，组件不会再处理 `onChange` 的返回值。

传入 `xlsxMatch` 后，解析结果会把表头转换成映射字段。例如 `备库单号*` 会转换成 `order_no`。

## 后端解析

传入 `upload` 时，组件不会解析文件，会把文件追加到 `FormData` 后交给父组件传入的方法。可通过 `listType` 配置允许上传的文件扩展名，默认为 `['xlsx', 'xls']`。

```html
<VImportDataBase
  :template-link="templateLink"
  :list-type="['xlsx', 'xls', 'csv']"
  :on-change="handleUploadChange"
  :upload="uploadImportFile"
  auto-submit
/>
```

```js
const handleUploadChange = ({ file, files }) => {
  console.log('当前文件', file)
  console.log('全部文件', files)
}

const uploadImportFile = async formData => {
  return await uploadApi(formData)
}
```

后端上传前会调用 `onChange({ file, files })`。组件默认从接口返回值中读取 `res.data`，并展示 `data` 或 `data.list`。启用 `autoSubmit` 后，选择文件会立即提交并隐藏保存按钮；同时设置 `showSubmit` 时仍会显示保存按钮。

## Props

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| auth | 按钮权限标识；不传时直接展示 | string | - |
| autoSubmit | 选择文件后是否自动提交；启用时隐藏保存按钮 | boolean | false |
| className | 触发器容器的自定义类名，不作用于弹窗 | string | - |
| title | 导入弹窗标题 | string | 导入数据 |
| listType | 后端上传允许的文件扩展名 | string[] | `['xlsx', 'xls']` |
| multiple | 是否允许多文件导入 | boolean | false |
| showSubmit | 自动提交时是否仍显示保存按钮，优先级高于 `autoSubmit` 的隐藏逻辑 | boolean | false |
| templateLink | 模板远程链接或本地模板文件 | string / File / Blob | - |
| templateName | 模板下载文件名 | string | 导入模板.xlsx |
| xlsxMatch | xlsx 表头与提交字段的映射对象 | object | {} |
| onChange | 文件处理回调；前端解析时接收 `(data, callback, context)`，后端上传时接收 `({ file, files })` | function | - |
| upload | 直接上传文件给后端解析的方法 | function(formData, files) | - |
| width | 弹窗宽度 | string / number | 550 |

## Events

| 名称 | 说明 | 回调参数 |
| --- | --- | --- |
| success | 导入流程成功后触发 | data |
| refresh | 导入流程成功后触发，可用于刷新列表 | - |

## Slots

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| default | 自定义打开弹窗的触发内容；默认显示“导入”按钮 | - |
| tips | 自定义上传区域下方、导入结果上方的提示内容 | - |
| msg | 自定义导入结果展示 | `{ list, data }` |

```html
<VImportDataBase :template-link="templateLink" :on-change="handleImport">
  <template #tips>
    <el-alert title="请确认文件内容符合模板要求" type="info" :closable="false" />
  </template>
</VImportDataBase>
```

## 权限配置

传入 `auth` 后，组件会通过全局配置中的 `importDataBase.auth` 判断是否展示。默认配置为：

```js
{
  importDataBase: {
    auth: authString => window.BTN_AUTH?.includes(authString) ?? false
  }
}
```

```html
<VImportDataBase
  auth="warehouse:whitelist:import"
  :template-link="templateLink"
  :on-change="handleImport"
/>
```

可在安装组件库时覆盖 `importDataBase.auth`，以适配项目自身的权限数据结构。

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
<VImportDataBase :template-link="templateLink" :on-change="handleImport">
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
