<script setup>
import { VXETable } from "vxe-table"
import { Delete, CircleClose, CirclePlus, View, Download } from '@element-plus/icons-vue'
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
  showTip: {type: Boolean, default: true}, // 是否显示提示文字
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
      let { file_preview } = res.data[0]
      const name = file.name.replace(file.lastModified, '')
      const obj = props.edit ? { file_url: file_preview, file_name: name } : file_preview
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
          <el-icon v-if="!loadings.upload" :size="15">
            <CirclePlus />
          </el-icon>上传附件
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
            <el-icon v-if="!disabled" @click="remove(i)">
              <CircleClose />
            </el-icon>
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
              <el-icon size="14">
                <View />
              </el-icon>
            </el-button>
            <el-button type="primary" title="下载" link @click="download(d.file_url)">
              <el-icon size="14">
                <Download />
              </el-icon>
            </el-button>
            <el-button type="danger" title="删除" link :disabled="disabled" @click="remove(i)">
              <el-icon size="14">
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </template>
        <template v-else>
          <div style="width: calc(100% - 100px);">
            <VText :value="getName(d)" type="button" style="max-height: 28px!important;" @click="view(d)" />
          </div>
          <div class="v-upload-handle">
            <el-button type="primary" title="下载" link @click="download(d.file_url)">
              <el-icon size="14">
                <Download />
              </el-icon>
            </el-button>
            <el-button type="danger" title="删除" link :disabled="disabled" @click="remove(i)">
              <el-icon size="14">
                <Delete />
              </el-icon>
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
    gap: 3px;
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