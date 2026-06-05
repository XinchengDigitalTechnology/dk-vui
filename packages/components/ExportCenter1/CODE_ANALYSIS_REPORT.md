# ExportCenter1 代码分析报告

## 1. 组件定位

`ExportCenter1` 是一个面向业务模块的导出中心组件，核心能力包括：

- 打开导出弹窗并加载当前模块的导出配置。
- 展示可导出字段，支持字段勾选和上下移动排序。
- 支持保存、选择、更新、删除导出模板。
- 支持按模板导出、默认字段导出、外部自定义按钮导出。
- 支持把模板交给 `ScheduledExport` 组件创建定时导出任务。

当前代码已经从原先的大组件拆成入口组件、两个展示子组件、两个逻辑 composable 和一个接口封装文件，整体职责边界比单文件实现清晰。

## 2. 文件职责

### `index.vue`

主组件入口，负责声明 props、slot、事件，以及组合页面结构。

主要职责：

- 渲染导出按钮和 `el-dialog` 弹窗。
- 组合 `ExportFieldList`、`ExportTemplateList`、`ScheduledExport`。
- 通过 `useExportCenter` 获取弹窗状态、字段状态、导出动作等。
- 通过 `useExportTemplate` 获取模板选择、保存、更新、删除、定时导出等动作。
- 判断是否传入 `importBtn` slot，允许业务方自定义导出按钮区域。

### `ExportFieldList.vue`

字段列表子组件。

主要职责：

- 渲染左侧字段表格。
- 接收 `fields` 字段数组。
- 通过 Element Plus selection 列维护字段勾选。
- 通过“上移 / 下移”改变字段顺序。
- 暴露 `clearSelection`、`toggleRowSelection`、`setScrollTop` 给父级或 composable 使用。

### `ExportTemplateList.vue`

模板列表子组件。

主要职责：

- 渲染右侧模板表格。
- 点击模板名称触发模板选择。
- 当当前模板字段发生变化时展示“保存”入口。
- 触发模板导出、定时导出、删除。
- 通过 `creator_id == userId` 控制删除入口，只允许当前用户删除自己创建的模板。

### `useExportCenter.js`

导出中心核心状态与默认导出逻辑。

主要职责：

- 管理弹窗状态：`visible`、`loading`。
- 管理导出配置：`form`、`exportFields`、`templates`。
- 管理当前字段选择：`multipleSelection`。
- 管理模板编辑态：`handleTemplateRow`。
- 获取导出配置：`getTemplateConfig`、`getTemplate`。
- 统一生成导出参数：`buildExportRecordParams`。
- 统一生成导出标题：`buildExportTitle`。
- 执行默认导出：`handleImport`。
- 执行外部导出：`outerExport`。
- 关闭弹窗并清理状态：`handleBeforeClose`。

### `useExportTemplate.js`

模板操作逻辑。

主要职责：

- 选择模板并回显字段：`selectField`。
- 保存新模板：`saveTemplate`。
- 更新已有模板：`updateTemplate`。
- 按模板导出：`exportRow`。
- 删除模板：`exportDelete`。
- 打开定时导出：`openScheduledExport`。

### `api.js`

导出相关 API 封装。

主要接口：

- `exportTemplateOne`：获取模块导出配置。
- `exportRord`：创建导出记录。
- `exporttpl`：新增导出模板。
- `exportTemplateUpdate`：编辑导出模板。
- `exportTemplateDelete`：删除导出模板。
- `export_cron`、`drop_down`：定时导出或枚举相关接口。

## 3. 核心数据流

### 3.1 打开弹窗

1. 用户点击默认导出按钮。
2. `open()` 校验 `tag_name`。
3. 设置 `visible = true`。
4. 调用 `getTemplate()`。
5. `getTemplate()` 请求 `/export_config/one`。
6. 接口返回后写入：
   - `form.config_id`
   - `form.config_name`
   - `templates`
   - `exportFields`

