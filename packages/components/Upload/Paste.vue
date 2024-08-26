<template>
  <el-dialog v-if="load" title="上传附件" v-model="visible" append-to-body :close-on-click-modal="false"
    width="800px" @close="handleClose">
    <Drag :accept="accept" style="width:100%" @file="uploadFile" />
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import Drag from './Drag'

const props = defineProps({
  accept: { type: String, default: '' },
})
const emit = defineEmits(['close', 'success'])

const load = ref(false)
const visible = ref(false)
let loadings = reactive({})


// 打开弹窗
const open = async (selection) => {
  if (selection && !selection.length) {
    ElMessage.warning('请先选择行!')
    return
  }
  if (!load.value) {
    load.value = true
    await 1
  }
  loadings = reactive({})
  visible.value = true
}
// 关闭弹窗
const close = () => {
  visible.value = false
}

const handleClose = () => {
  emit('close')
}
// 提交
const uploadFile = (files) => {
  emit('success', files)
  close()
}

defineExpose({ open })
</script>