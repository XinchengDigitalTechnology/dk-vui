<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Loading, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  placement: { type: String, default: 'bottom' },
})

const table = inject('table')
const { proxy } = table.formConfig
const { mainKey } = proxy
if (!mainKey) {
  console.error('formConfig.proxy.mainKey 不能为空')
}

const emit = defineEmits(['query'])

const { save: model_type } = table.formConfig
let loadings = reactive({})
const list = ref([])

const query = () => {
  if (!proxy.query) {
    console.error('formConfig.proxy.query 不能为空')
    return
  }
  return proxy.query({ model_type, formConfig: table.formConfig }).then(res => {
    list.value = res.data.map(d => ((d.type = ''), d))
  })
}

const filterValue = ref('')
const visibleChange = async (val) => {
  if (val) {
    filterValue.value = ''
    await query()
  }
}

const open = () => {
  if (!proxy.save) {
    console.error('formConfig.proxy.save 不能为空')
    return
  }
  ElMessageBox.prompt('搜索条件名称', '保存搜索条件', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValidator: (val) => !val ? '不能为空' : true,
  })
    .then(({ value }) => {
      loadings.save = true
      const conditions = table.getForm()
      proxy.save({ model_type, name: value, [mainKey]: 0, conditions, formConfig: table.formConfig }).then(res => {
        ElMessage.success('保存成功')
      }).finally(() => {
        loadings.save = false
      })
    })
    .catch(() => {
      loadings.save = false
    })
}

const remove = (id, i) => {
  loadings['remove' + i] = true
  if (!proxy.remove) {
    console.error('formConfig.proxy.remove 不能为空')
    return
  }
  proxy.remove({ [mainKey]: id, formConfig: table.formConfig }).then(res => {
    list.value = list.value.filter(d => d[mainKey] !== id)
  }).finally(() => {
    loadings['remove' + i] = false
  })
}

const downRef = ref()
const check = form => {
  table.setForm(form)
  downRef?.value.handleClose()
  emit('query')
}

const filterList = computed(() => list.value.filter(d => d.name.indexOf(filterValue.value.trim()) > -1))

defineExpose({ open })
</script>

<template>
  <el-dropdown ref="downRef" split-button :placement="placement" trigger="click" type="primary" :hide-on-click="false"
    popper-class="v-save-search" @click="open" @visible-change="visibleChange">
    <el-icon v-show="loadings.save">
      <Loading />
    </el-icon>
    保存
    <template #dropdown>
      <div>
        <el-input v-if="placement === 'bottom' && list.length" v-model="filterValue" placeholder="搜索" clearable
          :prefix-icon="Search" />
        <div v-if="!filterList.length" class="v-save-search-not">无数据</div>
        <el-scrollbar max-height="520px">
          <div v-for="(d, i) in filterList" :key="i" class="v-save-search-item">
            <div class="v-save-search-text" @mouseenter="d.type = 'button'" @mouseleave="d.type = ''">
              <VText :value="d.name" :type="d.type || ''" @click="check(d.conditions)" />
            </div>
            <el-button link type="danger" :loading="loadings['remove' + i]" :icon="Delete"
              @click.stop="remove(d[mainKey], i)"></el-button>
          </div>
        </el-scrollbar>
        <el-input v-if="placement === 'top' && list.length" v-model="filterValue" placeholder="搜索" clearable
          :prefix-icon="Search" />
      </div>
    </template>
  </el-dropdown>
</template>

<style lang="scss">
.v-save-search {
  width: 160px;

  &-not {
    line-height: 32px;
    text-align: center;
    color: #888;
  }

  &-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 8px;
    white-space: nowrap;
    line-height: 22px;
    padding: 0 16px;
    cursor: pointer;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-regular);

    &:hover {
      --v-text--content-color: var(--color-primary);
      background-color: rgba($color: #3487FF, $alpha: .1);
    }
  }

  &-text {
    padding: 5px 0;
    flex: 0 0 100px;
    overflow: hidden;
  }
}
</style>