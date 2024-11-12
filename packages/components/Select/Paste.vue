<template>
  <el-popover v-model:visible="visible" trigger="click" placement="bottom-end" :offset="2" :show-arrow="false" width="405px" @show="open" @hide="handleClose">
    <template #reference>
      <el-button>
        <svg t="1731313431916" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3728" width="18" height="18">
          <path
            d="M376.512 351.36h103.36a32 32 0 1 1 0 64H376.512a32 32 0 0 1 0-64zM376.512 499.328h270.72a32 32 0 1 1 0 64h-270.72a32 32 0 0 1 0-64zM376.512 647.296h270.72a32 32 0 0 1 0 64h-270.72a32 32 0 1 1 0-64z"
            p-id="3729" fill="currentColor"></path>
          <path
            d="M607.552 145.92l195.2 195.136v482.112a54.912 54.912 0 0 1-54.976 54.912H276.224a54.912 54.912 0 0 1-54.912-54.912V200.832c0-30.336 24.576-54.912 54.912-54.912h331.328z m-26.496 64H285.248v604.096h453.44V367.552L581.056 209.92z"
            p-id="3730" fill="currentColor"></path>
        </svg>
      </el-button>
    </template>
    <div class="v-select-paste">
      <el-input ref="inputRef" v-model="inputValue" type="textarea" :autosize="{ minRows: 5, maxRows: 20 }" placeholder="一行一个，不限制数量" />
      <Handle :value="inputValue" submitText="确定" closeText="取消" @clear="clear" @close="close" @submit="submit" />
    </div>
  </el-popover>
</template>

<script setup>
import Handle from '../BatchInput/Handle'
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
  // border: 1px solid rgba($color: #000000, $alpha: .4);
  background-color: rgba($color: #666, $alpha: 0.3);
  &:hover {
    background-color: rgba($color: #666, $alpha: 0.2);
  }
}
</style>