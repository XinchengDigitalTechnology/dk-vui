<template>
  <el-select v-if="$attrs.select" v-model="selectValue" v-bind="$attrs" @visible-change="isCheckAll">
    <el-option v-for="(d, i) in $attrs.options" :key="i" :label="d.label" :value="d.value"></el-option>
    <template v-if="$attrs.showHeader && $attrs.options.length" #header>
      <Header ref="headerRef" v-model="selectValue" :options="$attrs.options" />
    </template>
    <template v-for="name in slots" #[name]="obj">
      <slot :name="name" v-bind="obj" />
    </template>
  </el-select>
  <el-select-v2 v-else v-model="selectValue" v-bind="$attrs" @visible-change="isCheckAll">
    <template v-if="$attrs.showHeader && $attrs.options.length" #header>
      <Header ref="headerRef" v-model="selectValue" :options="$attrs.options" />
    </template>
    <template v-for="name in slots" #[name]="obj">
      <slot :name="name" v-bind="obj" />
    </template>
  </el-select-v2>
</template>

<script setup>
import Header from './Header'

const slots = computed(() => Object.keys(useSlots()))
const props = defineProps({
  modelValue: { type: [String, Number, Array, Object, Boolean] },
})
const emit = defineEmits(['update:modelValue'])

const selectValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const headerRef = ref()
const isCheckAll = val => {
  if(val) {
    headerRef?.value?.isCheckAll()
  }
}
</script>