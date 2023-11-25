<template>
  <div class="v-text">
    <span v-if="title" class="v-text-title" @click.stop="() => false">{{ title }}:</span>
    <div v-if="line === 'full'" class="v-text-content">{{ showValue }}</div>
    <template v-else>
      <div class="v-text-content-wrapper" :style="{ maxHeight: (+line) * 24 + 'px' }" @mouseenter="mouseenter"
        @mouseleave="mouseleave">
        <slot>
          <div ref="valueRef" class="v-text-content" :class="`is--${type}`" :style="style" @click="emit('click')">{{ showValue }}</div>
          <div ref="textRef" class="v-text-content-wrap">{{ showValue }}</div>
        </slot>
        <!-- 未溢出时的复制 -->
        <div v-if="copy && !isOverflow" class="v-text-btns" title="复制" @click="copyText">
          <el-icon>
            <DocumentCopy />
          </el-icon>
        </div>
      </div>
    </template>
    <!-- 溢出时的复制 -->
    <div v-if="copy && isOverflow" class="v-text-btns" title="复制" @click="copyText">
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

const props = defineProps({
  value: { type: String, default: '' }, // 文本
  title: { type: String, default: '' }, // 标题
  type: { type: String, default: 'text' }, // 类型，text文本/button按钮/link链接
  line: { type: [Number, String], default: 1 }, // 溢出行数
  copy: { type: Boolean, default: false }, // 复制
})

const emit = defineEmits(['click'])

// 溢出
const line = +props.line
const style = line > 1 ? {
  'display': '-webkit-box',
  '-webkit-box-orient': 'vertical',
  '-webkit-line-clamp': line
} : {
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap'
}

// 显示的值/默认值
const showValue = computed(() => {
  const { value } = props
  if (value === 0) return 0
  return props.value || '-'
})

// 复制
const copyText = () => {
  try {
    $copyToClipboard(showValue.value)
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
  isOverflow.value = textRef?.value.offsetHeight / 24 > line || valueRef?.value.offsetWidth < textRef?.value.offsetWidth
  if (!isOverflow.value) return
  updateTip({
    visible: true,
    content: showValue.value,
    ref: target
  })
}

const mouseleave = () => {
  if (!isOverflow.value) return
  updateTip({
    visible: false,
    content: '',
    ref: null
  })
}
</script>

<style lang="scss" scoped>
.v-text {
  display: flex;
  gap: 3px;

  &-title {
    color: #666;
    white-space: nowrap;
    line-height: 1.5rem;
  }

  &-content {
    display: inline-block;
    color: #333;
    line-height: 1.5rem;
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
      line-height: 1.5rem;
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
  }

  .is--button{
    user-select: none;
  }

  .is--link {
    position: relative;
    &:hover {
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
}
</style>