# Button 按钮组件

- 针对按钮的权限组件
- 继承el-button组件的属性、事件、插槽

## Attributes

| 属性名 | 说明|  类型 | 默认值 |
| --- | --- | --- | --- | 
| auth | 绑定值，必须与权限路径一致 |string |—|

## Slots
继承el-button

## 使用

```js
<VButton auth='/pms/order/add'>权限按钮</VButton>
```
