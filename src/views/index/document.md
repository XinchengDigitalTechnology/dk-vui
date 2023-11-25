# dk-vui组件库（Vue 3 + Vite）

## 组件

- VTable 表格组件（基于vxe-table二次封装）

- VPage 页面组件（覆盖所有页面）

- VGroup 组合组件（多元素组合）

- VButton 按钮组件（按钮级权限）

- VAuth 按钮组件（区块级权限）

- VText 文本组件（默认值、颜色、溢出、复制）

## 指令

- V-dom-load dom加载完毕时触发

- V-dom-resize dom大小改变时触发

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