# ExportCenter P0 修复记录

## 修复范围

本次修复覆盖 `README.md` 中 P0 级别的 5 个问题：

1. 删除 `{{ hasPermi }}` 页面残留。
2. 将组件名从 `DerivedCenter` 改为 `ExportCenter`。
3. 修复 `saveTemplate` 保存字段顺序。
4. 修复 `outerExport` 查询条件过期问题。
5. 补齐 `exportRow` 和 `exportDelete` 的错误提示。

## 修复明细

### 1. 删除权限文本残留

修复前模板顶部直接渲染了 `{{ hasPermi }}`，会把权限字符串显示到页面。

修复后已删除该调试残留，只保留权限指令：

```vue
<VButton type="" @click="open" v-hasPermi="[hasPermi]">
```

### 2. 组件名统一

修复前组件声明仍为：

```vue
<script setup name="DerivedCenter">
```

修复后改为：

```vue
<script setup name="ExportCenter">
```

同时将组件内部错误日志前缀从 `[DerivedCenter]` 统一改为 `[ExportCenter]`。

### 3. 保存模板字段顺序

保存模板时已改为使用排序后的字段：

```js
fields: getSortedSelectedFieldKeys()
```

这样新建模板和更新模板都按左侧字段列表当前排序保存，避免按勾选顺序保存导致回显顺序错乱。

### 4. 查询条件实时获取

组件不再把 `condition` 存到 `form.value` 中。

当前统一通过 `getLatestCondition()` 实时从父组件获取：

```js
const getLatestCondition = () => props.getFormData?.() || {}
```

创建导出记录时统一走 `buildExportRecordParams()`：

```js
const buildExportRecordParams = (extra = {}) => {
  return {
    ...form.value,
    condition: getLatestCondition(),
    ...extra,
    module: extra.tag_name || props.tag_name,
  }
}
```

因此默认导出、模板导出、slot 暴露的 `outerExport` 都能拿到最新查询条件。

### 5. 错误提示补齐

`exportRow` 失败时已补齐控制台日志和页面提示：

```js
console.error("[ExportCenter] 模板导出失败:", e)
ElMessage.error("导出失败")
```

`exportDelete` 现在只在用户取消或关闭确认框时静默，接口异常会提示用户：

```js
if (e === "cancel" || e === "close") return
console.error("[ExportCenter] 删除模板失败:", e)
ElMessage.error("删除模板失败")
```

## 当前状态

P0 项已全部修复。

## P1 处理进展与建议

### 已修复

1. 已删除未使用的 `EMPTY_INDEX`。
2. 已明确 `home_system` 优先级：优先使用父组件传入的 `props.home_system`，未传时再使用 `GlobalConfig.derived.home_system` 兜底。

### 修改建议

3. `buildExportRecordParams` 参数覆盖边界建议继续收敛。

   当前 `buildExportRecordParams` 使用 `...form.value` 和 `...extra` 合并，`extra` 可以覆盖内部字段。建议后续改成显式字段组装，只允许调用方覆盖明确支持的参数，例如 `config_id`、`fields`、`title`、`tpl_id`、`tag_name`，避免意外覆盖 `condition`、`config_name` 等内部字段。

4. API 方法命名建议统一。

   当前 `api.js` 中存在 `exportRord`、`exporttpl` 这类命名不统一或拼写错误的方法。建议后续新增语义清晰的小驼峰方法名，例如 `createExportRecord`、`createExportTemplate`、`updateExportTemplate`、`deleteExportTemplate`，再逐步替换组件内调用。若担心影响其他调用方，可以先在 `api.js` 保留旧方法别名，组件内部优先使用新方法。
