# ExportCenter AI 使用说明

这份文档给 AI 或后续开发者快速理解如何接入、修改和排查 `ExportCenter` 组件使用。

## 1. 全局配置

必须保证宿主环境已经提供：

- `window.$httpRequest`
- `window.APP_GETEWAY.dexh`
- `window.userInfo.user`
- `GlobalConfig.derived.home_system`，除非已传非 `null` 的 `home_system`
- `GlobalConfig.action.setGlobalState`，用于点击“个人中心”时通知宿主项目跳转

推荐在项目入口通过 `DKVui.setup` 配置：

```js
DKVui.setup({
  derived: {
    home_system: 3
  },
  action: {
    setGlobalState(payload) {
      // 宿主项目在这里处理全局状态或路由跳转
      console.log(payload)
    }
  }
})
```

- `derived.home_system` 会作为 `/export_config/one` 的 `home_system` 请求参数。
- `action.setGlobalState` 会在点击“个人中心”链接时被调用，参数为 `{ changeMicoTabsPath: { path: "/user/profile", type: "push" } }`。

## 2. 最小接入示例

按钮模式会渲染默认“导出”按钮：

```vue
<template>
  <ExportCenter config_name="订单列表" tag_name="order_list" title-append="订单导出" has-permi="order:export" :home_system="null" :get-form-data="getExportCondition" :restriction="restriction" @callback="handleExportSuccess" />
</template>

<script setup>
import ExportCenter from "@/packages/components/ExportCenter/index.vue"

const getExportCondition = () => {
  return {
    keyword: searchForm.keyword,
    status: searchForm.status,
    start_time: searchForm.dateRange?.[0],
    end_time: searchForm.dateRange?.[1],
  }
}

const restriction = async () => {
  // 返回 false 时阻止打开导出中心；未传或返回 true 时继续打开。
  return searchForm.status !== "cancelled"
}

const handleExportSuccess = () => {
  // 可选：刷新页面、关闭弹窗、记录埋点等
}
</script>
```

弹窗模式不会渲染默认入口，需要通过组件实例调用 `open()`：

```vue
<template>
  <el-button type="primary" @click="exportCenterRef.open()">打开导出中心</el-button>
  <ExportCenter ref="exportCenterRef" type="dialog" config_name="订单列表" tag_name="order_list" :get-form-data="getExportCondition" />
</template>

<script setup>
import ExportCenter from "@/packages/components/ExportCenter/index.vue"

const exportCenterRef = ref()

const getExportCondition = () => {
  return {
    keyword: searchForm.keyword,
    status: searchForm.status,
  }
}
</script>
```

## 3. Props 使用规则

| Prop             | 必填                 | 建议写法              | AI 接入说明                                               |
| ---------------- | -------------------- | --------------------- | --------------------------------------------------------- |
| `type`           | 否                   | `"button"` / `"dialog"` | 默认 `"button"` 渲染组件内置导出按钮；传 `"dialog"` 时不渲染入口，需要父组件通过 `ref.open()` 打开弹窗。 |
| `config_name`    | 按业务               | 业务配置名称          | 用于标识当前导出配置，建议和后端配置名称保持一致。        |
| `tag_name`       | 是                   | 业务模块唯一标识      | 缺少时组件会提示“缺少必要参数”，不会请求配置。            |
| `getFormData`    | 强烈建议             | 返回当前查询条件对象  | 组件每次操作都会重新调用，不要返回缓存对象。              |
| `restriction`    | 按业务               | `() => true`          | 打开弹窗前的业务拦截方法；返回 `false` 时不打开，支持 Promise。 |
| `hasPermi`       | 按业务               | 权限码字符串          | 会传给入口按钮的 `v-hasPermi`。                           |
| `home_system`    | 按业务               | 数字系统 ID 或 `null` | 不传或传 `null` 时走 `GlobalConfig.derived.home_system`。 |
| `titleAppend`    | 按业务               | 标题后缀              | 导出标题格式为：名称 + 当前用户真实姓名 + 后缀。          |
| `schedule`       | 按业务               | `true` / `false`      | 控制模板行是否展示“定时导出”。                            |
| `scheduleOption` | 使用定时导出时建议传 | `[{ label, value }]`  | 用来从查询条件中识别定时导出的导出范围字段。              |

## 4. 后端数据协议

### 3.1 获取导出配置

组件打开时调用：

```http
GET /export_config/one
```

请求参数：

```js
{
  home_system: 1,
  tag_name: "order_list"
}
```

期望返回结构：

