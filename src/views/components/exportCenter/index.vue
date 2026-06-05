<script setup>
import Md from "@/components/Md"
import doc from "./document.md?raw"
import { useExportCenterDemo } from "./mock"

const content = ref(doc)

const { form, scheduleOption, getFormData, handleExportCallback } = useExportCenterDemo()
</script>

<template>
  <VPage edit>
    <div class="page">
      <h1>ExportCenter 导出中心组件</h1>
      <p>用于演示导出字段选择、模板保存、模板导出、定时导出和外部自定义导出按钮。</p>

      <el-form :model="form" label-width="90px" inline>
        <el-form-item label="关键词">
          <el-input v-model="form.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="form.status" style="width: 160px">
            <el-option label="已付款" value="paid" />
            <el-option label="待付款" value="pending" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>

      <h2>基础用法</h2>
      <VExportCenter tag_name="demo_export_center" title-append="示例导出" :get-form-data="getFormData" @callback="handleExportCallback" />

      <h2>开启定时导出</h2>
      <VExportCenter tag_name="demo_export_center" :schedule="true" :schedule-option="scheduleOption" :get-form-data="getFormData" />

      <h2>自定义导出按钮</h2>
      <VExportCenter tag_name="demo_export_center" :get-form-data="getFormData">
        <template #exportButton="{ outerExport }">
          <el-button type="primary" @click="outerExport('demo_export_center', '示例订单', 'all')"> 导出全部字段 </el-button>
          <el-button @click="outerExport('demo_export_center', '示例订单')"> 导出已选字段 </el-button>
        </template>
      </VExportCenter>

      <Md v-model="content" view />
    </div>
  </VPage>
</template>
