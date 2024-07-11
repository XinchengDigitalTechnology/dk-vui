// 自动注册组件
const componentField = import.meta.globEager(['./**/index.vue', './**/index.jsx'])

export default function directive(app) {
  for (const [key, comp] of Object.entries(componentField)) {
    const name = key.replace('./', 'V').replace('/index.vue', '').replace('/index.jsx', '')
    console.log('name', name)
    const component = comp.default
    app.component(name, component)
  }
}
