<script setup name="VImportDataBaseResult">
import { isResultError } from '../utils'

defineProps({
  list: { type: Array, default: () => [] },
  data: { type: [Array, Object, String, Number, Boolean], default: () => [] },
})
</script>

<template>
  <div v-if="list.length" class="v-import-data-base-result">
    <div class="v-import-data-base-result-title">导入结果：</div>
    <slot name="msg" :list="list" :data="data">
      <div class="v-import-data-base-result-list">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="v-import-data-base-result-item"
          :class="{ 'is-error': isResultError(item) }"
        >
          {{ item }}
        </div>
      </div>
    </slot>
  </div>
</template>
