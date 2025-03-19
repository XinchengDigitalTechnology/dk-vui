<script setup>
import { VXETable } from "vxe-table"
import { download } from '~/packages/utils'
import Paste from './Paste'
import Drag from './Drag'
import GlobalConfig from "~/packages/config"

const emit = defineEmits(['update:modelValue', 'change'])
const props = defineProps({
  modelValue: { type: [String, Array] },
  title: { type: String, default: '' }, // 标题，无标题时不展示
  types: { type: Array, default: () => (['png', 'jpg', 'jpeg']) }, // 可上传类型
  fileSize: { type: Number, default: 5 }, // 文件大小限制
  limit: { type: [String, Number], default: () => '' }, // 可上传数量
  drag: Boolean, // 是否开启拖动、粘贴上传
  card: Boolean, // 是否使用卡片模式展示
  size: { type: Number, default: () => GlobalConfig.upload.size }, // 卡片模式展示大小
  edit: Boolean, // 是否开启名称编辑功能
  disabled: Boolean, // 是否禁用
  multiple: Boolean, // 是否开启多个上传
  showTip: { type: Boolean, default: true }, // 是否显示提示文字
  tip: { type: String, default: '' }, // 提示文字
  required: Boolean, // 是否必填，仅展示样式，校验用el-form-item包一层来处理，也可以使用插槽 title 来自定义标题
  inline: { type: [Boolean, Number], default: true }, // 列表是否在一行展示，默认一行展示三个，传入数字可控制一行展示数量
  params: { type: Object, default: () => ({}) }, // 上传时的额外参数
  upload: { type: Function, default: null }, //上传方法
})

const pasteRef = ref()

