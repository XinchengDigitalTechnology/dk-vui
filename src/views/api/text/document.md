# Text API

## Attributes

column.item不传slots时，默认用 VText 组件渲染，支持设置 line 参数

| 属性名        | 说明                   | 类型                 | 默认值 |
| ------------- | ---------------------- | -------------------- | ------ |
| value         | 文本                   | string/number        | -      |
| title         | 标题                   | string/number        | -      |
| titlePosition | 标题位置               | string (left/top)    | left   |
| type          | 文本类型               | string (button/link) | -      |
| line          | 溢出隐藏行数           | number/string        | 1      |
| empty         | 空值                   | string               | '-'    |
| copy          | 是否启用复制功能       | Boolean              | false  |
| disabled      | 是否禁用，仅处理了样式 | Boolean              | false  |


