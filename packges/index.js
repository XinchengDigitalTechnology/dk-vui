// 全局组件自动注册
const componentField = import.meta.globEager('./**/index.vue')

export default {
  install(App) {
    for (const [key, comp] of Object.entries(componentField)) {
      const name = 'V' + key.replace('./', '').replace('/index.vue', '')
      const component = comp.default
      App.component(name, component)
    }
  }
}
