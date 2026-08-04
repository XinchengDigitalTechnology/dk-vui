<script setup name="VImportDataBase">
import { ElMessage } from 'element-plus'
import GlobalConfig from '~/packages/config'
import {
  createUploadFormData,
  downloadTemplate,
  getFileName,
  isXlsxFile,
  normalizeResultList,
  parseXlsxFiles,
  resolveResponseData,
  xlsxAccept,
} from './utils'
import ImportResult from './components/ImportResult.vue'
import './index.scss'

const emit = defineEmits(['success', 'refresh'])

const props = defineProps({
  auth: { type: String, default: '' }, // 按钮权限标识
  className: { type: String, default: '' },
  title: { type: String, default: () => GlobalConfig.importDataBase.title }, // 导入标题
  multiple: { type: Boolean, default: () => GlobalConfig.importDataBase.multiple }, // 是否允许多文件
  templateLink: { type: [String, Object], default: '' }, // 模板远程链接或本地 File/Blob
  templateName: { type: String, default: () => GlobalConfig.importDataBase.templateName }, // 模板名称
  xlsxMatch: { type: Object, default: () => ({}) }, // xlsx 表头与提交字段的映射
  onChange: { type: Function, default: null }, // 前端解析后回调
  upload: { type: Function, default: null }, // 后端解析上传方法
  width: { type: [String, Number], default: () => GlobalConfig.importDataBase.width },
})

const fileList = ref([])
const loading = ref(false)
const uploadResult = ref([])
const resultData = ref([])
const slots = useSlots()

const visible = ref(false)
const hasAuth = computed(() => !props.auth || GlobalConfig.importDataBase.auth(props.auth))

const rawFiles = computed(() => fileList.value.map(file => file.raw).filter(Boolean))

const handleOpen = () => {
  visible.value = true
}

const handleDownloadTemplate = async () => {
  if (!props.templateLink) {
    ElMessage.warning('请配置模板文件或链接')
    return
  }
  const filename = props.templateName || getFileName(props.templateLink)
  await downloadTemplate(props.templateLink, filename)
}

const handleFileChange = (uploadFile, uploadFiles) => {
  uploadResult.value = []
  resultData.value = []
  const files = (uploadFiles || []).filter(file => isXlsxFile(file))
  if (!isXlsxFile(uploadFile)) {
    ElMessage.error('请上传 xls 或 xlsx 格式文件')
  }
  fileList.value = props.multiple ? files : files.slice(-1)
}

const handleExceed = files => {
  const [file] = files
  if (!file || !isXlsxFile(file)) {
    ElMessage.error('请上传 xls 或 xlsx 格式文件')
    return
  }
  fileList.value = [{
    name: file.name,
    raw: file,
    status: 'ready',
  }]
}

const handleDelFile = index => {
  fileList.value.splice(index, 1)
  fileList.value = [...fileList.value]
  uploadResult.value = []
  resultData.value = []
}

const handleImportResult = data => {
  const currentData = resolveResponseData(data)
  resultData.value = currentData
  uploadResult.value = normalizeResultList(currentData)
  return currentData
}

const submitWithUpload = async files => {
  const formData = createUploadFormData(files)
  const res = await props.upload(formData, files)
  return handleImportResult(res)
}

const submitWithFrontendParse = async files => {
  const data = await parseXlsxFiles(files, props.xlsxMatch)
  if (!data.length) {
    ElMessage.warning('文件内容为空，请核对后再上传')
    return null
  }

  if (!props.onChange) return data

  let hasCallback = false
  const callback = res => {
    hasCallback = true
    return handleImportResult(res)
  }
  const res = await props.onChange(data, callback, {
    file: files[0],
    files,
  })
  if (!hasCallback && res !== undefined) {
    return handleImportResult(res)
  }
  return resultData.value
}