```js
{
  data: {
    config_id: 1001,
    config_name: "订单列表",
    export_field: [
      { field_key: "order_no", field_name: "订单号" },
      { field_key: "status", field_name: "状态" }
    ],
    templates: [
      {
        tpl_id: 2001,
        name: "常用字段",
        fields: ["order_no", "status"],
        creator_id: 3001
      }
    ]
  }
}
```

字段要求：

- `export_field` 必须是数组；每项至少包含 `field_key` 和 `field_name`。
- `templates` 建议是数组；模板字段通过 `fields` 保存字段 key 顺序。
- `creator_id` 用于前端判断是否展示删除按钮。

### 3.2 新增导出记录

即时导出和模板导出都会调用：

```http
POST /export_record
```

即时导出参数示例：

```js
{
  config_id: 1001,
  config_name: "订单列表",
  condition: { status: "paid" },
  fields: ["order_no", "status"],
  title: "订单列表张三订单导出",
  module: "order_list"
}
```

模板导出参数示例：

```js
{
  config_id: 1001,
  config_name: "订单列表",
  condition: { status: "paid" },
  fields: [],
  title: "常用字段张三订单导出",
  module: "order_list",
  tpl_id: 2001
}
```

注意：模板导出时 `fields` 是空数组，后端需要根据 `tpl_id` 读取模板字段。

### 3.3 保存模板

```http
POST /export_tpl
```

参数：

```js
{
  config_id: 1001,
  name: "常用字段",
  fields: ["order_no", "status"],
  condition: { status: "paid" }
}
```

### 3.4 更新模板

```http
PUT /export_tpl/:id
```

参数：

```js
{
  id: 2001,
  name: "常用字段",
  fields: ["status", "order_no"]
}
```

### 3.5 删除模板

```http
DELETE /export_tpl/:id
```

## 5. 启用定时导出

```vue
<ExportCenter tag_name="order_list" :schedule="true" :schedule-option="scheduleOption" :get-form-data="getExportCondition" />
```

```js
const scheduleOption = [
  { label: "创建时间", value: "create_time" },
  { label: "更新时间", value: "update_time" },
]

const getExportCondition = () => ({
  create_time: ["2026-01-01", "2026-01-31"],
  status: "paid",
})
```

定时导出行为：

1. 用户先保存或选择一个模板。
2. 点击模板行的“定时导出”。
3. `ExportCenter` 调用 `ScheduledExport.open({ ...row, condition })`。
4. `ScheduledExport` 根据 `scheduleOption` 查找 `condition` 中存在的字段，作为导出范围。
5. 用户配置周期、时间和次数后提交定时任务。

## 6. 自定义导出按钮

如果业务需要多个导出按钮，或需要外部控制按钮布局，可以使用 `exportButton` 插槽。
插槽只暴露 `outerExport` 方法；导出中的 loading 和防重复提交由组件内部管理，不再作为 slot prop 透出。

```vue
<ExportCenter tag_name="order_list" :get-form-data="getExportCondition">
  <template #exportButton="{ outerExport }">
    <el-button type="primary" @click="outerExport('order_list', '订单列表')">
      导出已选字段
    </el-button>

    <el-button @click="outerExport('order_list', '订单列表', 'all')">
      导出全部字段
    </el-button>
  </template>
</ExportCenter>
```

`outerExport(module, moduleName, type)` 参数说明：

| 参数         | 必填 | 说明                                                    |
| ------------ | ---- | ------------------------------------------------------- |
| `module`     | 是   | 要导出的模块标识，会作为 `tag_name` 请求导出配置。      |
| `moduleName` | 是   | 用于拼接导出标题。                                      |
| `type`       | 否   | 传 `"all"` 时导出该模块所有字段；否则导出当前勾选字段。 |

注意：

- 使用插槽后，默认导出按钮不会渲染。
- `outerExport` 返回 `Promise`，内部会处理 loading 状态和重复点击拦截。
- 非 `"all"` 模式不会自动校验是否勾选字段，外部按钮如有需要应自行限制。

## 7. 常见修改入口

