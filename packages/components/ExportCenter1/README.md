# ExportCenter 组件说明

`ExportCenter` 是围绕业务模块导出配置封装的导出中心组件，支持字段选择、字段排序、模板保存、模板更新、模板删除、模板导出、定时导出和外部自定义导出按钮。

## 文件组成

- `index.vue`：主组件入口，负责弹窗布局和组合字段列表、模板列表、定时导出等能力。
- `ExportFieldList.vue`：字段列表子组件，负责字段展示、选择和拖拽排序。
- `ExportTemplateList.vue`：模板列表子组件，负责模板展示和模板行操作入口。
- `useExportCenter.js`：导出中心状态、导出参数组装、默认导出和外部导出逻辑。
- `useExportTemplate.js`：模板选择、保存、更新、删除、模板导出和定时导出逻辑。
- `api.js`：导出相关接口封装。

## Props

- `schedule`：是否展示定时导出入口，默认 `false`。
- `scheduleOption`：传给 `ScheduledExport` 的配置数组，默认 `[]`。
- `home_system`：系统来源，默认 `3`。当前逻辑优先使用父组件传入值，未传时使用全局配置兜底。
- `tag_name`：导出模块标识，打开导出弹窗时必填。
- `titleAppend`：导出标题后缀，默认空字符串，会拼在 `buildExportTitle` 生成结果最后。
- `hasPermi`：导出按钮权限标识。
- `getFormData`：父组件传入的查询条件获取函数，导出、保存模板和定时导出时都会实时调用。

## Slots 与事件

- `importBtn`：自定义导出按钮区域。组件通过作用域插槽暴露 `outerExport`，父组件可不打开弹窗直接触发导出。
- `callback`：导出成功后触发。

```vue
<template #importBtn="{ outerExport }">
  <el-button type="primary" @click="outerExport('module_tag', '导出名称', 'all')">
    导出全部
  </el-button>
</template>
```

## 导出流程

### 默认导出

父组件传入 `tag_name` 和 `getFormData` 后，用户点击组件默认按钮会打开“导出中心”弹窗：

- 校验 `tag_name`。
- 调用 `/export_config/one` 获取字段配置和模板配置。
- 用户勾选字段后点击“导出”。
- 通过 `buildExportRecordParams` 组装导出参数，并调用 `/export_record`。
- 导出成功后触发 `callback`。

### 模板导出

模板列表支持以下能力：

- `selectField`：点击模板名称后回显模板字段。
- `saveTemplate`：将当前字段选择保存为新模板。
- `updateTemplate`：字段变化后更新当前模板。
- `exportRow`：按指定模板直接导出。
- `exportDelete`：删除当前用户创建的模板。

### 定时导出

当 `schedule` 为 `true` 时，模板操作列展示“定时导出”。点击后打开 `ScheduledExport`，并透传当前模板和最新查询条件。

### 外部导出

`outerExport(module, moduleName, type)` 用于自定义按钮导出：

- 根据 `module` 重新获取导出配置。
- 当 `type === "all"` 时导出该模块全部字段。
- 其他情况导出当前已勾选字段。
- 查询条件始终通过 `getFormData()` 实时获取。

## 内部实现约定

### 查询条件

`condition` 不缓存在组件状态中，统一通过 `getLatestCondition()` 获取：

```js
const getLatestCondition = () => props.getFormData?.() || {}
```

这样默认导出、模板导出、外部导出和定时导出都能拿到父组件最新筛选条件。

### 导出标题

导出标题由模板名或模块名、当前用户姓名和 `titleAppend` 组成：

```js
const buildExportTitle = (name = "") => `${name || ""}${currentUser.value.realname || ""}${props.titleAppend}`
```

### 导出参数

`buildExportRecordParams` 只开放明确支持的覆盖项：

- `config_id`
- `fields`
- `title`
- `tpl_id`
- `tag_name`

`condition`、`config_name` 等内部字段由组件统一生成，避免调用方通过任意对象展开误覆盖核心字段。

### 字段顺序

模板保存和模板更新都使用 `getSortedSelectedFieldKeys()`，字段顺序以当前左侧字段列表展示顺序为准，避免勾选顺序和用户看到的排序不一致。

## 已完成优化

- 字段列表已拆到 `ExportFieldList.vue`。
- 新增 `toArray` 兜底接口返回值，避免空值导致数组操作报错。
- 新增 `validateSelectedFields`，导出和保存模板前统一校验字段选择。
- 新增 `getLatestCondition`，导出相关动作统一实时获取查询条件。
- `buildExportRecordParams` 已收敛为白名单参数，避免覆盖内部字段。
- `home_system` 已调整为父组件传参优先。
- 新增 `titleAppend`，支持在导出标题最后追加自定义后缀。
- 已拆出 `ExportTemplateList.vue`、`useExportCenter.js`、`useExportTemplate.js`，降低 `index.vue` 复杂度。
- `exportRow`、`exportDelete`、`outerExport` 等关键动作已补充错误提示。

## 后续建议

- `importBtn` 命名容易误解，后续可考虑新增更语义化的 slot 名称，并评估兼容策略。
- `navPersonal` 当前仍是空实现，个人中心跳转需要结合项目路由或微前端通信补齐。
- API 方法名可统一为小驼峰，例如 `exportRecord`、`createExportTemplate`、`updateExportTemplate`、`deleteExportTemplate`。
- 若继续增强组件能力，可继续把接口返回结构、导出参数结构整理为 JSDoc 或 TypeScript 类型。
- 全局依赖可逐步改成显式注入，例如用户信息、请求实例、网关配置和权限能力。
