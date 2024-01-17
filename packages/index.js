import component from './components'
import directive from './directives'
import { getRoutes, setup } from './utils'
import { updateSelectOptions } from './components/Select/store'


const install = (app, options) => {
  // 全局参数
  setup(options)

  // 指令
  directive(app)

  // 组件
  component(app)
}

export default {
  install,
  getRoutes,
  setup,
  updateSelectOptions
}