const handleSubmit = async () => {
  if (!rawFiles.value.length) {
    ElMessage.error('请先上传文件')
    return
  }

  loading.value = true
  try {
    const data = props.upload
      ? await submitWithUpload(rawFiles.value)
      : await submitWithFrontendParse(rawFiles.value)

    if (data !== null) {
      emit('success', data)
      emit('refresh')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('导入失败，请检查文件后重试')
  } finally {
    loading.value = false
  }
}

const reset = () => {
  fileList.value = []
  uploadResult.value = []
  resultData.value = []
  loading.value = false
}

const handleCancel = () => {
  reset()
  visible.value = false
}

defineExpose({ open: handleOpen, reset, submit: handleSubmit, close: handleCancel })
</script>

<template>
  <template v-if="hasAuth">
    <span class="v-import-data-base-trigger" :class="className" @click="handleOpen">
      <slot>
        <el-button type="primary">导入</el-button>
      </slot>
    </span>

    <el-dialog
      v-model="visible"
      :title="title || '导入数据'"
      :width="width"
      destroy-on-close
      append-to-body
      class="v-import-data-base"
      @close="handleCancel"
    >
      <div v-loading="loading">
        <div class="v-import-data-base-step">
          <span class="v-import-data-base-title">第 1 步：点击下载</span>
          <div class="v-import-data-base-template">
            <el-link type="primary" :underline="false" @click="handleDownloadTemplate">
              <svg t="1731314415987" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4808" width="18" height="18">
                <path d="M477.952 616.768m0-32l0-384q0-32 32-32l0 0q32 0 32 32l0 384q0 32-32 32l0 0q-32 0-32-32Z" p-id="4809" fill="currentColor"></path>
                <path
                    d="M306.304 413.12a32 32 0 0 1 40.832-3.712l4.48 3.712 158.272 158.4 158.464-158.4a32 32 0 0 1 40.832-3.712l4.416 3.712a32 32 0 0 1 3.712 40.832l-3.712 4.48-180.992 180.992a32 32 0 0 1-40.832 3.648l-4.48-3.648-180.992-181.056a32 32 0 0 1 0-45.248z"
                    p-id="4810" fill="currentColor"></path>
                <path d="M823.232 776.768a32 32 0 0 1 5.76 63.488l-5.76 0.512H200.768a32 32 0 0 1-5.76-63.488l5.76-0.512h622.464z" p-id="4811" fill="currentColor"></path>
              </svg>
              下载模板
            </el-link>
          </div>
        </div>

        <div class="v-import-data-base-step">
          <span class="v-import-data-base-title">第 2 步：按照模板要求填写</span>
        </div>

        <div class="v-import-data-base-step">
          <span class="v-import-data-base-title">第 3 步：上传填写完成的文件</span>
          <div class="v-import-data-base-upload">
            <el-upload
              v-model:file-list="fileList"
              drag
              :auto-upload="false"
              :multiple="multiple"
              :limit="multiple ? undefined : 1"
              :accept="xlsxAccept"
              :show-file-list="false"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
            >
              <div class="v-import-data-base-upload-trigger">
                <svg t="1783663970232" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5877" width="18" height="18"><path d="M731.428571 341.333333h73.142858a73.142857 73.142857 0 0 1 73.142857 73.142857v414.476191a73.142857 73.142857 0 0 1-73.142857 73.142857H219.428571a73.142857 73.142857 0 0 1-73.142857-73.142857V414.47619a73.142857 73.142857 0 0 1 73.142857-73.142857h73.142858v73.142857H219.428571v414.476191h585.142858V414.47619h-73.142858v-73.142857zM518.460952 93.671619l172.373334 172.373333-51.687619 51.736381-84.601905-84.577523v348.306285h-73.142857V234.22781l-83.626667 83.577904-51.712-51.712 172.373333-172.397714z" p-id="5878" fill="#409eff"></path></svg>
                点击或拖拽文件到此处上传
              </div>
            </el-upload>

            <div v-if="fileList.length" class="v-import-data-base-file-list">
              <span class="v-import-data-base-file-tip">已上传文件</span>
              <div v-for="(file, index) in fileList" :key="`${file.name}-${index}`" class="v-import-data-base-file-item">
                <span class="v-import-data-base-file-icon">EXCEL</span>
                <span class="v-import-data-base-file-name">{{ file.name }}</span>
                <el-button type="danger" link @click="handleDelFile(index)">删除</el-button>
              </div>
            </div>
          </div>
        </div>

        <ImportResult v-if="slots.msg" :list="uploadResult" :data="resultData">
          <template #msg="slotProps">
            <slot name="msg" v-bind="slotProps" />
          </template>
        </ImportResult>
        <ImportResult v-else :list="uploadResult" :data="resultData" />
      </div>

      <template #footer>
        <div class="v-import-data-base-footer">
          <el-button @click="handleCancel">关闭</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </template>
</template>
