<script setup>
import { ArrowUpBold } from '@element-plus/icons-vue'

const emit = defineEmits(['toTop', 'reset'])

</script>
<template>
  <div class="vx-table--to-top">
    <div class="vx-table--to-top-item" title="返回顶部" @click="emit('toTop')">
      <el-icon color="#fff">
        <ArrowUpBold />
      </el-icon>
    </div>
    <div class="vx-table--to-top-item" title="重置搜索条件" @click="emit('reset')">
      <svg t="1726628281165" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="4603" width="18" height="18">
        <path
          d="M592.96 145.6a28.16 28.16 0 0 1 23.872 43.072l-149.12 238.528v387.2h268.48-0.128 32.128a32 32 0 0 1 0 64h-322.56l-3.008-0.128a28.48 28.48 0 0 1-18.688-4.608l-154.88-103.232a28.16 28.16 0 0 1-12.544-23.424V427.2L107.52 188.672a28.16 28.16 0 0 1 23.872-43.072h461.632z m-64.768 63.936h-332.16l124.48 199.296v318.912l83.2 55.488v-374.4l124.48-199.296z m219.264 241.856l173.376 150.656-156.8 180.352H574.72l-65.536-56.96 238.208-274.048z m-27.008 128.512l-120.256 138.432h134.656l62.336-71.808-76.736-66.624z"
          p-id="4604"></path>
      </svg>
    </div>
  </div>
</template>
