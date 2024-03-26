import { defineComponent } from 'vue'

/**
 * dk-vui 组件 - 下拉框
 */

export default /*#__PURE__*/ defineComponent(
  (props) => () => 1,
  {
    props: {
      modelValue: [String, Number, Array, Object],
      options: [Function, Array],
      types: [Object],
      type: String,
      filterable: Boolean,
      clearable: Boolean,
      multiple: Boolean,
      select: Boolean,
      paste: Boolean
    },
    emits: ['change', 'visible-change']
  }
)
