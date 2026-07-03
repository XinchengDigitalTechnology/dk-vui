## 全局注册配置

```js
DKVui.setup({
  derived: {
    home_system: 3,
    module_name: "dk-vui-demo"
  }
})
```

- `derived.home_system` 会作为 `/export_config/one` 的 `home_system` 参数。
- `derived.module_name` 会优先作为 `/export_record` 的 `module` 参数；未配置时使用本次导出的 `tag_name`。

## 基础用法

```html
<VExportCenter
  config_name="示例订单"
  tag_name="demo_export_center"
  title-append="示例导出"
  :get-form-data="getFormData"
  :restriction="restriction"
  @callback="handleExportCallback"
/>
```

`restriction` 会在打开弹窗前执行。未传时直接打开；返回 `true` 时继续打开；返回 `false` 时阻止打开。

```js
const restriction = async () => {
  if (form.status === "cancelled") {
    ElMessage.warning("已取消订单不允许打开导出中心")
    return false
  }

  return true
}
```

## 弹窗模式

默认 `type` 为 `button`，组件会渲染“导出”按钮。设置为 `dialog` 后只保留导出弹窗，需要通过组件实例调用 `open()` 打开。

```html
<el-button type="primary" @click="exportCenterRef.open()">打开导出中心</el-button>

<VExportCenter
  ref="exportCenterRef"
  type="dialog"
  config_name="示例订单"
  tag_name="demo_export_center"
  :get-form-data="getFormData"
/>
```

## 开启定时导出

设置 `schedule` 后，模板列表会展示“定时导出”入口。
未开启 `schedule` 时，组件不会挂载定时导出弹窗实例。

```html
<VExportCenter
  config_name="示例订单"
  tag_name="demo_export_center"
  :schedule="true"
  :schedule-option="scheduleOption"
  :get-form-data="getFormData"
/>
```

## 自定义导出按钮

通过 `exportButton` 插槽可以接管默认导出按钮，并使用 `outerExport` 发起外部导出。

```html
<VExportCenter
  config_name="示例订单"
  tag_name="demo_export_center"
  :get-form-data="getFormData"
>
  <template #exportButton="{ outerExport }">
    <el-button
      type="primary"
      @click="outerExport('demo_export_center', '示例订单', 'all')"
    >
      导出全部字段
    </el-button>
    <el-button
      @click="outerExport('demo_export_center', '示例订单')"
    >
      导出已选字段
    </el-button>
  </template>
</VExportCenter>
```

## 所有可传参数说明

### Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `String` | `"button"` | 展示模式。`button` 渲染默认导出按钮；`dialog` 不渲染入口按钮，需要通过组件实例 `open()` 打开弹窗。 |
| `config_name` | `String` | `""` | 配置名称，用于标识当前导出配置。 |
| `tag_name` | `String` | `""` | 模块名称，必传。用于请求当前模块的导出配置。 |
| `getFormData` | `Function` | `() => {}` | 获取当前页面筛选条件。导出、保存模板、定时导出时都会重新调用。 |
| `restriction` | `Function` | - | 打开弹窗前的业务拦截方法。未传或返回 `true` 时打开，返回 `false` 时不打开，支持 `Promise<boolean>`。 |
| `hasPermi` | `String` | `""` | 权限标识，会传给入口按钮的 `v-hasPermi`。 |
| `home_system` | `Number` | `null` | 系统标识。未传或传 `null` 时使用 `GlobalConfig.derived.home_system`，再兜底为 0。 |
| `titleAppend` | `String` | `""` | 导出标题后缀。最终标题格式为：名称 + 当前用户真实姓名 + titleAppend。 |
| `schedule` | `Boolean` | `false` | 是否展示模板行的“定时导出”入口。 |
| `scheduleOption` | `Array` | `[]` | 定时导出范围配置，格式为 `[{ label, value }]`。 |

### Events

| 事件名 | 说明 |
| --- | --- |
| `callback` | 默认导出或模板导出成功后触发，父页面可用于刷新列表或提示用户。 |

### Slots

| 插槽名 | 参数 | 说明 |
| --- | --- | --- |
| `exportButton` | `{ outerExport }` | 自定义导出按钮区域。传入后默认导出按钮不会渲染。 |

### outerExport 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `module` | `String` | 是 | 要导出的模块标识，会重新请求该模块的导出配置。 |
| `moduleName` | `String` | 是 | 用于拼接导出标题的模块名称。 |
| `type` | `String` | 否 | 传 `all` 时导出模块全部字段；不传时导出当前勾选字段。 |

## 弹窗关闭与资源释放

导出中心只在打开弹窗时请求导出配置。关闭弹窗会清空字段、模板、勾选状态和未触发的防抖导出，并销毁弹窗内容组件。

如果打开后立刻关闭，即使配置接口稍后返回，也不会把字段和模板重新写回已关闭的弹窗。
