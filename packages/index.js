import Page from './Page'
import Table from './Table'
import Group from './Group'
import Button from './Button'
import Auth from './Auth'
import directive from './directives'
import { gridConfig } from './Table/src/config'


const components = [
  Page,
  Table,
  Group,
  Button,
  Auth,
]

const install = (app, options) => {
  directive(app)
  components.forEach(component => {
    app.use(component)
  })
  if (options) {
    if (options.scrollHideForm === true) {
      gridConfig.scrollHideForm = true
    }
  }
}

export default {
  install,
  Page,
  Table,
  Group,
  Button,
  Auth,
}
