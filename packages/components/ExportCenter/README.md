# ExportCenter 组件分析与优化建议

## 组件定位

`ExportCenter` 是一个通用导出中心组件，负责围绕某个业务模块的导出配置完成以下能力：

- 展示导出入口按钮，并通过 `v-hasPermi` 控制权限。
- 打开“导出中心”弹窗，拉取当前模块的导出字段和模板配置。
- 支持字段勾选、字段排序、模板选择、模板保存、模板更新、模板删除。
- 支持按当前字段配置导出，也支持按已保存模板导出。
- 可选接入定时导出能力。
- 通过 `importBtn` 作用域插槽暴露 `outerExport`，供自定义按钮在不打开弹窗时主动导出。

组件当前由三个文件组成：

- `index.vue`：主组件，包含弹窗、模板管理、导出逻辑、slot 方法暴露。
- `ExportFieldList.vue`：字段列表子组件，负责字段展示、选择、排序和表格方法转发。
- `api.js`：导出相关接口封装。

## 当前功能流程

### 默认导出流程

父组件传入 `tag_name` 和 `getFormData`。用户点击“导出”按钮后，组件执行 `open()`：

- 校验 `tag_name` 是否存在。
- 打开弹窗。
- 查询条件不写入 `form`，在导出、保存模板或定时导出时通过 `getFormData()` 实时获取。
- 调用 `/export_config/one` 获取导出配置。
- 渲染字段列表和模板列表。

用户勾选字段后点击弹窗内“导出”，组件会调用 `/export_record` 创建导出记录，参数包含：

- `config_id`
- `config_name`
- `condition`
- `fields`
- `title`
- `module`

导出完成后触发 `callback` 事件。

### 模板流程

模板相关功能包括：

- `saveTemplate`：保存当前字段选择为新模板。
- `selectField`：点击模板名称后，将模板字段回显到左侧字段列表。
- `updateTemplate`：模板字段变化后，保存当前模板的新字段配置。
- `exportRow`：直接按某个模板导出。
- `exportDelete`：删除当前用户创建的模板。

### 定时导出流程

当 `schedule` 为 `true` 时，模板操作列展示“定时导出”入口。点击后调用 `ScheduledExport` 组件的 `open()` 方法，并透传当前模板和查询条件。

### 外部导出流程

`importBtn` 插槽暴露 `outerExport(module, moduleName, type)`：

- 根据传入 `module` 重新获取导出配置。
- 当 `type === "all"` 时，导出该模块全部字段。
- 否则使用当前组件已选择的字段。
- 调用 `/export_record` 创建导出记录。

## 外部参数与依赖

### Props

- `schedule`：是否展示定时导出入口，默认 `false`。
- `scheduleOption`：传给 `ScheduledExport` 的配置数组，默认 `[]`。
- `home_system`：系统来源，默认 `3`。
- `tag_name`：导出模块标识，当前组件打开时的必要参数。
- `hasPermi`：导出按钮权限标识。
- `getFormData`：父组件传入的查询条件获取函数。

### Slots

- `importBtn`：用于替换默认导出按钮区域。当前命名容易误解，因为实际语义是自定义导出按钮，不是导入按钮。

### Emits

- `callback`：导出成功后触发。

### Slot 暴露

- `importBtn`：作用域插槽会传出 `outerExport(module, moduleName, type)`，用于不打开弹窗直接发起导出。

### 全局依赖

组件和接口当前依赖多个全局对象：

- `window.$httpRequest`
- `window.APP_GETEWAY.dexh`
- `window.userInfo.user`
- `GlobalConfig.derived.home_system`
- `v-hasPermi`
- `svg-icon`

这些依赖降低了组件的独立性，组件在新项目、单元测试、Storybook 或独立包环境中复用时需要额外注入运行时上下文。

## 代码结构评价

### 已经改进的地方

- 字段列表已从主组件拆到 `ExportFieldList.vue`，主组件负担有所下降。
- 使用 `computed` 获取当前用户信息和 slot 状态，可读性比旧版更好。
- 增加了 `toArray`、`validateSelectedFields`、`buildExportRecordParams` 等小函数，降低了部分重复逻辑。
- 字段排序时使用 `Map`，模板字段较多时比嵌套查找更稳。
- API 文件集中管理接口，主组件没有直接拼接口路径。

### 当前主要问题

1. `buildExportRecordParams` 使用 `...form.value` 和 `...extra` 合并，`extra` 可以覆盖内部字段，灵活但边界不够清晰。
2. `hasPermi` 默认空字符串时仍传给 `v-hasPermi`，如果权限指令没有处理空值，可能导致按钮异常隐藏或权限判断异常。
3. `navPersonal` 目前为空实现，页面提示“个人中心”可点击，但点击没有效果。
4. API 方法名存在拼写问题，例如 `exportRord` 应为 `exportRecord`，`exporttpl` 风格也不统一。

## 方法优化建议

### 1. 统一字段顺序规则（已修复）

保存模板和更新模板都建议使用同一个字段获取方法：

- 导出当前勾选字段时，可以使用当前表格顺序。
- 保存模板和更新模板时，必须使用当前字段列表顺序。
- 避免 Element Plus selection 返回顺序和用户看到的排序不一致。

已将 `saveTemplate` 中的 `fields: getSelectedFieldKeys()` 改成 `fields: getSortedSelectedFieldKeys()`，新建模板和更新模板现在使用一致的字段顺序规则。

### 2. 优化外部导出参数来源（已修复）

