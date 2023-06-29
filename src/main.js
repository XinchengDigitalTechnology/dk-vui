import { createApp } from 'vue'
import DKVui from '../packges'
import App from './App.vue'

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(VXETable)
app.use(ElementPlus)
app.use(DKVui)

app.mount('#app')
