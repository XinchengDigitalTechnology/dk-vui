<template>
  <div tabindex="0" :class="['v-drag', { 'v-drag-active': active, 'is--disabled': disabled }]" ref="upload" v-bind="$attrs" @drop="handleDrop" @dragleave="handleDragleave" @dragenter="handleDragenter" @dragover="handleDragenter" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
    <el-icon size="52" color="#a8abb2">
      <UploadFilled />
    </el-icon>
    <p class="v-drag-subtile">
      支持点击/粘贴/拖拽到此区域上传
    </p>
    <input ref="fileIpt" class="filePaste-ipt" :disabled="disabled" />
    <input ref="fileRef" class="file-ipt" type="file" :disabled="disabled" :accept="accept" multiple @change="changeFile" />
  </div>
</template>
<script setup>
import { UploadFilled } from '@element-plus/icons-vue'
const upload = ref(null)
const active = ref(false)
const fileIpt = ref(null)
defineProps(['accept', 'disabled'])
const handleMouseenter = function (event) {
  fileIpt.value.focus()
  // 粘贴
  fileIpt.value?.addEventListener('paste', handlePaste)
}
const handleMouseleave = function (event) {
  fileIpt.value.blur()
  fileIpt.value?.removeEventListener('paste', handlePaste)
}

const fileRef = ref()
const emit = defineEmits(["file"])
const handleFileName = (fileList) => {
  let files = Array.from(fileList)
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
  border: 1px dashed #DEDEDE;
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
    font-size: 14px;
  }
  
  &-subtile {
    font-size: 12px;
    color: #999999;
    margin-top: 0;
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