<template>
  <div class="v-popover-handle">
    <el-button size="small" @click="emit('clear')">清空</el-button>
    <div>共 {{ value ? value.split('\n').length : 0 }} 个</div>
    <el-button size="small" class="v-popover-handle-right" @click="emit('close')">{{closeText}}</el-button>
    <el-button size="small" type="primary" @click="emit('submit')">{{submitText}}</el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  value: { type: String, default: '' },
  submitText: { type: String, default: '搜索' },
  closeText: { type: String, default: '关闭' },
})
const emit = defineEmits(['close', 'submit', 'clear'])
</script>

<style lang="scss">
.v-popover-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  &-right {
    margin-left: auto;
  }
  .el-button+.el-button{
    margin: 0;
  }
}
</style>