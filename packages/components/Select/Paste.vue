<template>
  <el-popover v-model:visible="visible" trigger="click" placement="bottom-end" :offset="2" :show-arrow="false" width="405px" @show="open" @hide="handleClose">
    <template #reference>
      <div class="v-group-item v-paste">
        <el-icon>
          <Tickets />
        </el-icon>
      </div>
    </template>
    <div class="v-select-paste">
      <el-input ref="inputRef" v-model="inputValue" type="textarea" :autosize="{ minRows: 5, maxRows: 20 }" placeholder="一行一个，不限制数量" />
      <Handle :value="inputValue" submitText="确定" closeText="取消" @clear="clear" @close="close" @submit="submit" />
    </div>
  </el-popover>
</template>

<script setup>
import Handle from '../BatchInput/Handle'
import { Tickets } from '@element-plus/icons-vue'
const props = defineProps({
  title: { type: [String, Boolean], default: '店铺名称' },
})

const visible = ref(false)
const inputValue = ref('')
const inputRef = ref()

const emit = defineEmits(['close', 'change'])

// 打开弹窗
const open = async () => {
  visible.value = true
  await nextTick()
  inputRef?.value?.focus()
}
// 关闭弹窗
const close = () => {
  visible.value = false
}

const clear = () => {
  inputValue.value = ''
}

const handleClose = () => {
  clear()
  emit('close')
}
// 提交
const submit = () => {
  emit('change', inputValue.value?.split('\n').filter(Boolean))
  close()
}
</script>

<style lang="scss">
.v-paste {
  cursor: pointer;
  background-color: var(--el-color-info-light-8);
  &:hover {
    background-color: var(--el-color-info-light-9);
  }
}
</style>