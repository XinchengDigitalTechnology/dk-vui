# dk-vui组件库（Vue 3 + Vite）

#### 组件近期改动

1. 版本升至 0.0.39
2. 分页高度统一设置为40px
3. 纵向滚动时自动隐藏搜索区域
4. 分页大小变化及搜索条件变化时，下次搜索重置pageNum为1
5. table、page 组件 activated 时保留滚动条位置

- 这些是近期全局的调整，所有子应用要保持一致，如果不使用组件库，需要自己实现这些功能

#### 11-29会议

1. 组件升级不生效问题
2. 路由及编辑页面处理
3. 页面跳转处理
4. VText组件使用

## 版本升级

- 2023-11-29 v0.0.35
1. 增加 VText 组件
2. 增加 getRoutes 路由组装方法
3. 自定义分页组件(表格组件在分页大小、搜索条件变化后，再次触发搜索将重置页码为1)
4. 增加带参数的页面跳转处理

## 组件

- VTable 表格组件（基于vxe-table二次封装）

- VPage 页面组件（覆盖所有页面）

- VGroup 组合组件（多元素组合）

- VButton 按钮组件（按钮级权限）

- VAuth 按钮组件（区块级权限）

- VText 文本组件（默认值、颜色、溢出、复制）

## 指令

- v-dom-load dom加载完毕时触发

- v-dom-resize dom大小改变时触发

## 方法

#### getRoutes 组装路由方法

```js
import DKVui from 'dk-vui'

const routerFiles = import.meta.globEager(['../views/**/index.vue', '!**/components/**']) // 排除组件

export const routes = DKVui.getRoutes(routerFiles, 'Pms') // 第二个参数为路由名称前缀，如 Pms
```

## 安装

```git
pnpm i -g dk-vui
```

## 注册

main.js
```js
...
import DKVui from 'dk-vui'
import 'dk-vui/dist/style.css'

app.use(DKVui)
```