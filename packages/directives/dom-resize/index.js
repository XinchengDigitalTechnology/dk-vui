const map = new WeakMap()
const ob = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const handle = map.get(entry.target)
    if (handle) {
      handle(entry.contentRect, entry.target)
    }
  }
})
/** 监听dom大小变化 */
export default {
  mounted(el, binding) {
    map.set(el, binding.value)
    ob.observe(el)
  },
  unmounted(el) {
    ob.unobserve(el)
  },
}