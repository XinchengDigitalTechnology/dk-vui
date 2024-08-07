<script setup>
import { VXETable } from "vxe-table"
import { Delete, CircleClose, CirclePlus } from '@element-plus/icons-vue'
import { download } from '~/packages/utils'
import Paste from './Paste'
import Drag from './Drag'
import GlobalConfig from "~/packages/config"

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: { type: [String, Array] },
  title: { type: String, default: '' }, // 标题，无标题时不展示
  types: { type: Array, default: () => (['png', 'jpg', 'jpeg']) },
  limit: { type: [String, Number], default: () => '' },
  drag: Boolean, // 是否开启拖动、粘贴上传
  card: Boolean, // 是否使用卡片模式展示
  size: { type: Number, default: () => GlobalConfig.upload.size }, // 卡片模式展示大小
  edit: Boolean, // 是否开启名称编辑功能
  disabled: Boolean, // 是否禁用
  multiple: Boolean, // 是否开启多个上传
  required: Boolean, // 是否必填，仅展示样式，校验用el-form-item包一层来处理，也可以使用插槽 title 来自定义标题
  inline: { type: [Boolean, Number], default: true }, // 列表是否在一行展示，默认一行展示三个，传入数字可控制一行展示数量
  params: { type: Object, default: () => ({}) }, // 上传时的额外参数
  upload: { type: Function, default: () => GlobalConfig.upload.upload }, //上传方法
})

const pasteRef = ref()

const list = computed({
  get() {
    return (Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]).filter(Boolean)
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

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
      const res = await props.upload(param)
      let { file_preview } = res.data[0]
      const name = file.name.replace(file.lastModified, '')
      const obj = props.edit ? { file_url: file_preview, file_name: name } : file_preview
      if (+limit === 1) {
        list.value = [obj]
      } else {
        list.value.push(obj)
      }
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
const handleClick = (d) => {
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
        <Drag :accept="types.map(d => `.${d}`).join(',')" @file="readFile" />
      </template>
      <template v-else-if="!disabled">
        <el-divider direction="vertical" />
        <el-button link size="small" type="primary" :loading="loadings.upload" :disabled="disabled" @click="() => pasteRef.open()">
          <el-icon v-if="!loadings.upload" style="font-size: 16px;">
            <CirclePlus />
          </el-icon>上传附件
        </el-button>
        <span class="v-upload-tip">
          <slot />
        </span>
      </template>
    </div>
    <template v-if="card">
      <div v-for="(d, i) in list" :key="i" class="v-upload-card">
        <div class="v-upload-card-item">
          <VImage :src="d" :list="list" :size="size+'px'" />
          <div class="v-upload-card-remove">
            <el-icon @click="remove(i)"><CircleClose /></el-icon>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="v-upload-list" :style="`grid-template-columns: repeat(${typeof inline === 'number' ? inline : 3}, minmax(0, 1fr))`">
      <div v-for="(d, i) in list" :key="i" class="v-upload-list-item">
        <template v-if="edit">
          <div style="width: calc(100% - 100px);">
            <el-input v-model="d.file_name" placeholder="请输入" class="w-full" />
          </div>
          <div class="v-upload-handle">
            <span class="w-8">
              <VText value="查看" type="button" @click="handleClick(d.file_url)" />
            </span>
            <span class="w-8 ml-1">
              <VText value="下载" type="button" @click="download(d.file_url)" />
            </span>
            <el-button type="danger" link icon="Delete" :disabled="disabled" class="ml-1" @click="remove(i)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
        <template v-else>
          <div style="width: calc(100% - 100px);">
            <VText :value="getName(d)" type="button" style="max-height: 28px!important;" @click="handleClick(d)" />
          </div>
          <div class="v-upload-handle">
            <span class="w-8">
              <VText value="下载" type="button" @click="download(d)" />
            </span>
            <el-button type="danger" link :disabled="disabled" style="margin-left: 8px;" @click="remove(i)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </div>
      <small v-if="!list.length">尚未添加附件</small>
    </div>
  </div>
  <ViewImage ref="viewImageRef" />
  <Paste ref="pasteRef" :accept="types.map(d => `.${d}`).join(',')" @success="readFile" />
</template>

<style lang="scss">
.v-upload {
  width: 100%;

  &.is-card {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  &-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
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
    margin-left: 10px;
    color: #999;
  }

  &-list {
    display: grid;
    gap: 3px;

    &-item {
      width: 100%;
      display: flex;
      align-items: center;
      column-gap: 1rem;
      overflow: hidden;
    }
  }

  &-handle {
    display: flex;
    flex: 0 0 90px;
    max-height: 28px !important;
  }

  &-card {
    display: flex;
    align-items: center;
    gap: 5px;

    &-item {
      position: relative;
      width: var(--size);
      height: var(--size);
      border: 1px solid #ddd;
      border-radius: 6px;
      img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain;
      }
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
      opacity: .6;
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
        display: block
      }
    }
  }

  small {
    margin-top: 2px;
    font-size: 12px;
    color: #888;
  }
}
</style>