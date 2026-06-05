# ExportCenter 代码分析报告

## 1. 组件定位

`ExportCenter` 是一个面向业务模块的导出中心组件，负责：

- 根据 `tag_name` 拉取当前模块的导出配置、字段列表和用户保存的导出模板。
- 支持用户勾选导出字段、调整字段顺序，并发起即时导出。
- 支持保存导出模板、选择模板回显字段、更新模板字段、删除本人创建的模板。
- 可选接入定时导出入口，将模板和当前页面查询条件传给 `ScheduledExport`。
- 可通过 `importBtn` 插槽让外部接管导出按钮区域，并暴露 `outerExport` 供外部按钮调用。

该组件依赖 ERP 运行时环境中的全局能力：

- `window.$httpRequest`
- `window.APP_GETEWAY.dexh`
- `window.userInfo.user`
- `GlobalConfig.derived.home_system`
- `GlobalConfig.action.setGlobalState`

## 2. 文件职责

| 文件 | 职责 |
| --- | --- |
| `index.vue` | 组件入口，组织弹窗 UI、字段列表、模板列表、定时导出弹窗，并连接两个 composable。 |
| `useExportCenter.js` | 管理弹窗基础状态、配置加载、字段选择、即时导出、关闭清理、外部导出。 |
| `useExportTemplate.js` | 管理模板选择、模板保存、模板更新、模板导出、模板删除、打开定时导出。 |
| `ExportFieldList.vue` | 左侧字段表格，负责字段勾选、字段上下移动、暴露表格选择相关方法。 |
| `ExportTemplateList.vue` | 右侧模板表格，负责展示模板名称、保存入口、导出、定时导出、删除入口。 |
| `api.js` | 封装导出配置、导出记录、模板增删改查等接口。 |
| `../ScheduledExport/index.vue` | 定时导出弹窗，`ExportCenter` 通过 ref 调用其 `open` 方法。 |

## 3. 核心数据模型

### Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `schedule` | `Boolean` | `false` | 是否展示模板行上的“定时导出”入口。 |
| `scheduleOption` | `Array` | `[]` | 透传给 `ScheduledExport` 的导出范围配置。 |
| `home_system` | `Number` | `undefined` | 查询导出配置时使用的系统标识；未传时取全局配置。 |
| `tag_name` | `String` | `""` | 当前业务模块标识，加载导出配置时必填。 |
| `titleAppend` | `String` | `""` | 导出标题后缀。 |
| `hasPermi` | `String` | `""` | 传给 `v-hasPermi` 的权限码。 |
| `getFormData` | `Function` | `() => {}` | 每次导出、保存模板或打开定时导出时获取当前页面查询条件。 |

### 内部状态

| 状态 | 来源 | 说明 |
| --- | --- | --- |
| `visible` | `useExportCenter` | 控制导出中心弹窗显示。 |
| `loading` | `useExportCenter` | 即时导出按钮 loading 和防重复提交状态。 |
| `form.config_id` | 接口 `/export_config/one` | 当前导出配置 ID。 |
| `form.config_name` | 接口 `/export_config/one` | 当前导出配置名称，用于默认导出标题。 |
| `exportFields` | 接口 `/export_config/one` | 左侧字段列表，字段对象至少需要包含 `field_key`、`field_name`。 |
| `multipleSelection` | `ExportFieldList` 事件 | 当前勾选的字段对象列表。 |
| `exportName` | 输入框 | 新增导出模板名称。 |
| `templates` | 接口 `/export_config/one` | 右侧模板列表。 |
| `handleTemplateRow` | 模板选择和字段变更 | 记录当前选中模板行以及字段是否被改动。 |
| `userId` | `window.userInfo.user.user_id` | 用于判断模板删除权限。 |

## 4. 主要业务流程

### 4.1 打开导出中心

1. 用户点击入口按钮触发 `open()`。
2. 若缺少 `tag_name`，提示“缺少必要参数”并中断。
3. 设置 `visible = true`。
4. 调用 `getTemplate()` 请求 `/export_config/one`。
5. 用接口返回值更新：
   - `form.config_id`
   - `form.config_name`
   - `templates`
   - `exportFields`

接口返回为空时，`toArray` 会将模板和字段兜底成空数组，避免后续数组操作报错。

### 4.2 字段选择和排序

`ExportFieldList.vue` 接收 `fields` 并渲染 `el-table`：

