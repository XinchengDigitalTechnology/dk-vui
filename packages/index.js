import Page from './Page'
import Table from './Table'
import Group from './Group'
import Button from './Button'
import Auth from './Auth'
import Text from './Text'
import directive from './directives'
import { getRoutes } from './utils'
import { gridConfig } from './Table/src/config'

// 单独导出
export {
  Page,
  Table,
  Group,
  Button,
  Auth,
  Text,
  getRoutes
}

const components = [
  Page,
  Table,
  Group,
  Button,
  Auth,
  Text,
]

const install = (app, options) => {
   // 指令
  directive(app)

  // 组件
  components.forEach(component => {
    app.use(component)
  })

  // 参数配置
  if (options) {
    if (options.scrollHideForm === true) {
      gridConfig.scrollHideForm = true
    }
  }
}

// 整体导出
export default {
  install,
  Page,
  Table,
  Group,
  Button,
  Auth,
  Text,
}
