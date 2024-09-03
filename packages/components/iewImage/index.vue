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
  <el-dialog v-if="load" title="预览" v-model="visible" append-to-body align-center width="800px" class="view-image" @close="handleClose">
    <template #header>
      <div class="view-image-title">
        预览
        <el-link type="primary" :underline="false" class="view-image-download" @click="download(src)">下 载</el-link>
      </div>
    </template>
    <div class="view-image-content">
      <VImage :src="src" size="700px" :view="false" />
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.view-image{
  &-title{
    display: flex;
    align-items: center;
  }
  &-download{
    margin-left: auto;
    margin-right: 12px;
  }
  &-content{
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>