const list = computed({
  get() {
    return props.modelValue || []
  },
  set(val) {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const tip = computed(() => props.showTip ? (props.tip || `格式为${props.types.join('/')}，不超过${props.fileSize}MB`) : '')

// 上传文件
const loadings = reactive({})
const readFile = async (fileds) => {
  const files = fileds || await VXETable.readFile({ multiple: props.multiple, types: props.types })
  const { params, limit } = props
  for (const file of files) {
    const param = new FormData()
    param.append('file', file)
    for (const key in params) {
      param.append(key, params[key])
    }
    try {
      loadings.upload = true
      const res = await (props.upload || GlobalConfig.upload.upload)(param)
      let { file_preview, file_key } = res.data[0]
      const file_name = file_key || file.name.replace(file.lastModified, '')
      const obj = props.edit ? { file_url: file_preview, file_name } : file_preview
      if (+limit === 1) {
        list.value = [obj]
      } else {
        list.value.push(obj)
      }
      await 1
      list.value = list.value
      loadings.upload = false
    } catch (error) {
      console.log(error)
      loadings.upload = false
    }
  }
}

const remove = i => {
  list.value.splice(i, 1)
  list.value = list.value
}

const viewImageRef = ref()
const view = (d) => {
  viewImageRef?.value.open(d)
}

const getName = (url) => url?.slice(url.lastIndexOf('/') + 1)
</script>

<template>
  <div class="v-upload" :class="{'is-card': card }" :style="{'--size': size+'px'}">
    <div class="v-upload-header">
      <div v-if="title" class="v-upload-title">
        <span v-if="required" class="v-upload-required">*</span>
        <slot name="title">{{ title }}</slot>
      </div>
      <template v-if="drag">
        <Drag :accept="types.map(d => `.${d}`).join(',')" :tip="tip" :disabled="disabled" @file="readFile" />
      </template>
      <template v-else-if="!disabled">
        <el-divider direction="vertical" />
        <el-button link size="small" type="primary" :loading="loadings.upload" :disabled="disabled" style="margin-right: 8px;" @click="() => pasteRef.open()">
          <svg v-if="!loadings.upload" t="1731314165724" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4287" width="15" height="15">
            <path
              d="M512 291.648c13.248 0 24 10.752 24 24v172.288l172.288 0.064a24 24 0 0 1 0 48H535.936l0.064 172.288a24 24 0 0 1-48 0V535.936l-172.352 0.064a24 24 0 0 1 0-48h172.288l0.064-172.352c0-13.248 10.752-24 24-24z"
              fill="currentColor" p-id="4288"></path>
            <path d="M512 0a512 512 0 1 1 0 1024A512 512 0 0 1 512 0z m0 64a448 448 0 1 0 0 896A448 448 0 0 0 512 64z" fill="currentColor" p-id="4289"></path>
          </svg> 上传附件
        </el-button>
        <span class="v-upload-tip">
          <slot>{{ tip }}</slot>
        </span>
      </template>
    </div>
    <template v-if="card">
      <div v-for="(d, i) in list" :key="i" class="v-upload-card">
        <div class="v-upload-card-item">
          <VImage :src="d" :size="size+'px'" class="v-upload-card-img" :view="false" @click="view(d)" />
          <div class="v-upload-card-remove">
            <svg v-if="!disabled" @click="remove(i)" t="1731314268097" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4491" width="18"
              height="18">
              <path d="M512 96a416 416 0 1 1 0 832 416 416 0 0 1 0-832z m0 64a352 352 0 1 0 0 704 352 352 0 0 0 0-704z" p-id="4492" fill="currentColor"></path>
              <path d="M365.12 387.328a32 32 0 0 1 44.864-45.248l4.096 4.032 244.8 290.56a32 32 0 0 1-44.864 45.248l-4.096-4.032-244.8-290.56z" p-id="4493" fill="currentColor">
              </path>
              <path d="M365.12 636.672a32 32 0 0 0 44.864 45.248l4.096-4.032 244.8-290.56a32 32 0 0 0-44.864-45.248l-4.096 4.032-244.8 290.56z" p-id="4494" fill="currentColor">
              </path>
            </svg>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="v-upload-list" :style="`grid-template-columns: repeat(${typeof inline === 'number' ? inline : 3}, minmax(0, 1fr))`">
      <div v-for="(d, i) in list" :key="i" class="v-upload-list-item">
        <template v-if="edit">
          <div style="width: calc(100% - 100px);">
            <el-input v-model="d.file_name" placeholder="请输入" :disabled="disabled" class="w-full" />
          </div>
          <div class="v-upload-handle">
            <el-button type="primary" title="查看" link @click="view(d.file_url)">
              <svg t="1731314351025" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4650" width="20" height="20">
                <path
                  d="M512 266.432c120.064 0 227.2 75.776 321.088 223.744a40.64 40.64 0 0 1 0 43.648C739.2 681.792 632.128 757.568 512 757.568c-120.064 0-227.2-75.776-321.088-223.744a40.64 40.64 0 0 1 0-43.648C284.8 342.208 391.872 266.432 512 266.432z m0 64c-86.272 0-167.872 51.84-245.12 161.28L252.992 512l2.88 4.288c76.8 114.944 158.016 172.032 243.84 176.96l12.288 0.32c86.272 0 167.872-51.84 245.12-161.28L770.88 512l-2.752-4.288c-76.8-114.944-158.016-172.032-243.84-176.96L512 330.432z"
                  p-id="4651" fill="currentColor"></path>
                <path
                  d="M512 407.04c58.496 0 105.92 46.976 105.92 104.96 0 57.984-47.424 104.96-105.92 104.96A105.408 105.408 0 0 1 406.08 512c0-57.984 47.424-104.96 105.92-104.96z m0 64a41.408 41.408 0 0 0-41.92 40.96c0 22.464 18.624 40.96 41.92 40.96A41.408 41.408 0 0 0 553.92 512 41.408 41.408 0 0 0 512 471.04z"
                  p-id="4652" fill="currentColor"></path>
              </svg>
            </el-button>
            <el-button type="primary" title="下载" link @click="download(d.file_url)">
              <svg t="1731314415987" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4808" width="18" height="18">
                <path d="M477.952 616.768m0-32l0-384q0-32 32-32l0 0q32 0 32 32l0 384q0 32-32 32l0 0q-32 0-32-32Z" p-id="4809" fill="currentColor"></path>
                <path
                  d="M306.304 413.12a32 32 0 0 1 40.832-3.712l4.48 3.712 158.272 158.4 158.464-158.4a32 32 0 0 1 40.832-3.712l4.416 3.712a32 32 0 0 1 3.712 40.832l-3.712 4.48-180.992 180.992a32 32 0 0 1-40.832 3.648l-4.48-3.648-180.992-181.056a32 32 0 0 1 0-45.248z"
                  p-id="4810" fill="currentColor"></path>
                <path d="M823.232 776.768a32 32 0 0 1 5.76 63.488l-5.76 0.512H200.768a32 32 0 0 1-5.76-63.488l5.76-0.512h622.464z" p-id="4811" fill="currentColor"></path>
              </svg>
            </el-button>
            <el-button type="danger" title="删除" link :disabled="disabled" @click="remove(i)">
              <svg t="1731314488439" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4967" width="16" height="16">
                <path
                  d="M726.784 251.968l76.8 40.192v540.288a76.8 76.8 0 0 1-76.8 76.8H297.216a76.8 76.8 0 0 1-76.8-76.8V292.16l76.8-40.192h429.568z m0 27.392H297.216l-12.352 9.408-0.448 3.392v540.288a12.8 12.8 0 0 0 9.408 12.352l3.392 0.448h429.568a12.8 12.8 0 0 0 12.352-9.344l0.448-3.456V292.16l-9.344-12.352-3.456-0.448z"
                  p-id="4968" fill="currentColor"></path>
                <path d="M137.088 242.752m32 0l685.824 0q32 0 32 32l0 0q0 32-32 32l-685.824 0q-32 0-32-32l0 0q0-32 32-32Z" p-id="4969" fill="currentColor"></path>
                <path d="M345.344 114.752m32 0l269.248 0q32 0 32 32l0 0q0 32-32 32l-269.248 0q-32 0-32-32l0 0q0-32 32-32Z" p-id="4970" fill="currentColor"></path>
                <path d="M544 441.344m0 32l0 185.92q0 32-32 32l0 0q-32 0-32-32l0-185.92q0-32 32-32l0 0q32 0 32 32Z" p-id="4971" fill="currentColor"></path>
              </svg>
            </el-button>
          </div>
        </template>
        <template v-else>
          <div style="width: calc(100% - 100px);">
            <VText :value="getName(d)" type="button" style="max-height: 28px!important;" @click="view(d)" />
          </div>
          <div class="v-upload-handle">
            <el-button type="primary" title="下载" link @click="download(d)">
              <svg t="1731314415987" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4808" width="18" height="18">
                <path d="M477.952 616.768m0-32l0-384q0-32 32-32l0 0q32 0 32 32l0 384q0 32-32 32l0 0q-32 0-32-32Z" p-id="4809" fill="currentColor"></path>
                <path
                  d="M306.304 413.12a32 32 0 0 1 40.832-3.712l4.48 3.712 158.272 158.4 158.464-158.4a32 32 0 0 1 40.832-3.712l4.416 3.712a32 32 0 0 1 3.712 40.832l-3.712 4.48-180.992 180.992a32 32 0 0 1-40.832 3.648l-4.48-3.648-180.992-181.056a32 32 0 0 1 0-45.248z"
                  p-id="4810" fill="currentColor"></path>
                <path d="M823.232 776.768a32 32 0 0 1 5.76 63.488l-5.76 0.512H200.768a32 32 0 0 1-5.76-63.488l5.76-0.512h622.464z" p-id="4811" fill="currentColor"></path>
              </svg>
            </el-button>
            <el-button type="danger" title="删除" link :disabled="disabled" @click="remove(i)">
              <svg t="1731314488439" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4967" width="16" height="16">
                <path
                  d="M726.784 251.968l76.8 40.192v540.288a76.8 76.8 0 0 1-76.8 76.8H297.216a76.8 76.8 0 0 1-76.8-76.8V292.16l76.8-40.192h429.568z m0 27.392H297.216l-12.352 9.408-0.448 3.392v540.288a12.8 12.8 0 0 0 9.408 12.352l3.392 0.448h429.568a12.8 12.8 0 0 0 12.352-9.344l0.448-3.456V292.16l-9.344-12.352-3.456-0.448z"
                  p-id="4968" fill="currentColor"></path>
                <path d="M137.088 242.752m32 0l685.824 0q32 0 32 32l0 0q0 32-32 32l-685.824 0q-32 0-32-32l0 0q0-32 32-32Z" p-id="4969" fill="currentColor"></path>
                <path d="M345.344 114.752m32 0l269.248 0q32 0 32 32l0 0q0 32-32 32l-269.248 0q-32 0-32-32l0 0q0-32 32-32Z" p-id="4970" fill="currentColor"></path>
                <path d="M544 441.344m0 32l0 185.92q0 32-32 32l0 0q-32 0-32-32l0-185.92q0-32 32-32l0 0q32 0 32 32Z" p-id="4971" fill="currentColor"></path>
              </svg>
            </el-button>
          </div>
        </template>
      </div>
      <small v-if="!list.length">尚未添加附件</small>
    </div>
  </div>
  <ViewImage ref="viewImageRef" />
  <Paste ref="pasteRef" :accept="types.map(d => `.${d}`).join(',')" :tip="tip" :disabled="disabled" :style="{'--size': size+'px'}" @success="readFile" />
</template>

<style lang="scss">
.v-upload {
  width: 100%;
  line-height: 32px;

  &.is-card {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  &-header {
    display: flex;
    align-items: center;
  }

  &-title {
    margin-right: 3px;
    font-weight: bold;
  }

  &-required {
    color: var(--el-color-danger);
    margin-right: 4px;
  }

  &-tip {
    font-size: 12px;
    color: #999;
  }

  &-list {
    display: grid;
    gap: 3px;

    &-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 5px;
      overflow: hidden;
    }
  }

  &-handle {
    display: flex;
    flex: 0 0 90px;
    gap: 1px;
    align-items: center;
    max-height: 28px !important;
    .el-button {
      margin-left: 0 !important;
    }
  }

  &-card {
    display: flex;
    align-items: center;
    gap: 5px;

    &-item {
      position: relative;
      width: var(--size);
      height: var(--size);
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain;
      }
    }
    &-img {
      cursor: pointer;
    }
    &-remove {
      position: absolute;
      right: -5px;
      top: -5px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      color: #333;
      display: none;
      opacity: 0.6;
      .el-icon {
        font-size: 18px;
        cursor: pointer;
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
      }
      &:hover {
        opacity: 1;
      }
    }
    &:hover {
      .v-upload-card-remove {
        display: block;
      }
    }
  }
}
</style>