# ScheduledExport 定时导出组件

## 功能说明

定时导出任务弹窗组件，支持**新增**和**编辑**定时导出任务。用户可配置：
- 导出周期（每周/每月）
- 导出时间点
- 导出范围
- 执行次数

---

## 依赖

| 依赖项 | 说明 |
|--------|------|
| `window.APP_GETEWAY.dexh` | 接口地址（必须配置） |
| Element Plus | UI 框架 |
| VSelect | 自定义下拉组件 |

---

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `scheduleOption` | `Array` | `[]` | 导出范围选项，格式：`[{ label: '显示名', value: '字段名' }]` |

---

## Events

| 事件名 | 说明 |
|--------|------|
| `refresh` | 任务提交成功并关闭弹窗后触发，用于刷新父组件列表 |

---

## Expose 方法

### `open(params, type)`

打开弹窗并初始化数据。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `params.tpl_id` | `String` | ✅ | 模板 ID |
| `params.name` | `String` | 新增时 | 模板名称 |
| `params.cron_id` | `String` | 编辑时 | 任务 ID |
| `params.tpl_name` | `String` | 编辑时 | 模板名称 |
| `type` | `String` | ✅ | `'add'`（新增）或 `'edit'`（编辑） |

---

## 使用示例

```vue
<template>
  <div>
    <el-button @click="handleAdd">新增定时任务</el-button>
    <el-button @click="handleEdit(task)">编辑</el-button>

    <ScheduledExport
      ref="scheduledExportRef"
      :schedule-option="scheduleOptions"
      @refresh="fetchList"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ScheduledExport from '@/components/ScheduledExport/index.vue'

const scheduledExportRef = ref()

// 导出范围选项（根据业务配置）
const scheduleOptions = [
  { label: '创建时间', value: 'create_time' },
  { label: '更新时间', value: 'update_time' },
]

// 新增任务
const handleAdd = (template) => {
  scheduledExportRef.value?.open({
    tpl_id: template.tpl_id,
    name: template.name,
  }, 'add')
}

// 编辑任务
const handleEdit = (task) => {
  scheduledExportRef.value?.open({
    cron_id: task.cron_id,
    tpl_id: task.tpl_id,
    tpl_name: task.tpl_name,
  }, 'edit')
}

// 刷新列表
const fetchList = () => {
  // 重新获取列表数据
}
</script>
```

---

## 表单字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `cycle_field` | `String` | 周期类型：`'weekly'` / `'monthly'` |
| `cycle_value` | `String` | 周几或几号 |
| `time_point` | `String` | 时间点，格式 `HH:mm` |
| `range_field` | `String` | 导出范围字段 |
| `range_value` | `String` | 导出范围值 |
| `limits` | `Number` | 执行次数（周最多24次，月最多6次） |

---

## API 接口

| 方法 | 接口 | 说明 |
|------|------|------|
| `drop_down` | `GET /export_tpl/:id` | 获取下拉选项 |
| `export_cron` | `POST /export_cron` | 新增任务 |
| `update` | `PUT /export_cron/:id` | 更新任务 |
| `exportCronDtl` | `GET /export_cron/:id` | 获取任务详情 |

---

## 技术特性

- ✅ 内存泄漏防护（定时器/请求自动清理）
- ✅ 组件销毁时自动重置状态
- ✅ 弹窗关闭延迟 200ms（动画流畅）
- ✅ 支持取消未完成的异步请求

---

## 注意事项

1. 使用前必须配置 `window.APP_GETEWAY.dexh`
2. 新增时传 `type: 'add'`，编辑时传 `type: 'edit'`
3. 编辑模式会自动调用 API 获取任务详情
4. 编辑时显示的是**剩余次数**（总次数 - 已执行次数）
