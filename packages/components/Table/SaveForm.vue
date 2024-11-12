<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'

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
  <el-dropdown ref="downRef" split-button :placement="placement" trigger="click" type="primary" :hide-on-click="false" popper-class="v-save-search" @click="open"
    @visible-change="visibleChange">
    <svg v-show="loadings.save" t="1731381498273" class="el-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3511" width="12" height="12">
      <path
        d="M511.87476907 273.06461973h-0.38532694a34.1322496 34.1322496 0 0 1-33.77004266-34.1091296v-0.38532693c0-0.11174507 0.12330453-12.50385493 0.12330453-67.90229227V68.26726827a34.1322496 34.1322496 0 1 1 68.26835307 0V170.66787093c0 56.09202453-0.11945173 68.14119467-0.1271584 68.62670614a34.1361024 34.1361024 0 0 1-34.1091296 33.77004266zM511.9980736 989.86498133a34.1322496 34.1322496 0 0 1-34.1322496-34.1322496v-102.80519573c0-55.05164267-0.11945173-67.38595413-0.12330453-67.50540587s0-0.25816853 0-0.38532586a34.1322496 34.1322496 0 0 1 68.2644992-0.3352352c0 0.48551147 0.12715733 12.49229547 0.12715733 68.30303253v102.72813013a34.1322496 34.1322496 0 0 1-34.1361024 34.1322496zM318.82603307 353.0892928a34.0243584 34.0243584 0 0 1-24.39118827-10.2535456c-0.0809184-0.0809184-8.75462507-8.9280224-47.92694933-48.10034773L174.0780128 222.324784a34.1322496 34.1322496 0 0 1 48.273744-48.26989013L294.75851947 246.46165653c39.6616896 39.6616896 48.09649387 48.26989013 48.43943466 48.61668374A34.1322496 34.1322496 0 0 1 318.82603307 353.0892928zM825.7465824 859.855712a34.0282112 34.0282112 0 0 1-24.13687253-9.99923093L729.1990944 777.4497184c-39.17232427-39.17232427-48.01942827-47.8498848-48.10419947-47.934656a34.1322496 34.1322496 0 0 1 47.76125867-48.7785216c0.34679467 0.339088 8.9549952 8.77774507 48.6166848 48.4394336l72.40676267 72.40676267a34.1322496 34.1322496 0 0 1-24.13301867 58.27297493zM204.80012053 859.855712a34.0282112 34.0282112 0 0 0 24.13687147-9.99923093l72.40676267-72.40676267c39.17232427-39.17232427 48.02328107-47.8498848 48.10420053-47.934656a34.1322496 34.1322496 0 0 0-47.76125973-48.7785216c-0.34679467 0.339088-8.9549952 8.77774507-48.6166848 48.4394336l-72.40676267 72.41061653a34.1322496 34.1322496 0 0 0 24.13687253 58.26912107zM238.87842453 546.19582827h-0.38532693c-0.11174507 0-12.50385493-0.12330453-67.90229227-0.12330454H68.205616a34.1322496 34.1322496 0 1 1 0-68.268352h102.3967488c56.09202453 0 68.14119467 0.11945173 68.6267072 0.12715734a34.1322496 34.1322496 0 0 1 33.7700416 34.10913066v0.38532694a34.1361024 34.1361024 0 0 1-34.12068907 33.7700416zM785.0021248 546.19582827a34.1361024 34.1361024 0 0 1-34.1283968-33.77774827v-0.38532693a34.1322496 34.1322496 0 0 1 33.77004267-34.101424c0.48551147 0 12.5385344-0.12715733 68.63056-0.12715734h102.4006016a34.1322496 34.1322496 0 0 1 0 68.268352H853.27433067c-55.39843627 0-67.7905472 0.11945173-67.90999894 0.12330454h-0.35835413zM705.06607573 353.08544a34.1322496 34.1322496 0 0 1-24.3873344-58.00709973c0.339088-0.34679467 8.77774507-8.9549952 48.43943467-48.61668374l72.40676267-72.41061653A34.1322496 34.1322496 0 1 1 849.80638827 222.324784l-72.41832214 72.40676267c-33.08801387 33.09186667-44.42047573 44.54378027-47.19097493 47.3528128l-0.74368107 0.77065386a34.03591787 34.03591787 0 0 1-24.3873344 10.23042667z"
        fill="" p-id="3512"></path>
    </svg>
    保存
    <template #dropdown>
      <div>
        <el-input v-if="placement === 'bottom' && list.length > 10" v-model="filterValue" placeholder="搜索" clearable :prefix-icon="Search" />
        <div v-if="!filterList.length" class="v-save-search-not">无数据</div>
        <el-scrollbar max-height="520px">
          <div v-for="(d, i) in filterList" :key="i" class="v-save-search-item">
            <div class="v-save-search-text" @mouseenter="d.type = 'button'" @mouseleave="d.type = ''">
              <VText :value="d.name" :type="d.type || ''" @click="check(d.conditions)" />
            </div>
            <el-button link type="danger" :loading="loadings['remove' + i]" :icon="Delete" @click.stop="remove(d[mainKey], i)"></el-button>
          </div>
        </el-scrollbar>
        <el-input v-if="placement === 'top' && list.length > 10" v-model="filterValue" placeholder="搜索" clearable :prefix-icon="Search" />
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
      background-color: rgba($color: #3487ff, $alpha: 0.1);
    }
  }

  &-text {
    padding: 5px 0;
    flex: 0 0 100px;
    overflow: hidden;
  }
}
</style>