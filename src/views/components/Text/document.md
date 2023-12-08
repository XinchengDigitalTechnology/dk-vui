# Text 文本组件

1. 标题默认颜色 #666，可通过设置 --v-text--title-color 更改
2. 文本默认颜色 #333，可通过设置 --v-text--content-color 更改
3. 行高默认 1.3 --v-text--line-height 更改
4. 文本默认值为 -
5. 文本支持多行溢出隐藏

## Attributes

| 属性名   | 说明                                                                             | 类型          | 默认值 |
| -------- | -------------------------------------------------------------------------------- | ------------- | ------ |
| title    | 文本标题，没有则不展示标题                                                       | string/number | —      |
| value    | 文本内容，没有内容则展示'-'，如果用插槽渲染则需要自己处理默认值                  | string/number | —      |
| line     | 文本行数，溢出内容显示...                                                        | string/number | 1      |
| copy     | 是否启用复制功能                                                                 | boolean       | false  |
| type     | 文本类型，默认text，可选 button/link，仅做了样式处理，功能需要监听点击事件去处理 | string        | text   |
| disabled | type存在且disabled为true时，显示禁用状态                                         | boolean       | false  |

## 使用