`outerExport` 之前依赖已有的 `form.condition`，但外部直接调用时不一定打开过弹窗，查询条件可能为空或过期。

已改为在 `buildExportRecordParams` 构造导出参数时统一通过 `getLatestCondition()` 获取最新查询条件，不再写入 `form.value`：

```js
const getLatestCondition = () => props.getFormData?.() || {}

const buildExportRecordParams = (extra = {}) => ({
  ...form.value,
  condition: getLatestCondition(),
  ...extra,
  module: extra.tag_name || props.tag_name,
})
```

### 3. 明确组件 API

建议保留一种打开方式，不要同时混用“通过 props 配置”和“通过 open 参数传入配置”两种模式。

当前版本适合定义为 props + 内部按钮驱动：

- `tag_name` 由父组件传入。
- `getFormData` 由父组件传入。
- `open()` 保持为组件内部方法，只负责按钮点击后的弹窗打开和初始化数据，不再通过 `defineExpose` 对外暴露。

如果后续要支持多个模块共用同一个实例，则建议改为：

```js
open({
  tagName,
  condition,
  importBtnSlot,
})
```

两种模式不要同时保留，避免状态来源不清晰。

### 4. 自定义按钮 slot 需要暴露上下文（已修复）

当前 `importBtn` slot 保持原有插槽名不变。组件已通过作用域插槽把 `outerExport` 暴露出去，外部自定义按钮通过该方法触发导出，不需要通过 `defineExpose` 获取组件实例方法。

```vue
<slot
  name="importBtn"
  v-bind="{ outerExport }"
/>
```

### 5. 降低全局依赖

建议逐步把全局依赖改成可注入依赖：

- 用户信息通过 store、composable 或 prop 获取。
- 请求实例通过统一 request 模块引入，而不是直接使用 `window.$httpRequest`。
- 网关地址通过配置模块读取，而不是直接依赖 `window.APP_GETEWAY`。
- `home_system` 的优先级需要明确：是全局配置优先，还是 props 优先。

当前 `getHomeSystem` 使用 `GlobalConfig.derived?.home_system ?? props.home_system ?? 0`，这意味着父组件传入的 `home_system` 可能被全局配置覆盖。若父组件需要强控制，应改为 `props.home_system ?? GlobalConfig.derived?.home_system ?? 0`。

## 组件化封装建议

### 当前拆分程度

`ExportFieldList.vue` 拆分是正确方向，但 `index.vue` 仍同时承担了：

- 弹窗布局。
- 业务参数组装。
- 模板 CRUD。
- 字段选择和排序状态。
- 定时导出入口。
- 外部导出。
- 权限展示。

当后续导出中心功能继续增加时，主组件会再次变胖。

### 推荐拆分方向

可以按职责继续拆分：

- `ExportFieldList.vue`：保留字段列表、排序、选择。
- `ExportTemplateList.vue`：负责模板列表、选择模板、导出模板、删除模板、定时导出入口展示。
- `useExportCenter.js`：管理导出中心状态、字段选择、模板加载、参数构建。
- `useExportTemplate.js`：封装模板保存、更新、删除。
- `api.js`：统一接口命名并补齐类型注释。

如果项目后续会迁移 TypeScript，建议提前把接口返回结构整理成类型：

- `ExportField`
- `ExportTemplate`
- `ExportConfig`
- `ExportRecordPayload`

## 代码风格建议

- 删除未使用的 `EMPTY_INDEX`。
- API 方法名统一小驼峰，例如 `exportRecord`、`createExportTemplate`、`updateExportTemplate`、`deleteExportTemplate`。
- `home_system`、`tag_name` 建议改成前端常用小驼峰 `homeSystem`、`tagName`。如果后端字段必须用下划线，可以只在接口参数转换时使用下划线。
- 错误日志前缀建议统一成 `[ExportCenter]`。
- 文案中的“模版”建议统一为“模板”。
- 行内样式如 `width: 432px`、`z-index: 999` 可以迁移到 class 或 scoped style，降低模板噪声。

## 推荐优先级

### P0：已修复

- 已删除 `{{ hasPermi }}` 页面残留。
- 已将组件名改为 `ExportCenter`。
- 已修复 `saveTemplate` 字段顺序，改用 `getSortedSelectedFieldKeys()`。
- 已修复 `outerExport` 查询条件过期问题，统一通过 `getLatestCondition()` 实时获取。
- 已给 `exportRow` 和 `exportDelete` 补齐错误提示。

### P1：近期优化

- 已删除未使用常量。
- 已明确 `home_system` 的优先级，父组件传参优先。
- 统一 API 方法命名。
- 给外部调用方法改成对象参数，提升可读性和可扩展性。

### P2：结构演进

- 拆出 `ExportTemplateList.vue`。
- 抽出 `useExportCenter` 和 `useExportTemplate`。
- 移除 `window` 强依赖，改为 request/store/config 注入。
- 引入 TypeScript 类型或至少补齐 JSDoc 数据结构。

## 总体结论

当前 `ExportCenter` 已经具备完整导出中心能力，也做了一定组件拆分和工具函数整理，整体可以继续使用。但它仍然偏“业务组件”，对全局环境、后端字段、权限指令和用户信息依赖较强，独立复用性一般。

如果只是当前业务线内复用，建议优先处理 P0 问题，成本低、收益明显。如果目标是沉淀为真正的通用组件，则需要继续拆分模板列表、抽离状态逻辑，并把外部依赖改成显式 props、composable 或配置注入。
