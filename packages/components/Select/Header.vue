<template>
  <el-checkbox v-model="checkAll" class="v-select-checkAll" @change="handleCheckAll">全选</el-checkbox>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number, Array, Object], default: () => '' },
  options: { type: Array, default: () => ([]) },
})
const emit = defineEmits(['update:modelValue', 'change'])

const checkAll = ref(false)

const selectValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const isCheckAll = () => {
  checkAll.value = selectValue.value.length === props.options.length && !props.options.some(d => !selectValue.value.includes(d.value))
}

watch(selectValue, isCheckAll)
watch(() => props.options.length, isCheckAll)

const handleCheckAll = (val) => {
  selectValue.value = val ? props.options.map(d => d.value) : []
}

defineExpose({ isCheckAll })
</script>