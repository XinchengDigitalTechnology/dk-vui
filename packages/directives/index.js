// 全局指令自动注册
const componentField = import.meta.globEager('./**/index.js')

export default function directive(app) {
  for (const [key, comp] of Object.entries(componentField)) {
    const name = key.replace('./', '').replace('/index.js', '')
    const component = comp.default
    app.directive(name, component)
  }
}
