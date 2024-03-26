import { defineComponent } from 'vue'

/**
 * dk-vui 组件 - 文本
 */

export default /*#__PURE__*/ defineComponent(
  {
    props: {
      value: [String, Number],
      title: String,
      titlePosition: String,
      type: String,
      line: Number,
      copy: Boolean,
      disabled: Boolean,
      empty: Boolean
    }
  }
)


