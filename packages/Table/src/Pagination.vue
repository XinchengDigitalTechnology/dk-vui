<template>
  <div :class="{ 'hidden': hidden }" class="pagination-container">
    <vxe-pager :background="background" v-model:current-page="pageNum" v-model:page-size="pageSize" :layouts="layouts"
      :page-sizes="pageSizes" :pager-count="pagerCount" :total="total" @page-change="pageChange" />
  </div>
</template>

<script setup>
const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  pageNum: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default() {
      return [20, 50, 100, 200, 500]
    }
  },
  // 移动端页码按钮的数量端默认值5
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
  },
  layouts: {
    type: Array,
    default: ['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Sizes', 'Total']
  },
  background: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:pageNum', 'update:pageSize', 'change']);
const pageNum = computed({
  get() {
    return props.pageNum
  },
  set(val) {
    emit('update:pageNum', val)
  }
})
const pageSize = computed({
  get() {
    return props.pageSize
  },
  set(val) {
    emit('update:pageSize', val)
  }
})
function pageChange(val) {
  emit('change', val)
}

</script>

<style scoped>
.pagination-container {
  height: 40px;
  background: #fff;
}

.pagination-container.hidden {
  display: none;
}
</style>