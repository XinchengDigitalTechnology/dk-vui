<template>
  <el-dropdown v-if="dropdown">
    <el-button link type='primary'>
      排序<el-icon class='el-icon--right'>
        <ArrowDown />
      </el-icon>
    </el-button>
    <template #dropdown>
      <div class='v-sort' style='padding: 10px'>
        <div v-for="(d, i) in value" :key="i" class='v-sort-wrapper' style="justify-content: space-between;">
          {{d.label}}
          <div class='v-sort-item'>
            <el-icon :class="[form.sort.field === d.value && form.sort.rule === 'asc' && 'v-sort-icon-active', 'v-sort-icon']" size="16" @click="handleSort(d.value, 'asc')">
              <CaretTop />
            </el-icon>
            <el-icon :class="[form.sort.field === d.value && form.sort.rule === 'desc' && 'v-sort-icon-active', 'v-sort-icon']" size="16" @click="handleSort(d.value, 'desc')">
              <CaretBottom />
            </el-icon>
          </div>
        </div>
      </div>
    </template>
  </el-dropdown>
  <div v-else class='v-sort'>
    <div v-for="(d, i) in value" :key="i" class='v-sort-wrapper'>
      {{d.label}}
      <div class='v-sort-item'>
        <el-icon :class="[form.sort.field === d.value && form.sort.rule === 'asc' && 'v-sort-icon-active', 'v-sort-icon']" size="16" @click="handleSort(d.value, 'asc')">
          <CaretTop />
        </el-icon>
        <el-icon :class="[form.sort.field === d.value && form.sort.rule === 'desc' && 'v-sort-icon-active', 'v-sort-icon']" size="16" @click="handleSort(d.value, 'desc')">
          <CaretBottom />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CaretTop, CaretBottom, ArrowDown } from '@element-plus/icons-vue'
const props = defineProps({
  value: { type: Array, default: () => ([]) },
  dropdown: Boolean,
})

const { form, sort, clearSort } = inject('table') || reactive({form: {value: {}}})

if(!sort) {
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
  }
  &-icon.el-icon {
    height: 8px;
    color: #aaa;
    &:hover {
      color: #666;
      cursor: pointer;
    }
    &.v-sort-icon-active {
      color: var(--el-color-primary);
    }
  }
}
</style>