- 勾选变化时触发 `selection-change`，父层更新 `multipleSelection`。
- 点击“上移/下移”时复制 `props.fields`，调整数组顺序后触发 `fields-change`。
- 父层将新的字段顺序写回 `exportFields`。
- 如果当前已经选中过模板，字段勾选或排序变化会将 `handleTemplateRow.change` 标记为 `true`，模板行显示“保存”入口。

字段排序影响模板保存时的字段顺序。`getSortedSelectedFieldKeys()` 会按当前左侧字段列表顺序重新排序已选字段 key，避免只按勾选顺序保存导致模板恢复后排序错误。

### 4.3 即时导出

默认导出按钮触发 `handleImport()`：

1. 调用 `validateSelectedFields()`，没有勾选字段时提示“至少勾选一条导出项”。
2. 如果 `loading` 为 `true`，直接中断，避免重复提交。
3. 构造导出参数：
   - `config_id`
   - `config_name`
   - `condition`: 每次调用 `props.getFormData()` 获取最新查询条件
   - `fields`: 当前勾选字段 key
   - `title`: `config_name + 当前用户 realname + titleAppend`
   - `module`: `props.tag_name`
4. 调用 `api.exportRord()` 提交到 `/export_record`。
5. 成功后提示接口消息，并触发 `callback` 事件。
6. 无论成功失败，最终释放 `loading`。

### 4.4 保存新模板

`saveTemplate()` 的校验和提交逻辑：

1. 必须至少勾选一个字段。
2. 模板名称取 `exportName.trim()`，不能为空。
3. 模板名称不能和当前 `templates` 中已有 `name` 重复。
4. 调用 `api.exporttpl()` 提交：
   - `config_id`
   - `name`
   - `fields`: 按当前字段列表顺序排序后的已选字段 key
   - `condition`: 当前页面查询条件
5. 成功后清空 `exportName` 并重新调用 `getTemplate()` 刷新模板和字段配置。

### 4.5 选择和更新模板

点击模板名称触发 `selectField(row, index)`：

1. 清空左侧旧勾选，避免模板字段叠加。
2. 根据模板 `fields` 中保存的字段 key 回显左侧勾选状态。
3. 按模板字段顺序重排 `exportFields`，模板中没有包含的字段保留在列表后方。
4. 记录当前模板行 index，并将 `change` 置为 `false`。

当用户在选择模板后继续调整字段或排序，`handleTemplateRow.change` 会变为 `true`，模板表格该行展示“保存”。

点击该“保存”触发 `updateTemplate(row)`：

- 必须至少勾选一个字段。
- 调用 `api.exportTemplateUpdate()` 更新模板 `fields`。
- 成功后将当前模板的变更状态置回 `false`，并重新拉取模板配置。

### 4.6 模板导出

模板行的“导出”触发 `exportRow(row)`：

- 调用 `/export_record` 新增导出记录。
- 参数中带 `tpl_id`，`fields` 传空数组。
- 标题为 `模板名称 + 当前用户 realname + titleAppend`。
- 成功后触发 `callback`。

这里的设计表示：使用模板导出时，后端通过 `tpl_id` 识别模板字段，前端不重复传字段列表。

### 4.7 删除模板

只有 `row.creator_id == userId` 时才展示“删除”按钮。

删除流程：

1. 弹出二次确认：“删除该导出模板将同步删除模板的定时导出任务，是否确认删除？”
2. 用户确认后调用 `api.exportTemplateDelete(row.tpl_id)`。
3. 成功后重新调用 `getTemplate()` 刷新模板列表。
4. 用户取消或关闭确认框时静默返回。

### 4.8 定时导出

当 `schedule = true` 时，模板行展示“定时导出”。

点击后 `openScheduledExport(row)` 调用：

```js
scheduledExportRef.value?.open({ ...row, condition: getLatestCondition() })
```

也就是说，定时导出新增任务时会拿到：

- 当前模板信息，如 `tpl_id`、`name`
- 当前页面最新查询条件 `condition`

`ScheduledExport` 内部会根据 `scheduleOption` 从 `condition` 中识别可配置的导出范围字段，并负责下拉选项加载、表单校验和任务提交。

### 4.9 外部导出插槽

如果父组件传入 `#importBtn` 插槽，默认导出按钮不会渲染，插槽会收到：

