import Page from './Page'
import Table from './Table'
import Group from './Group'
import Button from './Button'


const components = [
  Page,
  Table,
  Group,
  Button,
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
  Button,
}
