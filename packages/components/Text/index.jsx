
import { $copyToClipboard } from "@xqsit94/vue3-copy-to-clipboard"
import { ElMessage } from "element-plus"
import { DocumentCopy } from "@element-plus/icons-vue"
import { inject } from "vue"
import GlobalConfig from "~/packages/config"

const VText = (props, { slots, emit, attrs }) => {
  const { value, title, titlePosition, type, line, copy, disabled, empty } = props
  const lineNum = +line

  // 样式
  const style = lineNum > 1 ? {
    'display': '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': lineNum
  } : {
    'text-overflow': 'ellipsis',
    'white-space': 'nowrap'
  }

  // 溢出处理
  const updateTip = inject('updateTip', null)
  let isOverflow = false

  const mouseenter = ({ target }) => {
    const valueRef = target.querySelector('.v-text-content')
    const textRef = target.querySelector('.v-text-content-wrap')
    const { offsetWidth, offsetHeight } = textRef || {}
    const { offsetWidth: valueOffsetWidth } = valueRef || {}
    if (!offsetWidth || !offsetHeight || !valueOffsetWidth) return
    isOverflow = offsetHeight / 24 > lineNum || valueOffsetWidth < offsetWidth
    if (!isOverflow) return
    updateTip && updateTip({
      visible: true,
      content: props.value,
      ref: target
    })
  }
  const mouseleave = () => {
    updateTip && updateTip({
      visible: false,
      content: '',
      ref: null
    })
  }

  // 复制
  const copyText = (e) => {
    e.stopPropagation()
    try {
      $copyToClipboard(value)
      ElMessage.success("复制成功")
    } catch (error) {
      ElMessage.error(error || "复制失败")
    }
  }

  const hasSlot = slots.default && slots.default().filter(d => d.children).length

  return <div class='v-text'>
    <div class={['v-text-wrapper', titlePosition === 'top' ? 'is--wrap' : '']}>
      {title ? <span class="v-text-title">{title}:</span> : ''}
      {
        (!slots.default && !(value + '') || slots.default && !hasSlot) ? empty : <div class="v-text-content-wrapper" style={{ maxHeight: lineNum * 24 + 'px' }} onMouseenter={mouseenter}
          onMouseleave={mouseleave} {...attrs}>
          {
            hasSlot ? slots.default() : [<div class={`v-text-content${type ? ' is--' + type : ''}${disabled ? ' is--disabled' : ''}`} style={style}>{value}</div>,
            <div class="v-text-content-wrap">{value}</div>]
          }
          {/* 未溢出时的复制 */}
          {copy && !isOverflow ? <div class="v-text-btns" title="复制" onClick={copyText}>
            <el-icon>
              <DocumentCopy />
            </el-icon>
          </div> : ''}
        </div>
      }
    </div>
    {/* 溢出时的复制 */}
    {copy && isOverflow ? <div class="v-text-btns" title="复制" onClick={copyText}>
      <el-icon>
        <DocumentCopy />
      </el-icon>
    </div> : ''}
  </div>
}

VText.props = {
  value: { type: [Number, String], default: '' }, // 文本
  title: { type: [Number, String], default: '' }, // 标题
  titlePosition: { type: String, default: () => GlobalConfig.text.titlePosition }, // 标题位置
  type: { type: String, validator: (val) => ['button', 'link', ''].includes(val) }, // 类型，button按钮/link链接
  line: { type: [Number, String], default: () => GlobalConfig.text.line }, // 溢出隐藏行数
  copy: { type: Boolean, default: () => GlobalConfig.text.copy }, // 复制
  empty: { type: String, default: () => GlobalConfig.text.empty }, // 空值
  disabled: { type: Boolean, default: false }, // 禁用
}

VText.inheritAttrs = false

export default VText