| 需求                 | 修改位置               | 说明                                   |
| -------------------- | ---------------------- | -------------------------------------- |
| 改入口按钮文案或图标 | `index.vue`            | 修改顶部 `VButton`。                   |
| 改弹窗布局           | `index.vue`            | 调整左右区域、提示信息、footer。       |
| 改字段排序逻辑       | `ExportFieldList.vue`  | 修改 `moveField()`。                   |
| 改模板选择回显逻辑   | `useExportTemplate.js` | 修改 `selectField()`。                 |
| 改导出参数           | `useExportCenter.js`   | 优先修改 `buildExportRecordParams()`。 |
| 改导出标题规则       | `useExportCenter.js`   | 修改 `buildExportTitle()`。            |
| 改模板保存校验       | `useExportTemplate.js` | 修改 `saveTemplate()`。                |
| 改模板更新逻辑       | `useExportTemplate.js` | 修改 `updateTemplate()`。              |
| 改删除确认文案       | `useExportTemplate.js` | 修改 `exportDelete()`。                |
| 改接口地址或方法     | `api.js`               | 保持调用方方法名稳定，避免连锁修改。   |

## 8. 生命周期与资源释放

- 组件未打开弹窗时不会请求导出配置，也不会持有字段和模板数据。
- 主弹窗关闭时会清空字段、模板、勾选状态、模板名称和导出 loading，并取消未触发的防抖导出。
- 主弹窗启用 `destroy-on-close`，关闭后会销毁弹窗内容里的表格组件实例，避免多次打开关闭后保留不必要 DOM。
- 导出配置加载带版本校验；如果打开后马上关闭，接口稍后返回也不会把字段和模板重新写回已关闭的弹窗。
- `schedule = false` 时不会挂载 `ScheduledExport` 子组件；只有启用定时导出入口时才按需挂载。

## 9. AI 修改代码时的注意事项

1. 不要把 `condition` 缓存在组件状态里；应继续通过 `getLatestCondition()` 每次获取最新查询条件。
2. 不要直接改写 `props.fields`；字段排序需要复制数组后通过 `fields-change` 通知父层。
3. 不要绕过 `validateSelectedFields()` 修改保存模板和即时导出逻辑，除非业务明确允许空字段。
4. 模板导出依赖 `tpl_id`，不要随意把模板导出的 `fields: []` 改成当前勾选字段。
5. 如果重命名 `exportRord`，需要同步改 `useExportCenter.js` 和 `useExportTemplate.js`，并确认是否还有外部引用。
6. `handleTemplateRow.index` 使用字符串比较，修改时要同时检查 `isEditingTemplate()` 和 `selectField()`。
7. 删除按钮只是前端展示控制，不能当作权限安全边界。
8. 增加新能力时，优先保持当前分层：
   - 基础导出状态和参数构造放 `useExportCenter.js`
   - 模板相关行为放 `useExportTemplate.js`
   - UI 展示和事件转发放 Vue 组件

## 10. 排查清单

### 打不开弹窗或提示缺少参数

检查：

- 是否传入 `tag_name`
- `tag_name` 是否是后端已配置的模块标识

### 字段列表为空

检查：

- `/export_config/one` 是否返回 `data.export_field`
- 字段项是否包含 `field_key`
- 请求参数 `home_system` 和 `tag_name` 是否正确

### 导出失败

检查：

- 是否勾选了字段
- `/export_record` 请求参数中的 `config_id`、`condition`、`fields`、`module` 是否符合后端预期
- 宿主环境是否提供 `window.$httpRequest` 和 `window.APP_GETEWAY.dexh`

### 模板保存失败

检查：

- 模板名称是否为空
- 模板名称是否重复
- 是否至少勾选一个字段
- `/export_tpl` 是否接受 `condition`

### 选择模板后字段顺序不对

检查：

- 模板 `fields` 是否按期望顺序保存
- 字段 key 是否能和 `export_field[].field_key` 对上
- 是否有模板中不存在但字段列表中存在的新字段；这类字段会被排在后方

### 定时导出范围为空

检查：

- 是否传入 `scheduleOption`
- `scheduleOption[].value` 是否存在于 `getFormData()` 返回的 `condition` 中
- 当前查询条件是否真的包含对应范围字段

## 11. 推荐测试场景

- 打开弹窗后能正确加载字段和模板。
- 打开弹窗后立即关闭，接口稍后返回时不会重新回填字段和模板。
- 多次打开、关闭弹窗后，字段、模板和勾选状态不会残留到下一次打开前。
- 未勾选字段时，即时导出和保存模板都提示错误。
- 勾选字段并调整排序后，保存模板的 `fields` 顺序正确。
- 点击模板名称后，左侧字段能按模板字段顺序回显。
- 选择模板后修改字段，该模板行出现“保存”入口。
- 本人创建的模板显示删除按钮，非本人模板不显示。
- `schedule = true` 时显示“定时导出”，否则不显示。
- 使用 `exportButton` 插槽后默认导出按钮不显示，`outerExport(..., "all")` 会导出所有字段。
