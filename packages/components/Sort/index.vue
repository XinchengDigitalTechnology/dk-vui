<template>
  <el-dropdown v-if="dropdown">
    <el-button link type='primary'>
      排序
      <svg t="1731380411809" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3509" width="12" height="12" style="margin-left: 3px;">
        <path
          d="M56.45541609 197.93665077a69.42160684 69.42160684 0 0 0-15.13391028 87.47122459l7.21984711 10.2743978 466.09666814 547.04226169 460.95946924-547.31994811a69.42160684 69.42160684 0 0 0-97.19024955-98.30099527l-8.88596565 8.8859657-355.57747011 422.08336941-359.60392328-422.36105584a69.42160684 69.42160684 0 0 0-87.74891103-15.13391029l-10.13555459 7.35869032z"
          p-id="3510" fill="currentColor"></path>
      </svg>
    </el-button>
    <template #dropdown>
      <div class='v-sort' style='padding: 10px'>
        <div v-for="(d, i) in value" :key="i" class='v-sort-wrapper' style="justify-content: space-between;">
          {{d.label}}
          <div class='v-sort-item'>
            <svg t="1731380583040" :class="[form.sort.field === d.value && form.sort.rule === 'asc' && 'v-sort-icon-active', 'v-sort-icon']" @click="handleSort(d.value, 'asc')"
              viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3915" width="12" height="12">
              <path d="M512 143.8968754L1002.8041661 880.1031246l-981.6083322 0z" p-id="3916" fill="currentColor"></path>
            </svg>
            <svg t="1731317461477" :class="[form.sort.field === d.value && form.sort.rule === 'desc' && 'v-sort-icon-active', 'v-sort-icon']" size="16"
              @click="handleSort(d.value, 'desc')" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4188" width="16" height="16">
              <path d="M512 880.1031246L21.1958339 143.8968754l981.6083322 0z" p-id="3759" fill="currentColor"></path>
            </svg>
          </div>
        </div>
      </div>
    </template>
  </el-dropdown>
  <div v-else class='v-sort'>
    <div v-for="(d, i) in value" :key="i" class='v-sort-wrapper'>
      {{d.label}}
      <div class='v-sort-item'>
        <svg t="1731380583040" :class="[form.sort.field === d.value && form.sort.rule === 'asc' && 'v-sort-icon-active', 'v-sort-icon']" @click="handleSort(d.value, 'asc')"
          viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3915" width="12" height="12">
          <path d="M512 143.8968754L1002.8041661 880.1031246l-981.6083322 0z" p-id="3916" fill="currentColor"></path>
        </svg>
        <svg t="1731317461477" :class="[form.sort.field === d.value && form.sort.rule === 'desc' && 'v-sort-icon-active', 'v-sort-icon']" @click="handleSort(d.value, 'desc')"
          viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4188" width="12" height="12">
          <path d="M512 880.1031246L21.1958339 143.8968754l981.6083322 0z" p-id="3759" fill="currentColor"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: { type: Array, default: () => ([]) },
  dropdown: Boolean,
})

const { form, sort, clearSort } = inject('table') || reactive({ form: { value: {} } })

if (!sort) {
  console.error('VSort 组件必须在 VTable 组件内部使用')
}

if (form.value.sort === undefined) {
  form.value.sort = { field: '', rule: '' }
}
const emit = defineEmits(['change'])

const handleSort = (name, s) => {
  const rule = form.value.sort.field === name && form.value.sort.rule === s ? '' : s
  const obj = { field: name, order: rule, rule }
  clearSort && clearSort()
  sort ? sort(obj) : form.value.sort = obj
  emit('change', obj)
}
</script>

<style lang="scss">
.v-sort {
  display: flex;
  flex-direction: column;
  gap: 6px;
  &-wrapper {
    display: flex;
    align-items: center;
  }
  &-item {
    display: flex;
    flex-direction: column;
    margin-left: 2px;
  }
  &-icon {
    width: 12px;
    height: 10px;
    color: var(--vxe-table-column-icon-border-color);
    &:hover {
      color: var(--vxe-font-color);
      cursor: pointer;
    }
    &.v-sort-icon-active {
      color: var(--el-color-primary);
    }
  }
}
</style>