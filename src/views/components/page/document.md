# Page 页面组件

- 基础页面为列表页，页面高度100%，溢出隐藏
- edit为true时为编辑页，横向溢出隐藏，纵向溢出为自动
- 编辑页保留滚动位置

## Attributes

| 属性名 | 说明|  类型 | 默认值 |
| --- | --- | --- | --- | 
| edit | 是否为编辑页 |boolean |—|
| footer | 为编辑页时底部固定区域配置 { offset } |object |{}|
| leftConfig | 看下面的 leftConfig |object |—|
| footerConfig | {height: 高度, align: 对齐方式, offset: 偏移量} |object |—|

## leftConfig Attributes

| 属性名 | 说明|  类型 | 默认值 |
| --- | --- | --- | --- | 
| width | 左侧宽度 |boolean |200|
| collapse | 是否可折叠 |boolean |false|
| collapseValue | 是否默认折叠 |boolean |false|
| showArrow | 是否显示箭头按钮 |boolean |true|
| arrowClass | 箭头 class |string |-|
| drag | 宽度是否可拖动 |boolean |true|
| dragLineClass | 拖动线条 class |string |-|
| dragMinWidth | 拖动时的最小宽度 |number |50|
| dragMaxWidth | 拖动时的最大宽度 |number |500|

## Slots

| 插槽名 | 说明|
| --- | --- |
| left | 左侧区域 |
| footer | 编辑页底部固定区域 |

## 按钮

```js
<VPage>页面内容</VPage>
```
