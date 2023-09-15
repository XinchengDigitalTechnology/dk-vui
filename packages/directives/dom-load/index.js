/** 监听dom加载完毕 */
export default {
  mounted(el, binding) {
    const handle = binding.value
    const rect = el.getBoundingClientRect()
    handle && handle(rect)
  }
}