此时弹窗展示字段列表和模板列表。

### 3.2 字段选择与排序

字段选择由 `ExportFieldList` 内部 `el-table` 触发：

1. 用户勾选字段。
2. 子组件触发 `selection-change`。
3. 父组件调用 `handleSelectionChange`。
4. `multipleSelection` 更新为当前选择字段。
5. 如果当前处于某个模板编辑上下文，则标记 `handleTemplateRow.change = true`。

字段排序由“上移 / 下移”触发：

1. `ExportFieldList.moveField(index, direction)` 计算目标位置。
2. 超出边界时提示不可移动。
3. 复制 `props.fields` 并调整数组顺序。
4. emit `fields-change`。
5. 父组件更新 `exportFields`。
6. 如果当前处于模板编辑上下文，则标记模板发生变化。

### 3.3 默认导出

1. 用户点击默认“导出”按钮。
2. `handleImport()` 校验是否选择字段，同时防止 loading 期间重复提交。
3. 调用 `buildExportRecordParams()` 生成参数。
4. `condition` 通过 `getLatestCondition()` 实时调用父组件 `getFormData()` 获取。
5. 调用 `api.exportRord()` 创建导出记录。
6. 成功后提示并触发 `callback`。

默认导出的字段来自当前勾选项：

```js
const getSelectedFieldKeys = () => multipleSelection.value.map((field) => field?.field_key).filter(Boolean)
```

### 3.4 保存模板

1. 用户输入模板名称。
2. 用户勾选字段并调整顺序。
3. 点击“保存模版”。
4. `saveTemplate()` 校验字段选择、模板名称、名称重复。
5. 使用 `getSortedSelectedFieldKeys()` 按左侧字段列表顺序生成字段 key。
6. 调用 `api.exporttpl()`。
7. 保存成功后清空输入框，并重新拉取模板配置。

这里字段顺序以 `exportFields` 当前展示顺序为准，而不是以勾选顺序为准，符合用户看到什么顺序就保存什么顺序的预期。

### 3.5 选择模板

1. 用户点击模板名称。
2. `selectField(row, index)` 清空旧选择。
3. 根据 `row.fields` 找到对应字段对象。
4. 调用 `toggleRowSelection` 回显勾选。
5. 按模板字段顺序重排 `exportFields`。
6. 记录当前编辑模板行 index，并将 `change` 设置为 false。

选择模板后，如果用户继续勾选或排序字段，会触发 `markTemplateChanged()`，右侧对应模板行展示“保存”。

### 3.6 更新模板

1. 选择模板后修改字段选择或排序。
2. 当前模板行展示“保存”入口。
3. 点击保存后调用 `updateTemplate(row)`。
4. 校验字段选择。
5. 组装模板 id、名称、字段 key。
6. 调用 `api.exportTemplateUpdate()`。
7. 成功后重置编辑态并重新获取模板配置。

### 3.7 模板导出

1. 用户点击模板行“导出”。
2. `exportRow(row)` 调用 `buildExportRecordParams()`。
3. 参数中传入 `tpl_id`，`fields` 传空数组。
4. 后端根据模板 id 识别模板字段。
5. 成功后触发 `callback`。

### 3.8 定时导出

1. 当 `schedule = true` 时，模板操作列展示“定时导出”。
2. 点击后执行 `openScheduledExport(row)`。
3. 传给 `ScheduledExport` 的数据为模板行数据加最新 `condition`。

```js
scheduledExportRef.value?.open({ ...row, condition: getLatestCondition() })
```

### 3.9 外部导出

业务方可通过 `importBtn` slot 获取 `outerExport`：

```vue
<template #importBtn="{ outerExport }">
  <el-button @click="outerExport('module_tag', '导出名称', 'all')">
    导出全部
  </el-button>
</template>
```

外部导出逻辑：

