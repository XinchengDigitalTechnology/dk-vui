<script setup>
import Md from '@/components/Md'
import doc from './document.md?raw'
import * as XLSX from 'xlsx'

const content = ref(doc)
const templateLink = ref('')
const templateFile = shallowRef(null)
const frontendRows = ref([])
const backendFileNames = ref([])
const xlsxMatch = {
  '姓名': 'name',
  '手机号': 'phone',
  '所属部门': 'department',
}

const createTemplateLink = () => {
  const rows = [
    { 姓名: '张三', 手机号: '13800000000', 所属部门: '销售部' },
    { 姓名: '李四', 手机号: '13900000000', 所属部门: '技术部' },
  ]
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板')
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  templateFile.value = new File(
    [buffer],
    '用户导入模板.xlsx',
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  )
  templateLink.value = URL.createObjectURL(templateFile.value)
}

onMounted(createTemplateLink)

onUnmounted(() => {
  if (templateLink.value) URL.revokeObjectURL(templateLink.value)
})

const sleep = (time = 500) => new Promise(resolve => setTimeout(resolve, time))

const frontendImport = async (data, callback) => {
  await sleep()
  frontendRows.value = data
  callback({
    data: {
      list: [
        `成功解析 ${data.length} 条数据`,
        data.some(row => !row.name) ? '失败：存在姓名为空的数据' : '校验通过：姓名字段完整',
      ]
    }
  })
}

const backendUpload = async formData => {
  await sleep()
  const files = formData.getAll('file')
  console.log('后端解析导入formData', files)
  backendFileNames.value = files.map(file => file.name)
  return {
    data: [
      `后端已接收 ${files.length} 个文件`,
      ...backendFileNames.value.map(name => `文件：${name}`),
    ]
  }
}

const customMsgImport = async (data, callback) => {
  await sleep()
  callback({
    data: {
      total: data.length,
      list: [
        '成功：第 1 行导入完成',
        '失败：第 2 行手机号格式不正确',
        '错误：第 3 行所属部门不存在',
      ]
    }
  })
}

const frontendCode = `
\`\`\`js
const templateFile = new File(
  [xlsxBuffer],
  '用户导入模板.xlsx',
  { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
)
\`\`\`

\`\`\`html
<VImportDataBase
  title="用户导入"
  :template-link="templateFile"
  template-name="用户导入模板.xlsx"
  :xlsx-match="xlsxMatch"
  :on-change="frontendImport"
/>
\`\`\`
`

const backendCode = `
\`\`\`js
const templateLink = 'https://example.com/templates/backend-import.xlsx'
\`\`\`

\`\`\`html
<VImportDataBase
  title="后端解析导入"
  :template-link="templateLink"
  template-name="后端解析模板.xlsx"
  :upload="backendUpload"
>
  <el-button type="success">自定义导入按钮</el-button>
</VImportDataBase>
\`\`\`
`

const customMsgCode = `
\`\`\`html
<VImportDataBase
  title="自定义结果展示"
  :template-link="templateLink"
  :on-change="customMsgImport"
>
  <template #msg="{ list, data }">
    <el-alert type="warning" :closable="false" show-icon>
      共处理 {{ data.total }} 条数据
    </el-alert>
    <div v-for="(item, index) in list" :key="index">
      {{ index + 1 }}. {{ item }}
    </div>
  </template>
</VImportDataBase>
\`\`\`
`
</script>

<template>
  <VPage edit>
    <div class="page import-data-base-demo">
      <h1>ImportDataBase 导入组件</h1>
      <p>示例使用前端动态生成的 xlsx 模板文件，演示本地 File 对象和 URL 字符串两种模板下载方式。</p>

      <h2>本地模板文件、前端解析 xlsx 后提交</h2>
      <VImportDataBase
        title="用户导入"
        :template-link="templateFile"
        template-name="用户导入模板.xlsx"
        :xlsx-match="xlsxMatch"
        :on-change="frontendImport"
      />
      <div v-if="frontendRows.length" class="import-data-base-demo-preview">
        已解析数据：
        <pre>{{ JSON.stringify(frontendRows, null, 2) }}</pre>
      </div>
      <Md v-model="frontendCode" view />

      <h2>远程模板链接、直接上传 xlsx 给后端解析</h2>
      <VImportDataBase
        title="后端解析导入"
        :template-link="templateLink"
        template-name="后端解析模板.xlsx"
        :upload="backendUpload"
      >
        <el-button type="success">自定义导入按钮</el-button>
      </VImportDataBase>
      <Md v-model="backendCode" view />

      <h2>自定义导入结果展示</h2>
      <VImportDataBase
        title="自定义结果展示"
        :template-link="templateLink"
        template-name="自定义结果模板.xlsx"
        :on-change="customMsgImport"
      >
        <template #msg="{ list, data }">
          <el-alert type="warning" :closable="false" show-icon class="import-data-base-demo-alert">
            共处理 {{ data.total }} 条数据
          </el-alert>
          <div class="import-data-base-demo-msg">
            <div
              v-for="(item, index) in list"
              :key="index"
              :class="{ 'is-error': item.includes('失败') || item.includes('错误') }"
            >
              {{ index + 1 }}. {{ item }}
            </div>
          </div>
        </template>
      </VImportDataBase>
      <Md v-model="customMsgCode" view />

      <h2>API</h2>
      <Md v-model="content" view />
    </div>
  </VPage>
</template>

<style lang="scss" scoped>
.import-data-base-demo {
  &-preview {
    margin-top: 12px;
    padding: 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;

    pre {
      margin-bottom: 0;
      white-space: pre-wrap;
    }
  }

  &-alert {
    margin-bottom: 8px;
  }

  &-msg {
    line-height: 22px;
    font-size: 12px;

    .is-error {
      color: var(--el-color-danger);
    }
  }
}
</style>
