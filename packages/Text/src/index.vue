<template>
  <div class="v-text">
    <span v-if="title" class="v-text-title">{{ title }}:</span>
    <div v-if="nothing">-</div>
    <template v-else>
      <div class="v-text-content-wrapper" :style="{ maxHeight: lineNum * 24 + 'px' }" @mouseenter="mouseenter"
        @mouseleave="mouseleave">
        <slot>
          <div ref="valueRef" class="v-text-content" :class="`is--${type} ${disabled ? 'is--disabled' : ''}`"
            :style="style" @click="!disabled && type && emit('click')">{{ value }}</div>
          <div ref="textRef" class="v-text-content-wrap">{{ value }}</div>
        </slot>
        <!-- 未溢出时的复制 -->
        <div v-if="copy && !isOverflow" class="v-text-btns" title="复制" @click.stop="copyText">
          <el-icon>
            <DocumentCopy />
          </el-icon>
        </div>
      </div>
    </template>
    <!-- 溢出时的复制 -->
    <div v-if="copy && isOverflow" class="v-text-btns" title="复制" @click.stop="copyText">
      <el-icon>
        <DocumentCopy />
      </el-icon>
    </div>
  </div>
</template>

<script setup name="VText">
import { $copyToClipboard } from "@xqsit94/vue3-copy-to-clipboard"
import { ElMessage } from "element-plus"
import { DocumentCopy } from "@element-plus/icons-vue"
import { useSlots } from "vue";

const props = defineProps({
  value: { type: [Number, String], default: '' }, // 文本
  title: { type: [Number, String], default: '' }, // 标题
  type: { type: String, validator: (val) => ['button', 'link'].includes(val) }, // 类型，button按钮/link链接
  line: { type: [Number, String], default: 1 }, // 溢出行数
  copy: { type: Boolean, default: false }, // 复制
  disabled: { type: Boolean, default: false }, // 禁用
})

const emit = defineEmits(['click'])

const slots = useSlots()
const nothing = computed(() => !slots.default && !props.value && props.value !== 0)

// 溢出
const lineNum = +props.line
const style = lineNum > 1 ? {
  'display': '-webkit-box',
  '-webkit-box-orient': 'vertical',
  '-webkit-line-clamp': lineNum
} : {
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap'
}

// 复制
const copyText = () => {
  try {
    $copyToClipboard(props.value)
    ElMessage.success("复制成功")
  } catch (error) {
    ElMessage.error(error || "复制失败")
  }
}

// 溢出处理
const updateTip = inject('updateTip')
const valueRef = ref()
const textRef = ref()
const isOverflow = ref(false)

const mouseenter = ({ target }) => {
  const { offsetWidth, offsetHeight } = textRef?.value || {}
  const { offsetWidth: valueOffsetWidth } = valueRef?.value || {}
  if (!offsetWidth || !offsetHeight || !valueOffsetWidth) return
  isOverflow.value = offsetHeight / 24 > lineNum || valueOffsetWidth < offsetWidth
  if (!isOverflow.value) return
  updateTip && updateTip({
    visible: true,
    content: props.value,
    ref: target
  })
}

const mouseleave = () => {
  if (!isOverflow.value) return
  updateTip && updateTip({
    visible: false,
    content: '',
    ref: null
  })
}
</script>

<style lang="scss">
:root {
  --v-text--title-color: #666;
  --v-text--content-color: #333;
  --v-text--line-height: 1.4rem;
}

.v-text {
  display: flex;
  gap: 3px;

  &-title {
    color: var(--v-text--title-color);
    white-space: nowrap;
    line-height: var(--v-text--line-height);
  }

  &-content {
    display: inline-block;
    color: var(--v-text--content-color);
    line-height: var(--v-text--line-height);
    overflow: hidden;

    &-wrapper {
      display: flex;
      gap: 3px;
      position: relative;
      flex: 1;
      overflow: hidden;
      white-space: pre-wrap;
    }

    &-wrap {
      position: absolute;
      left: 0;
      top: 0;
      white-space: pre-wrap;
      z-index: -1;
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
}</style>