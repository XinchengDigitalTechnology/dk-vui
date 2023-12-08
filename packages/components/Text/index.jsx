
import { $copyToClipboard } from "@xqsit94/vue3-copy-to-clipboard"
import { ElMessage } from "element-plus"
import { DocumentCopy } from "@element-plus/icons-vue"
import { inject } from "vue"


const VText = (props, { slots, emit, attrs }) => {
  const { value, title, type, line, copy, disabled } = props
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

  // 点击事件
  const handleClick = (e) => {
    e.stopPropagation()
    !disabled && type && emit('click')
  }

  const hasSlot = slots.default && slots.default().filter(d => d.children).length

  return <div class='v-text'>
    {title ? <span class="v-text-title">{title}:</span> : ''}
    {
      (!(value+'') || slots.default && !hasSlot) ? '-' : <div class="v-text-content-wrapper" style={{ maxHeight: lineNum * 24 + 'px' }} onMouseenter={mouseenter}
        onMouseleave={mouseleave}>
        {
          hasSlot ? slots.default() : [<div class={`v-text-content ${type ? 'is--' + type : ''} ${disabled ? 'is--disabled' : ''}`} style={style}
            onClick={handleClick}>{value}</div>,
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
  type: { type: String, validator: (val) => ['button', 'link', ''].includes(val) }, // 类型，button按钮/link链接
  line: { type: [Number, String], default: 1 }, // 溢出行数
  copy: { type: Boolean, default: false }, // 复制
  disabled: { type: Boolean, default: false }, // 禁用
}

VText.emit = ['click']

export default VText