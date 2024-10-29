import { defineComponent } from "vue"

import { $copyToClipboard } from "@xqsit94/vue3-copy-to-clipboard"
import { ElMessage } from "element-plus"
import { DocumentCopy } from "@element-plus/icons-vue"
import { inject } from "vue"
import GlobalConfig from "~/packages/config"

const VText = defineComponent({
  setup(props, { slots, emit, attrs }) {
    // (props, { slots, emit, attrs }) => {
    // setup()
    // mounted() {
    //   // 在mounted钩子中添加事件监听
    //   this.$el.addEventListener('mouseenter', this.handleMouseEnter);
    // },
    // onMounted(()=>{
    //   console.log(19191919)
    // })
    // beforeUpdate(()=>{
    // console.log(19191919)

    // onBeforeCreate(()=>{

    //   console.log(`组件已挂载。`);
    // })

    // const aaaaa = ref()
    const { value, title, titlePosition, type, line, copy, disabled, empty } = props
    const lineNum = +line
    // console.log(props);
    // console.log(slots, emit, attrs );

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
    const updateTip = inject("updateTip", ref({}))
    let isOverflow = false

    // 页面级气泡
    // const tipRef = ref()
    // const tip = ref({
    //   visible: false,
    //   content: "",
    //   ref: null,
    //   left: 0,
    //   top: 0,
    // })

    // const qqqqq = ref()
    onBeforeUnmount(() => {
      // 当组件卸载前执行
      // console.log("onBeforeUnmount  67676767")
      // updateTip = null
      // console.log(updateTip);
      // mouseenter = () => {}
      // mouseleave = () => {}
      // updateTip({
      //   visible: false,
      //   content: null,
      //   ref: null,
      // })
      // console.log(updateTip)
      // updateTip.value = null
    })
    // })
    onUnmounted(() => {
      console.log(`onUnmounted。11111`)
      updateTip.value = null
      // window.removeEventListener('resize', handleResize);
    })

    // const tipRef = ref()
    // const tip = ref({
    //   visible: false,
    //   content: "",
    //   ref: null,
    // })
    // const updateTip = (val) => {
    //   // console.log(11111)

    //   tip.value = val
    // }

    const mouseenter = ({ target }) => {
      let valueRef = target.querySelector(".v-text-content")
      let textRef = target.querySelector(".v-text-content-wrap")
      // console.log(123)

      const { offsetWidth, offsetHeight } = textRef || {}
      const { offsetWidth: valueOffsetWidth } = valueRef || {}
      if (!offsetWidth || !offsetHeight || !valueOffsetWidth) return
      isOverflow = offsetHeight / 24 > lineNum || valueOffsetWidth < offsetWidth
      // console.log("textRef")
      // console.log(target)
      // console.log(valueRef.offsetWidth)
      // console.log(textRef.getBoundingClientRect())
      // console.log(offsetWidth);
      // console.log('offsetWidth');
      // console.log(offsetWidth);
      console.log(55555)

      // console.log(qqqqq);
      let asd = textRef.getBoundingClientRect()
      asd.w = offsetWidth
      asd.h = offsetHeight
      console.log(asd)

      if (!isOverflow) return
      updateTip &&
        updateTip({
          visible: true,
          content: props.value,
          qqqqq: asd,
          // getaaa: () => {
          //   return target
          // },
          // qqqqq
          // ref: qqqqq.value,
          // ref: valueRef,
          // visibleaaa: true,
          // left:textRef.getBoundingClientRect().left,
          // top:textRef.getBoundingClientRect().top,
        })
      // valueRef = null
    }
    const mouseleave = () => {
      // setTimeout(() => {
      updateTip &&
        updateTip({
          visible: false,
          content: null,
          ref: null,
          // visibleaaa: false,
        })
      // }, 100000);
      // updateTip &&
      // updateTip({
      //   visible: false,
      //   content: null,
      //   ref: null,
      //   visibleaaa: false,
      // })
    }
    // beforeUnmount(()=>{
    //   console.log(9998877);

    // })
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
            //
            <div class="v-text-content-wrapper" onMouseenter={mouseenter} onMouseleave={mouseleave} style={{ maxHeight: lineNum * 24 + "px" }} {...attrs}>
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
                  <svg t="1726628281165" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="4603" width="18" height="18">
                    <path
                      d="M592.96 145.6a28.16 28.16 0 0 1 23.872 43.072l-149.12 238.528v387.2h268.48-0.128 32.128a32 32 0 0 1 0 64h-322.56l-3.008-0.128a28.48 28.48 0 0 1-18.688-4.608l-154.88-103.232a28.16 28.16 0 0 1-12.544-23.424V427.2L107.52 188.672a28.16 28.16 0 0 1 23.872-43.072h461.632z m-64.768 63.936h-332.16l124.48 199.296v318.912l83.2 55.488v-374.4l124.48-199.296z m219.264 241.856l173.376 150.656-156.8 180.352H574.72l-65.536-56.96 238.208-274.048z m-27.008 128.512l-120.256 138.432h134.656l62.336-71.808-76.736-66.624z"
                      p-id="4604"
                    ></path>
                  </svg>
                  {/* <el-button icon="Search" size="small" circle /> */}
                  {/* <el-icon>
                    <DocumentCopy />
                  </el-icon> */}
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
            <svg t="1726628281165" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="4603" width="18" height="18">
              <path
                d="M592.96 145.6a28.16 28.16 0 0 1 23.872 43.072l-149.12 238.528v387.2h268.48-0.128 32.128a32 32 0 0 1 0 64h-322.56l-3.008-0.128a28.48 28.48 0 0 1-18.688-4.608l-154.88-103.232a28.16 28.16 0 0 1-12.544-23.424V427.2L107.52 188.672a28.16 28.16 0 0 1 23.872-43.072h461.632z m-64.768 63.936h-332.16l124.48 199.296v318.912l83.2 55.488v-374.4l124.48-199.296z m219.264 241.856l173.376 150.656-156.8 180.352H574.72l-65.536-56.96 238.208-274.048z m-27.008 128.512l-120.256 138.432h134.656l62.336-71.808-76.736-66.624z"
                p-id="4604"
              ></path>
            </svg>
            {/* <el-button icon="Search" size="small" circle /> */}
            {/* <el-icon>
              <DocumentCopy />
            </el-icon> */}
          </div>
        ) : (
          ""
        )}
        {/* <el-tooltip ref="tipRef" visible={tip.visible} content={tip.content} virtual-ref={tip.ref} placement="top" popper-class="app-tip" offset={3} enterable /> */}
      </div>
    )

    // }
  },
})

// onBeforeCreate(()=>{

//   console.log(`组件已挂载。`);
// })

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
// VText.mounted = ()=>{
//   console.log(123);

// }
// console.log(VText)

export default VText
