<template>
  <div tabindex="0" :class="['v-drag', { 'v-drag-active': active, 'is--disabled': disabled }]" ref="upload" v-bind="$attrs" @drop="handleDrop" @dragleave="handleDragleave" @dragenter="handleDragenter" @dragover="handleDragenter" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
    <el-icon size="52" color="#a8abb2">
      <UploadFilled />
    </el-icon>
    <p class="v-drag-subtile">
      支持点击/粘贴/拖拽到此区域上传<br/>
      <span class="v-upload-tip" v-if="tip">{{ tip }}</span>
    </p>
    <input ref="fileIpt" class="filePaste-ipt" :disabled="disabled" />
    <input ref="fileRef" class="file-ipt" type="file" :disabled="disabled" :accept="accept" multiple @change="changeFile" />
  </div>
</template>
<script setup>
import { ElMessage } from "element-plus"
import { UploadFilled } from '@element-plus/icons-vue'
const upload = ref(null)
const active = ref(false)
const fileIpt = ref(null)
const props = defineProps(['accept', 'disabled', 'tip', 'fileSize'])
const handleMouseenter = function (event) {
  fileIpt.value.focus()
  // 粘贴
  fileIpt.value?.addEventListener('paste', handlePaste)
}
const handleMouseleave = function (event) {
  fileIpt.value.blur()
  fileIpt.value?.removeEventListener('paste', handlePaste)
}

const filesizeToMB = (filesize) => {
    return (filesize / 1024 / 1024).toFixed(2);
}

const fileRef = ref()
const emit = defineEmits(["file"])
const handleFileName = (fileList) => {
  if(props.disabled) return
  let files = Array.from(fileList)
  const acceptList = props.accept.replaceAll(',', '').split('.').filter(Boolean)
  if(props.accept && files.some(d => {
    const name = d.name.split('.').pop().toLowerCase()
    return !acceptList.includes(name)
  })) {
    ElMessage.error(`上传文件类型必须为 ${acceptList.join('/')}`)
    return
  }
  if(props.fileSize && files.some(d => {
    return filesizeToMB(d.size) > props.fileSize
  })) {
    ElMessage.error(`上传文件大小不能超过${props.fileSize}MB`)
    return
  }
  let renameReportFile = []
  for (let i in files) {
    renameReportFile.push(new File([files[i]], new Date().getTime() + files[i].name, { type: files[0].type }))
  }
  emit("file", renameReportFile)
  fileRef.value.value = ''
}
const changeFile = (e) => {
  e.preventDefault()
  handleFileName(e.target.files)
}

const handleDragleave = (e) => {
  active.value = false
  e.preventDefault()
}
const handleDragenter = (e) => {
  active.value = true
  e.preventDefault()
}

const handleDrop = (e) => {
  e.preventDefault()
  active.value = false
  handleFileName(e.dataTransfer.files)
}

const handlePaste = (e) => {
  e.preventDefault()
  handleFileName(e.clipboardData.files)
}
</script>

<style lang="scss" scoped>
.v-drag {
  position: relative;
  height: var(--size);
  padding: 0 10px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  &:active, &:hover, &-active {
    &:not(.is--disabled) {
      border-color: var(--el-color-primary);
    }
  }
  
  &-title {
    font-size: var(--el-font-size-base);
  }
  
  &-subtile {
    font-size: var(--el-font-size-base);
    color: #666;
    margin-top: 0;
    line-height: 24px;
    text-align: center;
  }
  .file-ipt {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
  &.is--disabled{
    .file-ipt {
      cursor: no-drop;
    }
  }
  
  .filePaste-ipt {
    position: fixed;
    left: -100vw;
    opacity: 0;
  }
}
</style>