import { defineComponent } from "vue"
import { $copyToClipboard } from "@xqsit94/vue3-copy-to-clipboard"
import { ElMessage } from "element-plus"
import { inject } from "vue"
import GlobalConfig from "~/packages/config"

// const VText = (props, { slots, emit, attrs }) => {
const VText = defineComponent({
  setup(props, { slots, emit, attrs }) {
    const { value, title, titlePosition, type, line, copy, disabled, empty } = props
    const lineNum = +line

    // 样式
    const style =
      lineNum > 1
        ? {
            display: "-webkit-box",
            "-webkit-box-orient": "vertical",
            "-webkit-line-clamp": lineNum,
          }
        : {
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
          }
    // 溢出处理
    const updateTip = inject("updateTip", null)
    let isOverflow = false
    onUnmounted(() => {
      updateTip.value = null
    })

    const mouseenter = ({ target }) => {
      const valueRef = target.querySelector(".v-text-content")
      const textRef = target.querySelector(".v-text-content-wrap")
      const { offsetWidth, offsetHeight } = textRef || {}
      const { offsetWidth: valueOffsetWidth } = valueRef || {}
      if (!offsetWidth || !offsetHeight || !valueOffsetWidth) return
      isOverflow = offsetHeight / 24 > lineNum || valueOffsetWidth < offsetWidth
      if (!isOverflow) return

      let { left, top } = target.getBoundingClientRect()
      
      updateTip &&
        updateTip({
          visible: true,
          content: props.value,
          // ref: target,
          rectStyle: { left: left, top: top, w: offsetWidth },
        })
    }
    const mouseleave = () => {
      updateTip &&
        updateTip({
          visible: false,
          content: "",
          // ref: null
          rectStyle: {},
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

    const hasSlot = slots.default && slots.default().filter((d) => d.children).length

    return () => (
      <div class="v-text">
        <div class={["v-text-wrapper", titlePosition === "top" ? "is--wrap" : ""]}>
          {title ? <span class="v-text-title">{title}:</span> : ""}
          {(!slots.default && !(value + "")) || (slots.default && !hasSlot) ? (
            empty
          ) : (
            <div class="v-text-content-wrapper" style={{ maxHeight: lineNum * 24 + "px" }} onMouseenter={mouseenter} onMouseleave={mouseleave} {...attrs}>
              {hasSlot
                ? slots.default()
                : [
                    <div class={`v-text-content${type ? " is--" + type : ""}${disabled ? " is--disabled" : ""}`} style={style}>
                      {value}
                    </div>,
                    <div class="v-text-content-wrap">{value}</div>,
                  ]}
              {/* 未溢出时的复制 */}
              {copy && !isOverflow ? (
                <div class="v-text-btns" title="复制" onClick={copyText}>
                  {/* <el-icon>
              <DocumentCopy />
            </el-icon> */}
                  <svg t="1730196002806" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27108" width="16" height="16">
                    <path
                      d="M771.712 164.928c45.76 0 83.328 34.88 87.616 79.488l0.384 8.512v336c0 45.76-34.88 83.328-79.552 87.616l-8.448 0.384h-63.424v-64h63.424a24 24 0 0 0 23.488-19.2l0.512-4.8v-336a24 24 0 0 0-19.2-23.488l-4.8-0.512h-336a24 24 0 0 0-23.488 19.2l-0.512 4.8v62.144h-64v-62.144c0-45.76 34.88-83.328 79.552-87.616l8.448-0.384h336z"
                      p-id="27109"
                    ></path>
                    <path d="M644.288 315.072a64 64 0 0 1 64 64v384a64 64 0 0 1-64 64h-384a64 64 0 0 1-64-64v-384a64 64 0 0 1 64-64h384z m0 64h-384v384h384v-384z" p-id="27110"></path>
                    <path d="M484.288 455.872m0 32l0 192q0 32-32 32l0 0q-32 0-32-32l0-192q0-32 32-32l0 0q32 0 32 32Z" p-id="27111"></path>
                    <path d="M324.288 551.872m32 0l192 0q32 0 32 32l0 0q0 32-32 32l-192 0q-32 0-32-32l0 0q0-32 32-32Z" p-id="27112"></path>
                  </svg>
                </div>
              ) : (
                ""
              )}
            </div>
          )}
        </div>
        {/* 溢出时的复制 */}
        {copy && isOverflow ? (
          <div class="v-text-btns" title="复制" onClick={copyText}>
            {/* <el-icon>
        <DocumentCopy />
      </el-icon> */}
            <svg t="1730196002806" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27108" width="16" height="16">
              <path
                d="M771.712 164.928c45.76 0 83.328 34.88 87.616 79.488l0.384 8.512v336c0 45.76-34.88 83.328-79.552 87.616l-8.448 0.384h-63.424v-64h63.424a24 24 0 0 0 23.488-19.2l0.512-4.8v-336a24 24 0 0 0-19.2-23.488l-4.8-0.512h-336a24 24 0 0 0-23.488 19.2l-0.512 4.8v62.144h-64v-62.144c0-45.76 34.88-83.328 79.552-87.616l8.448-0.384h336z"
                p-id="27109"
              ></path>
              <path d="M644.288 315.072a64 64 0 0 1 64 64v384a64 64 0 0 1-64 64h-384a64 64 0 0 1-64-64v-384a64 64 0 0 1 64-64h384z m0 64h-384v384h384v-384z" p-id="27110"></path>
              <path d="M484.288 455.872m0 32l0 192q0 32-32 32l0 0q-32 0-32-32l0-192q0-32 32-32l0 0q32 0 32 32Z" p-id="27111"></path>
              <path d="M324.288 551.872m32 0l192 0q32 0 32 32l0 0q0 32-32 32l-192 0q-32 0-32-32l0 0q0-32 32-32Z" p-id="27112"></path>
            </svg>
          </div>
        ) : (
          ""
        )}
      </div>
    )
  },
})
VText.props = {
  value: { type: [Number, String], default: "" }, // 文本
  title: { type: [Number, String], default: "" }, // 标题
  titlePosition: { type: String, default: () => GlobalConfig.text.titlePosition }, // 标题位置
  type: { type: String, validator: (val) => ["button", "link", ""].includes(val) }, // 类型，button按钮/link链接
  line: { type: [Number, String], default: () => GlobalConfig.text.line }, // 溢出隐藏行数
  copy: { type: Boolean, default: () => GlobalConfig.text.copy }, // 复制
  empty: { type: String, default: () => GlobalConfig.text.empty }, // 空值
  disabled: { type: Boolean, default: false }, // 禁用
}

VText.inheritAttrs = false

export default VText
