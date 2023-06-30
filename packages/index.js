import Page from './Page'
import Table from './Table'
import Group from './Group'


const components = [
  Page,
  Table,
  Group,
]

const install = (app) => {
  components.forEach(component => {
    app.use(component)
  })
}

export default {
  install,
  Page,
  Table,
  Group,
}
