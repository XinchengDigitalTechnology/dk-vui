<script setup name="VPage">
// 分为列表页和表单页，默认是列表页
const props = defineProps({
  edit: Boolean, // 是否是表单页
  footer: Boolean,
  footerAlign: { type: String, default: 'center' }, // 底部区域对齐方式
})
const leftSlot = useSlots().left

const pageWidth = ref(0)
const resize = ({ width }, target) => {
  if (!props.edit) return
  const { scrollHeight, offsetHeight } = target
  if (scrollHeight > offsetHeight) {
    pageWidth.value = width + 6
    return
  }
  pageWidth.value = width
}

</script>

<template>
  <div class="v-page" :class="{ 'is--full': !edit, 'is--edit': edit }" v-dom-resize="resize">
    <template v-if="edit">
      <slot />
      <template v-if="footer">
        <div style="width: 100%;height: 50px;"></div>
        <div class="v-page__footer-wrapper" :style="{ width: pageWidth + 'px' }">
          <div class="v-page__footer" :style="{ 'justify-content': footerAlign }">
            <slot name="footer" />
          </div>
        </div>
      </template>
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

  &.is--edit {
    padding-bottom: 0;
  }

  &--affix {
    .el-affix--fixed {
      right: 0;
    }
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

  &__footer {
    &-wrapper {
      width: 100%;
      position: fixed;
      right: 0;
      bottom: 0;
      z-index: 2000;
    }

    display: flex;
    align-items: center;
    background-color: #fff;
    height: 50px;
    padding: 0 15px;
    border: 1px solid #e8eaec;
    border-bottom: 0;
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