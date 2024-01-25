# dk-vui组件库（Vue 3 + Vite）

#### 组件近期改动

## 版本升级

- 2024-1-25 v0.1.2
1. table 组件增加 setPager 方法

- 2024-1-15 v0.0.53
1. VText 组件增加参数 title-position (left/top)
2. 增加下拉框组件 VSelect
3. 增加全局方法 setup(设置全局参数)
4. 增加全局方法 updateSelectOptions(动态更新options)
5. columns.item支持设置VText组件的copy参数

- 2024-1-4 v0.0.52
1. 行高默认值改为52px
2. columns.item不传slots时，默认用 VText 组件渲染，自动溢出隐藏，支持设置 line 参数

- 2024-1-2 v0.0.48
1. 增加搜索条件保存功能
2. 增加高级查询功能
3. table api 更新

- 2023-12-27 v0.0.47
1. proxyConfig配置的autoLoad设置默认值为false
2. 所有vxe-grid插槽继承内置参数

- 2023-12-18 v0.0.45
1. 修复搜索区域form键或值为数字0时，会被清空的问题

- 2023-12-11 v0.0.44
1. 分页变化及筛选条件变化触发搜索时，滚动条自动返回顶部
2. 修复线上游览器大小变化后表格高度计算不准确的问题

- 2023-12-8 v0.0.43 （让用户尽可能能看到更多数据，压缩表格表头及每行高度）
1. Table尺寸默认值设为small
2. Table行高默认值设为60，单元格行高调整为1.3rem
3. Text、Auth、Button组件用函数式组件重写（提示渲染性能）

- 2023-12-5 v0.0.39
1. 分页高度统一设置为40px
2. 纵向滚动时自动隐藏搜索区域
3. 分页大小变化及搜索条件变化时，下次搜索重置pageNum为1
4. table、page 组件 activated 时保留滚动条位置

- 2023-11-29 v0.0.35
1. 增加 VText 组件
2. 增加 getRoutes 路由组装方法
3. 自定义分页组件（表格组件在分页大小、搜索条件变化后，再次触发搜索将重置页码为1）
4. 增加带参数的页面跳转处理

#### 11-29会议

1. 组件升级不生效问题
2. 路由及编辑页面处理
3. 页面跳转处理
4. VText组件使用

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