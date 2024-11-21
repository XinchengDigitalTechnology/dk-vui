<script setup name="VPage">
import XEUtils from 'xe-utils'
import GlobalConfig from "~/packages/config"
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { onMousemove } from '~/packages/utils'
const keepStore = GlobalConfig.keepStore()
const router = GlobalConfig.useRouter()
const routerName = router?.currentRoute?.value?.name

// 分为列表页和表单页，默认是列表页
const props = defineProps({
  edit: Boolean, // 是否是表单页
  leftConfig: { type: Object, default: () => ({}) },
  footerConfig: { type: Object, default: () => ({}) },
  unload: { type: Function, default: () => {} },
})

// 插槽处理
let slots = computed(() => beforeHide.value ? [] : [...new Set(Object.keys(useSlots()))])

const leftConfig = ref(XEUtils.merge({}, GlobalConfig.page.leftConfig, props.leftConfig))
const footerConfig = XEUtils.merge({}, GlobalConfig.page.footerConfig, props.footerConfig)

const footerWidth = ref(0)
const resize = ({ width }, target) => {
  if (!props.edit) return
  const { scrollHeight, offsetHeight } = target
  let w = width + footerConfig.offset
  if (scrollHeight > offsetHeight) {
    w += 6
  }
  footerWidth.value = w
}

const moveX = ref(0)
const isMove = ref(false)
const start = (val) => {
  moveX.value = 0
  isMove.value = true
  document.body.style.cursor = 'col-resize'
}

const moveing = (val) => {
  moveX.value = val
}

const end = (val) => {
  leftConfig.value.width += val
  moveX.value = 0
  isMove.value = false
  document.body.style.cursor = ''
}

const transition = computed(() => isMove.value ? 'all' : `${leftConfig.value.duration/1000}s`)

const mousedown = () => {
  onMousemove({ start, moveing, end })
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

// 折叠处理
const collapse = ref(leftConfig.value.collapseValue || false)
const leftWidth = computed(() => {
  let w = 0
  if (collapse.value) return w
  const { width, dragMinWidth, dragMaxWidth } = leftConfig.value
  w = width + moveX.value
  if (dragMinWidth) {
    w = Math.max(w, dragMinWidth)
  }
  if (dragMaxWidth) {
    w = Math.min(w, dragMaxWidth)
  }
  return w + 'px'
})


// 页面级气泡
const tipRef = ref()
const tip = ref({
  visible: false,
  content: '',
  // ref: null
})
// const updateTip = (val) => {
//   tip.value = val
// }
const time = ref(null)
const updateTip = (val = {}) => {
  time.value = null
  if (val.visible) {
    // 创建/删除 临时dom
    const newElem = document.createElement("div")
    // 设置样式
    newElem.style.width = Math.floor(val.rectStyle.w) + "px"
    newElem.style.height = "1px"
    newElem.style.opacity = 0
    newElem.style.position = "fixed"
    newElem.style.left = Math.floor(val.rectStyle.left) + "px"
    newElem.style.top = Math.floor(val.rectStyle.top) + "px"
    document.getElementById("main-app").appendChild(newElem)
    time.value = setTimeout(() => {
      nextTick(() => {
        document.getElementById("main-app").removeChild(newElem)
        clearTimeout(time.value)
      })
    }, 10)
    val.ref = newElem
  }
  tip.value = val
}

const show = ref(true)
const beforeHide = ref(false)
onBeforeUnmount(() => {
  unload()
})

const unload = () => {
  beforeHide.value = true
  const timer = setTimeout(() => {
    props.unload()
    show.value = false
    clearTimeout(timer)
  }, 200);
}

watch(
  () => keepStore?.currentKeepAliveList,
  (val) => {
    if (!val.includes(routerName)) {
      unload()
    }
  },
)

provide('updateTip', updateTip)
</script>

<template>
  <template v-if="show">
    <div ref="pageRef" class="v-page" :class="{ 'is--full': !edit, 'is--edit': edit }" :style="{'--left-width': leftWidth}" v-dom-resize="resize" v-bind="$attrs"
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
      <div v-else class="v-page__body" :style="{ paddingLeft: slots.includes('left') && leftWidth,transition }">
        <div class="v-page__body-left" v-if="slots.includes('left')" :style="{transition}">
          <slot name="left"></slot>
          <div v-if="leftConfig.drag" :class="['v-page__body-drag', isMove && 'is-move']" @mousedown="mousedown">
            <div class="v-page__body-drag-line" :class="leftConfig.dragLineClass"></div>
          </div>
          <div v-else class="v-page__body-line" :class="leftConfig.lineClass"></div>
        </div>
        <slot />
      </div>
      <div v-if="leftConfig.collapse && slots.includes('left')" class="v-page__body-collapse" :class="leftConfig.arrowClass"
        :style="{left: !leftConfig.drag ? leftWidth : leftWidth ? `calc(${leftWidth} - 2px)` : 0, transition}" @click="collapse=!collapse">
        <el-button v-if="leftConfig.showArrow" :icon="collapse ? ArrowRightBold : ArrowLeftBold" type="primary">
        </el-button>
      </div>
      <el-tooltip ref="tipRef" :visible="tip.visible" :content="tip.content" :virtual-ref="tip.ref" virtual-triggering placement="top" popper-class="app-tip" :offset="3" enterable />
    </div>
  </template>
  <template v-else><div>1</div></template>
</template>

<style lang="scss">
.v-page {
  position: relative;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px;
  padding-bottom: 0;
  background-color: transparent;

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
    background-color: var(--el-bg-color);

    &-collapse {
      position: absolute;
      top: 50%;
      transform: translate(2px, -15px);
      height: 30px;
      line-height: 30px;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      .el-button{
        width: 16px;
        padding: 0;
      }
    }

    &-left {
      width: var(--left-width);
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      overflow-x: hidden;
      overflow-y: auto;
      z-index: 1;
    }

    &-line {
      width: 1px;
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      background-color: var(--vxe-table-resizable-line-color);
    }

    &-drag {
      width: 5px;
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      justify-content: center;
      &-line {
        content: '';
        height: 100%;
        width: 1px;
        background-color: var(--vxe-table-resizable-line-color);
      }
      &:hover,
      &.is-move {
        cursor: col-resize;
        .v-page__body-drag-line {
          width: 3px;
          background-color: var(--el-color-primary);
        }
      }
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

.v-text {
  display: flex;
  gap: 3px;
  width: 100%;

  &-wrapper {
    display: flex;
    gap: 3px;
    width: 100%;
    &.is--wrap {
      flex-direction: column;
    }
  }

  &-title {
    color: var(--base-sub-text-color);
    white-space: nowrap;
  }
  &-content {
    display: inline-block;
    color: var(--base-text-color);
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
      opacity: 0.6;
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
        content: '';
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