# ExportCenter condition 参数获取说明

## 目标

`condition` 表示当前业务页面的查询条件，是导出、保存模板、定时导出的核心参数之一。

当前组件中 `condition` 的唯一来源是父组件传入的 `getFormData()`。组件内部不再把 `condition` 存到 `form.value`，避免缓存值过期。

## 推荐统一方法

建议在 `index.vue` 中新增一个统一方法，例如 `getLatestCondition`：

```js
const getLatestCondition = () => {
  return props.getFormData?.() || {}
}
```

这个方法负责两件事：

- 从父组件的 `getFormData()` 获取最新查询条件。
- 如果父组件没有返回值，统一兜底为空对象，避免接口参数出现 `null` 或 `undefined`。

## 使用场景

### 1. 打开导出中心弹窗

用户点击默认“导出”按钮打开弹窗时，不需要把查询条件写入 `form.value`。

建议：

```js
const open = async () => {
  // 获取模板配置
}
```

作用：

- 打开弹窗只负责展示和加载模板配置。
- 查询条件在真正导出、保存模板、打开定时导出时再实时获取。

### 2. 创建导出记录

默认导出、模板导出、slot 中调用的 `outerExport` 最终都会创建导出记录。

建议在 `buildExportRecordParams` 中统一获取：

```js
const buildExportRecordParams = (extra = {}) => ({
  ...form.value,
  condition: getLatestCondition(),
  ...extra,
  module: extra.tag_name || props.tag_name,
})
```

作用：

- 不管导出入口来自默认按钮、模板行按钮，还是 `importBtn` slot，都能拿到最新查询条件。
- 避免 `outerExport` 在弹窗未打开时使用空的 `condition`。
- 让导出参数组装只维护一个入口。

### 3. 保存导出模板

保存模板时需要把当前查询条件一起保存到模板中。

建议：

```js
await api.exporttpl({
  config_id: form.value.config_id,
  name: templateName,
  fields: getSortedSelectedFieldKeys(),
  condition: getLatestCondition(),
})
```

作用：

- 模板保存的是当前页面最新查询条件。
- 不依赖用户是否刚刚打开过弹窗。

### 4. 打开定时导出

定时导出需要把当前模板和查询条件传给 `ScheduledExport`。

建议：

```js
scheduledExportRef.value?.open({
  ...row,
  condition: getLatestCondition(),
})
```

作用：

- 定时任务使用当前筛选条件。
- 避免定时导出拿到旧的查询条件。

## 不建议的做法

不建议在每个业务方法中直接写：

```js
props.getFormData()
```

原因：

- 多处调用会让参数来源分散。
- 后续如果要调整兜底逻辑，需要修改多个方法。
- 容易出现某些导出入口更新了 `condition`，某些入口没有更新的问题。

不再使用：

```js
form.value.condition
```

原因：

- `form.value` 只保存导出配置相关字段，不保存查询条件。
- `condition` 是实时业务参数，不适合作为组件内部缓存状态。
- `outerExport` 通过 slot 调用时，弹窗可能根本没有打开过，缓存字段没有可靠来源。

## 推荐最终结构

`condition` 获取建议统一成以下结构：

```js
const getLatestCondition = () => {
  return props.getFormData?.() || {}
}

const buildExportRecordParams = (extra = {}) => ({
  ...form.value,
  condition: getLatestCondition(),
  ...extra,
  module: extra.tag_name || props.tag_name,
})
```

然后以下场景统一调用 `getLatestCondition` 或间接通过 `buildExportRecordParams` 获取：

- `open`
- `handleImport`
- `exportRow`
- `outerExport`
- `saveTemplate`
- `openScheduledExport`

## 总结

`condition` 的最佳获取位置应该是组件内部的统一方法，而不是分散在多个导出方法里。

推荐以 `getLatestCondition` 作为唯一入口：

- 需要直接传 `condition` 的地方，调用 `getLatestCondition()`。
- 需要创建导出记录的地方，统一走 `buildExportRecordParams()`。

这样可以保证所有导出相关功能使用同一份最新查询条件，后续维护也只需要改一个地方。
