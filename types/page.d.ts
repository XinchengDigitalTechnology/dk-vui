import { defineComponent } from 'vue'

/**
 * dk-vui 组件 - 页面
 */

export default /*#__PURE__*/ defineComponent(
  (props) => () => 1,
  {
    props: {
      edit: Boolean, // 是否是表单页
      footer: { type: Object, default: () => ({}) },
    }
  }
)
