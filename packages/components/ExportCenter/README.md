# DerivedCenter 导出中心组件

## 功能说明

导出中心弹窗组件，用于统一处理业务模块的字段导出、导出模板保存、模板导出和定时导出入口。组件会根据业务模块 `tag_name` 拉取导出配置，并支持用户按需勾选字段、调整字段顺序、保存为个人模板。

---

## 适用场景

- 页面需要按模块配置导出字段。
- 页面需要保存常用导出字段组合。
- 页面需要复用“个人中心查看导出结果”的统一交互。
- 页面需要在导出模板基础上发起定时导出任务。

---

## 依赖

| 依赖项 | 说明 |
|--------|------|
| `window.APP_GETEWAY.dexh` | 接口地址（必须配置） |
| `window.$httpRequest` | 项目统一请求方法 |
| `window.userInfo.user` | 当前用户信息，用于导出标题和权限判断 |
| `GlobalConfig.derived.home_system` | 导出配置所属系统标识，未配置时默认传 `0` |
| Element Plus | UI 框架 |
| `VScheduledExport` | 定时导出弹窗组件 |

---

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `schedule` | `Boolean` | `false` | 是否显示模板行的“定时导出”入口 |
| `scheduleOption` | `Array` | `[]` | 定时导出范围选项，透传给 `VScheduledExport` |

---

## Events

| 事件名 | 说明 |
|--------|------|
| `callback` | 导出成功后触发，用于父组件刷新列表或提示 |
| `query` | 保留事件名，兼容历史接入 |

---

## Expose 方法

### `open(params)`

打开导出中心并按模块拉取导出配置。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `params.tag_name` | `String` | 是 | 导出模块 key |
| `params.condition` | `Object` | 否 | 当前页面查询条件，会随模板或定时导出提交 |
| `params.importBtnSlot` | `String` | 否 | 自定义导出按钮插槽名称 |

### `outerExport(module, moduleName, type)`

不打开弹窗，直接由父组件触发导出。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `module` | `String` | 是 | 导出模块 key |
| `moduleName` | `String` | 是 | 导出标题前缀 |
| `type` | `String` | 否 | 传 `'all'` 时导出接口返回的全部字段，否则导出当前已勾选字段 |

---

## 使用示例

```vue
<template>
  <div>
    <el-button type="primary" @click="openExportCenter">打开导出中心</el-button>

    <VDerivedCenter
      ref="derivedCenterRef"
      :schedule="true"
      :schedule-option="scheduleOptions"
      @callback="handleExportSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from "vue"

const derivedCenterRef = ref()

const scheduleOptions = [
  { label: "创建时间", value: "create_time" },
  { label: "更新时间", value: "update_time" },
]

const searchForm = ref({
  create_time: ["2026-01-01", "2026-01-31"],
})

const openExportCenter = () => {
  derivedCenterRef.value?.open({
    tag_name: "demo_module",
    condition: searchForm.value,
  })
}

const handleExportSuccess = () => {
  // 可在这里刷新导出记录或给出业务提示
}
</script>
```

---

## 自定义导出按钮

当需要替换默认“导出”按钮时，可通过 `open` 传入 `importBtnSlot`，组件会渲染同名插槽。

```vue
<template>
  <VDerivedCenter ref="derivedCenterRef">
    <template #customExport>
      <el-button type="primary" @click="handleCustomExport">自定义导出</el-button>
    </template>
  </VDerivedCenter>
</template>
```

```js
derivedCenterRef.value?.open({
  tag_name: "demo_module",
  condition: searchForm.value,
  importBtnSlot: "customExport",
})
```

---

## API 接口

| 方法 | 接口 | 说明 |
|------|------|------|
| `exportTemplateOne` | `GET /export_config/one` | 获取模块导出字段和模板配置 |
| `exportRord` | `POST /export_record` | 新增导出记录 |
| `exporttpl` | `POST /export_tpl` | 新增导出模板 |
| `exportTemplateUpdate` | `PUT /export_tpl/:id` | 更新导出模板 |
| `exportTemplateDelete` | `DELETE /export_tpl/:id` | 删除导出模板 |
| `drop_down` | `GET /export_tpl/:id` | 获取模板枚举数据 |
| `export_cron` | `POST /export_cron` | 新增定时导出任务 |

---

## 注意事项

1. `open` 必须传入 `tag_name`，否则组件会提示“缺少必要参数”。
2. 导出模板的字段顺序以左侧字段列表为准，移动字段后需要点击模板行内“保存”才会更新模板。
3. 删除模板会同步删除该模板关联的定时导出任务，请确认后再操作。
4. `outerExport` 依赖当前组件状态；如需导出全部字段，请传入 `type: 'all'`。