```js
{ outerExport }
```

`outerExport(module, moduleName, type = "")` 的行为：

- 重新按传入 `module` 调用 `/export_config/one` 获取导出配置。
- `type === "all"` 时导出该模块的全部字段。
- 其他情况下导出当前左侧已勾选字段。
- 导出标题为 `moduleName + 当前用户 realname + titleAppend`。
- 导出参数中的 `module` 和 `tag_name` 均使用传入的 `module`。

## 5. 接口清单

| 方法 | HTTP | URL | 用途 |
| --- | --- | --- | --- |
| `drop_down(id)` | `GET` | `/export_tpl/:id` | 获取模板枚举数据；当前 `ExportCenter` 未直接使用。 |
| `export_cron(data)` | `POST` | `/export_cron` | 新增定时导出任务；当前 `ExportCenter` 未直接使用。 |
| `exportRord(data)` | `POST` | `/export_record` | 新增导出记录。 |
| `exporttpl(data)` | `POST` | `/export_tpl` | 新增导出模板。 |
| `exportTemplateUpdate(data)` | `PUT` | `/export_tpl/:id` | 编辑导出模板。 |
| `exportTemplateOne(params)` | `GET` | `/export_config/one` | 获取指定模块的导出配置、字段和模板。 |
| `exportTemplateDelete(id)` | `DELETE` | `/export_tpl/:id` | 删除导出模板。 |

## 6. 事件和插槽

### Events

| 事件 | 触发时机 |
| --- | --- |
| `callback` | 即时导出成功、模板导出成功后触发。 |

### Slots

| 插槽 | Slot Props | 说明 |
| --- | --- | --- |
| `importBtn` | `{ outerExport }` | 外部接管默认导出按钮区域。传入后默认导出按钮和默认提示布局被替换。 |

## 7. 关键设计点

1. `condition` 不做组件内缓存，每次导出、保存模板、打开定时导出时都调用 `getFormData()`，确保拿到父页面最新查询条件。
2. 模板编辑态只在“先选中模板，再改变字段勾选或排序”后出现，避免用户未明确选择模板时误更新模板。
3. 保存模板和更新模板都使用左侧字段当前顺序作为最终字段顺序。
4. 关闭弹窗时调用 `clearExportCenterData()`，主动释放字段、模板列表、选择状态和 loading。
5. `buildExportRecordParams()` 只允许明确字段覆盖，避免调用方意外覆盖 `condition`、`config_name` 等内部参数。

## 8. 风险点和注意事项

| 风险点 | 说明 | 建议 |
| --- | --- | --- |
| `tag_name` 必填 | 缺少时无法拉取导出配置。 | 接入时必须传业务模块唯一标识。 |
| `getFormData` 默认返回 `undefined` | 当前代码用 `props.getFormData?.() || {}` 兜底。 | 父组件建议始终返回普通对象。 |
| `outerExport` 非 `all` 模式依赖当前勾选字段 | 如果外部按钮在用户未勾选时调用，会传空字段数组。 | 外部使用时根据业务决定是否先校验勾选字段。 |
| 模板导出传 `fields: []` | 依赖后端通过 `tpl_id` 找模板字段。 | 后端接口必须支持该协议。 |
| 删除权限只控制前端展示 | 只对本人创建模板展示删除按钮。 | 后端仍需校验删除权限。 |
| `window.userInfo` 等全局对象强依赖 | 组件不是纯独立组件。 | 仅在 ERP 宿主环境内使用。 |
| `api.js` 中 `exportRord` 命名疑似拼写错误 | 实际使用稳定，但语义上应为 `exportRecord`。 | 如需改名，应同时兼容所有调用处。 |

## 9. 可维护性建议

- 如果后续继续扩展导出能力，优先在 `useExportCenter.js` 放通用导出状态和参数构造，在 `useExportTemplate.js` 放模板行为，避免入口组件重新变胖。
- 如果要新增模板重命名、模板复制等能力，应优先复用 `getSortedSelectedFieldKeys()`、`getLatestCondition()` 和 `getTemplate()`。
- 如果要补测试，建议重点覆盖：
  - `getSortedSelectedFieldKeys()` 对排序的处理。
  - `selectField()` 的勾选回显和字段重排。
  - `handleImport()` 的参数构造和防重复提交。
  - `saveTemplate()` 的空名称、重名、空字段校验。

