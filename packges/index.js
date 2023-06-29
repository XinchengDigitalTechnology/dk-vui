import Page from './Page/index.vue'
import Table from './Table/index.vue'
import Group from './Group/index.vue'


const components = [
  Page,
  Table,
  Group,
]

const install = (app) => {
  components.forEach(component => {
    app.component(component.name, component)
  })
}

export default {
  install,
  Page,
  Table,
  Group,
}
