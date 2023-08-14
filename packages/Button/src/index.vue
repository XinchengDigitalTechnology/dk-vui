<template>
  <el-button v-if="permission(auth)" v-bind="$attrs"><slot/></el-button>
</template>

<script setup name="VButton">
const props = defineProps({
  auth: { type: String, default: '' },
})
const permission = (val) => {
  return (window.BTN_AUTH || []).includes(val)
}
</script>
