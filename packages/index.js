import component from './components'
import directive from './directives'
import { getRoutes } from './utils'
import { gridConfig } from './components/Table/config'
import XEUtils from 'xe-utils'

const install = (app, options) => {
  // 指令
  directive(app)

  // 组件
  component(app)

  // 参数配置
  if (options) {
    if (options.scrollHideForm === true) {
      gridConfig.scrollHideForm = true
    }
    const { proxy } = options.tableConfig?.formConfig || {}
    if (proxy) {
      gridConfig.formConfig.proxy = proxy
    }
  }
}

export default {
  install,
  getRoutes
}
