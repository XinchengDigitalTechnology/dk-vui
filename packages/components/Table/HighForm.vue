<template>
  <el-button link type="primary" @click="open">
    <svg t="1703735208728" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5158" xmlns:xlink="http://www.w3.org/1999/xlink" width="12" height="12"><path d="M577.499296 1023.99875a99.999878 99.999878 0 0 1-47.999942-11.999985l-131.999839-72.999911a99.999878 99.999878 0 0 1-51.999936-87.999893V431.999473a19.999976 19.999976 0 0 0-7.99999-15.999981L32.499961 171.99979l-3.999995-3.999995C0.5 138.99983-6.499991 96.999882 9.499989 59.999927S60.499927 0 100.499878 0h821.998997c39.999951 0 75.999907 22.999972 91.999887 59.999927s8.999989 77.999905-17.999978 107.999868l-3.999995 3.999995-307.999624 246.999699a19.999976 19.999976 0 0 0-6.999991 15.99998v488.999403a99.999878 99.999878 0 0 1-99.999878 99.999878zM84.499897 111.999863l302.999631 241.999705a98.999879 98.999879 0 0 1 37.999953 77.999905v418.999488a19.999976 19.999976 0 0 0 9.999988 17.999978l131.999839 71.999912a19.999976 19.999976 0 0 0 29.999963-17.999978V434.999469a99.999878 99.999878 0 0 1 36.999955-77.999905l303.999629-244.999701a19.999976 19.999976 0 0 0-15.99998-31.999961H100.499878a19.999976 19.999976 0 0 0-15.999981 31.999961z m881.998924 28.999965z" fill="currentColor" p-id="5159"></path><path d="M983.4988 520.999364H757.499076a39.999951 39.999951 0 0 1 0-79.999902h225.999724a39.999951 39.999951 0 0 1 0 79.999902zM983.4988 670.999181H757.499076a39.999951 39.999951 0 0 1 0-79.999902h225.999724a39.999951 39.999951 0 0 1 0 79.999902zM983.4988 819.998999H757.499076a39.999951 39.999951 0 0 1 0-79.999902h225.999724a39.999951 39.999951 0 0 1 0 79.999902z" fill="currentColor" p-id="5160"></path></svg>&nbsp;高级搜索
  </el-button>
  <el-dialog v-if="load" :close-on-click-modal="false" title="高级查询" v-model="visible" append-to-body width="1000px"
    @close="handleClose">
    <slot></slot>
    <template #footer>
      <SaveForm v-if="table.formConfig.save" placement="top" style="float: left;" />
      <el-button @click="close">关 闭</el-button>
      <el-button @click="reset">重 置</el-button>
      <el-button type="primary" :loading="loadings.submit" @click="submit">查 询</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { inject } from 'vue';
import SaveForm from './SaveForm'
const props = defineProps({
})

const table = inject('table')
const load = ref(false)
const visible = ref(false)
let loadings = reactive({})

const emit = defineEmits(['close', 'query', 'reset'])

// 打开弹窗
const open = async () => {
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

const reset = () => {
  close()
  emit('reset')
}

// 提交
const submit = () => {
  close()
  emit('query')
}

defineExpose({ open })
</script>