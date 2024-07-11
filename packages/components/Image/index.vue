<script setup>
const props = defineProps({
  src: { type: [String, Array], default: '' }, // 图片url
  size: { type: String, default: '50px' }, // 图片尺寸
  list: { type: Array, default: () => {} }, // 放大列表
})

</script>

<template>
  <div class="v-image" :style="{ '--v-image-size': size }">
    <el-image v-if="Array.isArray(src)" :src="src[0]" :preview-src-list="src" v-bind="$attrs">
      <template #error>
        <svg-icon icon-class="pic_fail" class="v-image--error"></svg-icon>
      </template>
    </el-image>
    <el-image v-else :src="src" :preview-src-list="list || [src]" v-bind="$attrs">
      <template #error>
        <svg-icon icon-class="pic_fail" class="v-image--error"></svg-icon>
      </template>
    </el-image>
  </div>
</template>

<style lang="scss">
.v-image {
  
  .el-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--v-image-size);
    height: var(--v-image-size);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #f5f5f5;
  }

  .el-image__wrapper {
    position: relative;
    inset: 0;
  }

  .el-image__inner {
    width: auto;
    height: auto;
    max-width: var(--v-image-size);
    max-height: var(--v-image-size);
  }
  
  &--error {
    color: #dfdfdf;
    background-color: #FAFAFA;
    font-size: var(--v-image-size);
  }
}
</style>