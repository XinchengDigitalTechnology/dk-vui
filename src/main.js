import { createApp } from 'vue'
import DKVui from '../packages'
import App from './App.vue'
import router from './router'

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import './assets/styles/css-vars.scss'

import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)
app.use(VXETable)
app.use(ElementPlus)
let num = 2
app.use(DKVui)

DKVui.setup({
  derived: {
    module_name: 'dk-vui-demo'
  },
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
  },
  cascader: {
    types: {
      department: {
        options: async () => {
          await new Promise(resolve => setTimeout(() => resolve(), 300))
          ElMessage.success('更新department options成功')
          return [
            {
              name: '技术部',
              sub: [
                { name: '前端组' },
                { name: '后端组' },
              ],
            },
            {
              name: '产品部',
              sub: [
                { name: '设计组' },
                { name: '运营组' },
              ],
            },
          ]
        },
        value: 'name',
        children: 'sub',
        emitPath: true,
        joinPath: '/',
      },
    }
  }
})
app.use(router)

app.mount('#app')
