# ExportCenter 重构方案

## 目标

当前 `ExportCenter/index.vue` 同时承担弹窗布局、字段选择、模板列表、模板 CRUD、导出参数组装、定时导出入口和外部导出能力。后续如果继续加能力，主组件会越来越难维护。

本次重构目标是先按职责拆分，不改变外部使用方式：

- 保持 `ExportCenter` 的 props、slot、事件不变。
- 把模板列表相关 UI 和交互拆出到 `ExportTemplateList.vue`。
- 把导出中心状态和参数组装沉淀到 `useExportCenter.js`。
- 把模板保存、更新、删除等接口动作沉淀到 `useExportTemplate.js`。

## 建议文件结构

```txt
ExportCenter/
├── index.vue
├── ExportFieldList.vue
├── ExportTemplateList.vue
├── useExportCenter.js
├── useExportTemplate.js
├── api.js
└── README.md
```

## 文件职责

### `index.vue`

保留组件入口职责：

- 定义 props、emits、slots。
- 负责弹窗整体布局。
- 组合 `ExportFieldList`、`ExportTemplateList`、`ScheduledExport`。
- 调用 composable 暴露的方法完成导出、模板操作和弹窗关闭。

重构后 `index.vue` 不再直接承载大量模板列表逻辑和参数细节，只负责把数据和事件串起来。

### `ExportTemplateList.vue`

负责右侧模板表格：

- 展示模板列表。
- 点击模板名称触发选择模板。
- 展示“保存”入口。
- 触发模板导出。
- 触发定时导出。
- 触发模板删除。

组件建议接收：

- `templates`
- `userId`
- `schedule`
- `editingIndex`
- `isEditingTemplate`

组件建议触发：

- `select`
- `update`
- `export`
- `schedule`
- `delete`

### `useExportCenter.js`

负责导出中心核心状态：

- `visible`
- `loading`
- `form`
- `exportFields`
- `multipleSelection`
- `exportName`
- `templates`
- `handleTemplateRow`

负责核心方法：

- `open`
- `handleClose`
- `getTemplate`
- `getTemplateConfig`
- `getLatestCondition`
- `getHomeSystem`
- `buildExportTitle`
- `buildExportRecordParams`
- `getSelectedFieldKeys`
- `getSortedSelectedFieldKeys`
- `validateSelectedFields`

这里要继续保留当前约定：`condition` 每次通过 `getFormData()` 实时获取，不缓存到 `form`。

### `useExportTemplate.js`

负责模板相关动作：

- `selectField`
- `saveTemplate`
- `updateTemplate`
- `exportRow`
- `exportDelete`
- `openScheduledExport`

这个文件可以依赖 `useExportCenter` 提供的状态和工具方法，也可以由 `index.vue` 把必要上下文传进去。

## 推荐拆分顺序

1. 先拆 `ExportTemplateList.vue`。

   这一步只移动模板表格 UI 和事件，不改业务逻辑。完成后确认选择模板、导出模板、删除模板、定时导出入口都正常。

2. 再抽 `useExportCenter.js`。

   先搬纯状态和纯工具方法，例如 `toArray`、`getLatestCondition`、`buildExportTitle`、`buildExportRecordParams`、字段 key 获取方法。

3. 最后抽 `useExportTemplate.js`。

   等核心状态稳定后，再把模板动作搬出去，避免一次性移动太多导致调试困难。

4. 补充回归验证。

   重点验证默认导出、模板保存、模板更新、模板导出、外部导出、定时导出和关闭弹窗后的状态重置。

## 风险点

- `tableRef` 当前用于清空和回显字段选择，拆分时要明确它仍归 `ExportFieldList` 管理，还是通过 `index.vue` 转发。
- `selectField` 会同时修改字段勾选状态和字段排序，拆分时不要把这两部分拆散。
- `outerExport` 依赖当前字段选择和重新拉取的导出配置，抽 composable 后要确保拿到的仍是最新状态。
- `buildExportRecordParams` 已经收敛为白名单覆盖，后续不要重新引入任意对象展开。
- `condition` 必须继续实时调用 `getFormData()`，不要恢复成缓存字段。

## 验证清单

- 点击默认导出按钮能打开弹窗并加载字段、模板。
- 不选择字段时导出会提示“至少勾选一条导出项”。
- 保存模板时字段顺序和左侧展示顺序一致。
- 选择模板后字段会正确勾选，并按模板字段顺序排序。
- 模板字段变化后只在当前模板行展示“保存”入口。
- 模板导出会带上最新查询条件。
- 外部按钮导出会带上最新查询条件。
- `type === "all"` 时外部导出会导出目标模块全部字段。
- 定时导出会带上当前模板和最新查询条件。
- 关闭弹窗后 `exportName`、字段选择和模板编辑态会重置。

## 可暂缓事项

- API 方法重命名可以单独做，避免和组件拆分混在一起。
- `importBtn` slot 改名需要考虑兼容，建议后续单独评估。
- 全局依赖注入化涉及项目架构，可以等组件职责拆清楚后再推进。
