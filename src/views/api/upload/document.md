# upload API

## Attributes


| 属性名        | 说明                   | 类型                 | 默认值 |
| ------------- | ---------------------- | -------------------- | ------ |
| modelValue         | 绑定值                   | string/Array        | -      |
| upload      | 上传方法 | Function              | -  |
| types         | 可上传类型                   | Array       | ['png', 'jpg', 'jpeg']      |
| fileSize         | 文件大小限制 (MB)                  | number       | 5      |
| showTip      | 是否显示提示文字 | Boolean              | true  |
| tip      | 提示文字 | string              | types+filesize  |
| limit | 可上传数量               | string/number    | -   |
| drag          | 是否开启拖动、粘贴上传         | Boolean | false      |
| card          | 是否使用卡片模式展示         | Boolean | false      |
| size          | 卡片模式展示大小（px）        | number/string        | 144      |
| edit          | 是否开启名称编辑功能       | Boolean              | false  |
| disabled      | 是否禁用 | Boolean              | false  |
| multiple      | 是否开启多个上传 | Boolean              | false  |
| required      | 是否必填，仅展示样式，校验用el-form-item包一层来处理，也可以使用插槽 title 来自定义标题 | Boolean   | false  |
| inline      | 非卡片模式下，列表是否在一行展示，默认一行展示三个，传入数字可控制一行展示数量 | Boolean/number    | true  |
| params      | 上传时的额外参数 | Object              | {}  |

## table Event

| 事件名  | 说明     | 参数 |
| ------- | -------- |  ------ |
| chang | 文件列表变化时出发（包括文件上传完成、删除）     |  function(FileList)      |