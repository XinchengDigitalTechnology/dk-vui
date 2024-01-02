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
    if(options.tableConfig) {
      XEUtils.merge(gridConfig, options.tableConfig)
    }
  }
}

export default {
  install,
  getRoutes
}
