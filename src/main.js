import { createApp } from 'vue'
import DKVui from '../packages'
import App from './App.vue'
import router from './router'

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(VXETable)
app.use(ElementPlus)
let num = 2
app.use(DKVui)
DKVui.setup({
  table: {
    scrollHideForm: true
  },
  select: {
    types: { // 配置选项
      role: async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 1000))
        ElMessage.success('更新role options成功')
        return await Array.from(Array(num++).keys()).map(value => ((value += 1) && ({ label: `角色${value}`, value })))
      }
    }
  }
})
app.use(router)

app.mount('#app')
