<template>
  <div class="v-group-item v-paste" @click="open()">
    <el-icon>
      <Tickets />
    </el-icon>
  </div>
  <el-dialog v-if="load" title="批量选中" v-model="visible" append-to-body :close-on-click-modal="false" width="500px"
    @close="handleClose">
    <el-form label-position="top">
      <el-form-item :label="title">
        <el-input ref="inputRef" v-model="form.inputValue" type="textarea" :autosize="{ minRows: 5, maxRows: 20 }"
          placeholder="一行一个，不限制数量" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">关 闭</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { Tickets } from '@element-plus/icons-vue'
const props = defineProps({
  title: { type: [String, Boolean], default: '店铺名称' },
})

const load = ref(false)
const visible = ref(false)
const form = ref({})
const inputRef = ref()

const emit = defineEmits(['close', 'change'])

// 打开弹窗
const open = async () => {
  if (!load.value) {
    load.value = true
    await 1
  }
  form.value = { inputValue: '' }
  visible.value = true
  await nextTick()
  inputRef?.value?.focus()
}
// 关闭弹窗
const close = () => {
  visible.value = false
}

const handleClose = () => {
  emit('close')
}
// 提交
const submit = () => {
  emit('change', form.value.inputValue.split('\n').filter(Boolean))
  close()
}

defineExpose({ open })
</script>

<style lang="scss">
.v-paste{
  cursor: pointer;
  background-color: var(--el-color-info-light-8);
  &:hover{
    background-color: var(--el-color-info-light-9);
  }
}
</style>