1. 根据传入 `module` 重新请求模块导出配置。
2. 如果 `type === "all"`，使用该模块全部字段。
3. 否则使用当前弹窗内已选择字段。
4. 调用 `/export_record` 创建导出记录。

## 4. 关键设计点

### 4.1 查询条件不缓存

`condition` 每次导出、保存模板、定时导出时都通过 `props.getFormData()` 获取：

```js
const getLatestCondition = () => props.getFormData?.() || {}
```

这个设计可以避免父组件筛选条件变化后，导出中心仍使用旧条件。

### 4.2 导出参数集中构造

`buildExportRecordParams()` 统一生成导出记录参数，且只允许指定字段覆盖：

- `config_id`
- `fields`
- `title`
- `tpl_id`
- `tag_name`

这样可以减少不同导出入口参数不一致的问题，也避免调用方随意覆盖 `condition`、`config_name` 等内部字段。

### 4.3 字段顺序按展示顺序保存

模板保存和更新使用 `getSortedSelectedFieldKeys()`：

```js
const fieldOrderMap = new Map(getCurrentFieldOrder().map((key, index) => [key, index]))
return getSelectedFieldKeys().sort((a, b) => (fieldOrderMap.get(a) ?? 0) - (fieldOrderMap.get(b) ?? 0))
```

这保证保存出来的模板字段顺序与左侧表格展示顺序一致。

### 4.4 模板编辑态独立维护

`handleTemplateRow` 记录当前选中的模板行和是否发生变化：

```js
const handleTemplateRow = ref({
  index: "",
  change: false,
})
```

只有选中过模板，并且字段勾选或排序发生变化时，模板行才展示“保存”。

## 5. 当前优点

- 职责拆分比较清楚，`index.vue` 已经从业务逻辑集中承载者变成组合入口。
- 字段列表和模板列表都是展示型组件，逻辑相对简单。
- 导出参数集中构造，降低多个导出入口参数漂移的风险。
- `condition` 实时获取，能覆盖父组件筛选条件变化场景。
- 接口返回数组通过 `toArray` 做了兜底，减少空值导致的运行时错误。
- 关闭弹窗时会清理字段、模板、选择、loading、编辑态等状态，避免旧数据残留。
- 模板删除入口按创建人控制，有基础权限隔离意识。

## 6. 风险点与问题

### 6.1 `home_system` 的全局兜底实际可能不会生效

`props.home_system` 在 `index.vue` 中默认值是 `3`：

```js
home_system: { type: Number, default: 3 },
```

而 `getHomeSystem()` 使用的是空值合并：

```js
const getHomeSystem = () => props.home_system ?? GlobalConfig.derived?.home_system ?? 0
```

因为 props 默认值已经是 `3`，父组件不传时 `props.home_system` 也是 `3`，所以 `GlobalConfig.derived?.home_system` 基本不会作为“未传兜底”生效。

如果预期是“父组件传参优先，未传时使用全局配置”，可以考虑取消 props 默认值，或者明确接受当前默认固定为 `3` 的行为。

### 6.2 `outerExport` 在非 `all` 场景没有字段选择校验

默认导出会调用 `validateSelectedFields()`，但 `outerExport(module, moduleName, type)` 在 `type !== "all"` 时直接使用当前勾选字段：

```js
fields: type === "all" ? allFieldKeys : getSelectedFieldKeys(),
```

如果外部按钮在未勾选字段时调用非 `all` 导出，可能会提交空字段数组。是否允许空字段数组取决于后端语义，如果不允许，建议增加校验。

### 6.3 `outerExport` 的语义依赖弹窗内部选择

`outerExport` 名义上是外部导出，但 `type !== "all"` 时依赖当前弹窗里的 `multipleSelection`。如果业务方在弹窗未打开、字段未加载、用户未选择字段时调用，结果可能为空。

建议明确约定：

