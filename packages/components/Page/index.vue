<script setup name="VPage">
import XEUtils from 'xe-utils'

// 分为列表页和表单页，默认是列表页
const props = defineProps({
  edit: Boolean, // 是否是表单页
  footer: { type: Object, default: () => ({}) },
})

// 插槽处理
let slots = computed(() => [...new Set(Object.keys(useSlots()))])

const footerConfig = computed(() => XEUtils.merge({ height: 50, align: 'center', offset: 0 }, props.footer))

const footerWidth = ref(0)
const resize = ({ width }, target) => {
  if (!props.edit) return
  const { scrollHeight, offsetHeight } = target
  let w = width + footerConfig.value.offset
  if (scrollHeight > offsetHeight) {
    w += 6
  }
  footerWidth.value = w
}

// 滚动处理
const scroll = ref({ scrollLeft: 0, scrollTop: 0 })
const pageRef = ref()
const handleScroll = ({ target }) => {
  const { scrollTop, scrollLeft } = target
  scroll.value = { scrollTop, scrollLeft }
}
onActivated(() => {
  pageRef.value.scrollLeft = scroll.value.scrollLeft
  pageRef.value.scrollTop = scroll.value.scrollTop
})

// 页面级气泡
const tipRef = ref()
const tip = ref({
  visible: false,
  content: '',
  ref: null
})
const updateTip = (val) => {
  tip.value = val
}
provide('updateTip', updateTip)
</script>

<template>
  <div ref="pageRef" class="v-page" :class="{ 'is--full': !edit, 'is--edit': edit }" v-dom-resize="resize"
    @scroll="handleScroll">
    <template v-if="edit">
      <slot />
      <template v-if="slots.includes('footer')">
        <div :style="{ width: '100%', height: `${footerConfig.height}px` }"></div>
        <div class="v-page__footer-wrapper" :style="{ width: footerWidth + 'px', height: `${footerConfig.height}px` }">
          <div class="v-page__footer" :style="{ 'justify-content': footerConfig.align }">
            <slot name="footer" />
          </div>
        </div>
      </template>
    </template>
    <div v-else class="v-page__body" :class="{ 'is--left': slots.includes('left') }">
      <div class="v-page__body-left" v-if="slots.includes('left')">
        <slot name="left"></slot>
      </div>
      <slot />
    </div>
  </div>
  <el-tooltip ref="tipRef" :visible="tip.visible" :content="tip.content" :virtual-ref="tip.ref" virtual-triggering
    placement="top" popper-class="app-tip" :offset="3" enterable />
</template>

<style lang="scss">
.v-page {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px;
  padding-bottom: 0;

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
      padding: 0 15px;
      z-index: 2000;
      border: 1px solid #e8eaec;
      background-color: #fff;
      border-bottom: 0;
      overflow: hidden;
    }

    display: flex;
    align-items: center;
    height: 100%;
  }

  .v-title {
    font-weight: bold;
    border-left: 2px solid var(--el-color-primary);
    padding-left: 10px;
    height: 16px;
    line-height: 16px;
  }
}

:root {
  --v-text--title-color: #666;
  --v-text--content-color: #333;
}

.v-text {
  display: flex;
  gap: 3px;
  width: 100%;

  &-wrapper {
    display: flex;
    gap: 3px;
    width: 100%;
    &.is--wrap{
      flex-direction: column;
    }
  }

  &-title {
    color: var(--v-text--title-color);
    white-space: nowrap;
  }

  &-content {
    display: inline-block;
    color: var(--v-text--content-color);
    overflow: hidden;

    &-wrapper {
      display: inline-flex;
      gap: 3px;
      position: relative;
      overflow: hidden;
      white-space: pre-wrap;
    }

    &-wrap {
      position: absolute;
      left: 0;
      top: 0;
      white-space: pre-wrap;
      z-index: -1;
      opacity: 0;
    }
  }

  .is--button,
  .is--link {
    cursor: pointer;
    color: var(--el-color-primary);

    &:hover {
      color: var(--el-color-primary-light-3);
    }

    &.is--disabled {
      opacity: .6;
      cursor: no-drop;
    }
  }

  .is--button {
    user-select: none;
  }

  .is--link {
    position: relative;

    &:not(.is--disabled):hover {
      &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        height: 0;
        bottom: 0;
        border-bottom: 1px solid var(--el-color-primary);
      }
    }
  }

  &-btns {
    display: flex;
    align-items: center;
    gap: 3px;
    opacity: 0;
    transition: all 0.2s ease;
    transform: translateX(-8px) scale(0.7);

    i {
      vertical-align: middle;
    }
  }

  &:hover {
    .v-text-btns {
      cursor: pointer;
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
}
</style>