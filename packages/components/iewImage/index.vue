<script setup>
import { download } from '~/packages/utils'
const load = ref(false)
const visible = ref(false)
const src = ref('')

const emit = defineEmits(['close'])

// 打开弹窗
const open = async (url) => {
  if(!url) return
  src.value = url
  if (!load.value) {
    load.value = true
    await 1
  }
  const type = url.substring(url.lastIndexOf('.') + 1).toLowerCase()
  if (['pdf'].includes(type)) {
    window.open(url, "_blank",
      'height=700, width=1200, top=200, left=300,toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
    return
  }
  if (['xml', 'xlsx'].includes(type)) {
    download(url)
    return
  }
  visible.value = true
}
// 关闭弹窗
const close = () => {
  visible.value = false
}

const handleClose = () => {
  emit('close')
}

defineExpose({ open })
</script>

<template>
  <el-dialog v-if="load" title="预览" v-model="visible" append-to-body width="800px" @close="handleClose">
    <template #header>
      <div class="flex">
        预览
        <el-link type="primary" :underline="false" class="ml-auto mr-3" @click="download(src)">下 载</el-link>
      </div>
    </template>
    <div class="flex items-center justify-center">
      <VImage :src="src" size="700px" />
    </div>
  </el-dialog>
</template>