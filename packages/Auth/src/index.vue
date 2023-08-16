<template>
  <div v-if="permission(auth)">
    <slot />
  </div>
</template>

<script setup name="VAuth">
const props = defineProps({
  auth: { type: String, default: '' },
})
const permission = (val) => {
  return (window.BTN_AUTH || []).includes(val)
}
</script>
