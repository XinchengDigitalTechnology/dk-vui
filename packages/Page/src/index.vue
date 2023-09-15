<script setup name="VPage">
// 分为列表页和表单页，默认是列表页
defineProps({
  edit: Boolean, // 是否是表单页
})
const leftSlot = useSlots().left

</script>

<template>
  <div class="v-page" :class="{ 'is--full': !edit }">
    <template v-if="edit">
      <slot />
      <el-affix position="bottom" :offset="0" class="w-full">
        <div class="v-page__footer">
          <slot name="footer" />
        </div>
      </el-affix>
    </template>
    <div v-else class="v-page__body" :class="{ 'is--left': leftSlot }">
      <div class="v-page__body-left" v-if="leftSlot">
        <slot name="left"></slot>
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.v-page {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px;

  &.is--full {
    overflow: hidden;
  }

  &__body {
    position: relative;
    height: 100%;
    border-radius: 8px 8px 0 0;
    background-color: #fff;

    &.is--left {
      padding-left: 200px;
    }

    &-left {
      width: 200px;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      overflow-x: hidden;
      overflow-y: auto;
      z-index: 1;
      box-shadow: 1px 0 0 0 rgba($color: #EFF3FE, $alpha: 1.0);
    }

    &::after {
      content: '';
    }
  }
  &__footer{
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 8px 15px;
    border: 1px solid #e8eaec;
    border-bottom: 0;
    border-radius: 6px 6px 0 0;
    overflow: hidden;
  }

  .v-title {
    font-weight: bold;
    border-left: 2px solid var(--el-color-primary);
    padding-left: 10px;
    height: 16px;
    line-height: 16px;
  }
}
</style>