- `outerExport(..., "all")` 用于不依赖弹窗状态的全字段导出。
- 非 `all` 场景必须先打开弹窗并选择字段。

或者把外部导出接口设计成显式传入字段数组。

### 6.4 API 方法命名不统一且存在拼写问题

当前 API 方法包含：

- `exportRord`
- `exporttpl`
- `export_cron`
- `drop_down`
- `exportTemplateOne`

其中 `exportRord` 疑似应为 `exportRecord`。命名风格混合了小驼峰、下划线和缩写，不利于后续维护。

### 6.5 `window` 全局依赖较多

当前逻辑依赖：

- `window.$httpRequest`
- `window.APP_GETEWAY.dexh`
- `window.userInfo.user`

这让组件和运行环境强绑定。作为业务组件可以接受，但如果希望组件更通用，后续可考虑通过配置、provide/inject 或参数注入降低全局耦合。

### 6.6 `navPersonal` 仍是空实现

`index.vue` 中“个人中心”链接目前没有实际跳转逻辑：

```js
const navPersonal = () => {
  // action.setGlobalState(...)
}
```

这会导致用户点击提示中的“个人中心”没有效果。若当前功能要求用户从这里查看导出结果，需要补齐跳转逻辑。

### 6.7 README 描述与代码存在轻微不一致

`README.md` 中提到 `ExportFieldList.vue` 负责“拖拽排序”，但实际代码是通过“上移 / 下移”链接调整顺序，不是拖拽。

建议把文档描述改为“字段排序”或“上移 / 下移排序”。

## 7. 可优化建议

### 7.1 明确外部导出 API 契约

建议把 `outerExport` 的调用约束写清楚，尤其是 `type` 参数：

- `type === "all"`：按指定模块全部字段导出。
- 其他值：按当前已勾选字段导出，需要先有字段选择。

如果希望外部导出完全不依赖弹窗状态，可以把函数签名改成接收字段数组：

```js
outerExport({ module, moduleName, fields, all })
```

### 7.2 统一 API 命名

建议后续单独做一次低风险重命名：

- `exportRord` -> `createExportRecord`
- `exporttpl` -> `createExportTemplate`
- `exportTemplateUpdate` -> `updateExportTemplate`
- `exportTemplateDelete` -> `deleteExportTemplate`
- `exportTemplateOne` -> `getExportConfig`

### 7.3 处理 `home_system` 兜底策略

如果确实需要全局配置兜底，可改为：

```js
home_system: { type: Number, default: undefined }
```

如果业务默认就是 `3`，则可以删掉 `GlobalConfig` 兜底逻辑，减少误解。

### 7.4 补齐个人中心跳转

根据项目实际路由体系选择一种实现：

- 如果是微前端，通过全局状态切换。
- 如果是 Vue Router，通过 `router.push`。
- 如果是外部系统，通过统一导航工具函数。

### 7.5 增加关键路径测试或回归清单

建议至少覆盖：

- 打开弹窗加载字段和模板。
- 不选字段时默认导出提示错误。
- 保存模板时字段顺序与左侧展示一致。
- 选择模板后字段勾选和排序正确回显。
- 修改模板字段后仅当前模板行展示“保存”。
- 模板导出携带 `tpl_id` 和最新查询条件。
- 外部 `all` 导出使用目标模块全部字段。
- 关闭弹窗后状态被清空。

## 8. 总体结论

`ExportCenter1` 当前已经完成了比较合理的模块拆分：主组件负责组合，字段列表和模板列表负责 UI，两个 composable 分别承载导出中心状态和模板动作。核心导出参数、查询条件、字段顺序等关键逻辑已经被集中管理，整体可维护性明显好于单文件大组件。

后续主要需要关注的是外部导出的状态依赖、`home_system` 兜底策略、API 命名一致性以及个人中心跳转空实现。这些问题不一定会阻塞当前功能，但会影响组件长期维护和调用方理解，建议在下一轮重构或联调时优先处理。
