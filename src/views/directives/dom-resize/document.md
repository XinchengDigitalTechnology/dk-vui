# dom-resize 元素尺寸变化

- dom尺寸变化时触发

## 按钮

#### template
```html
<div v-dom-resize="resize">元素</div>
```

#### script
```js
const resize = (rect, target) => {
  // 第一个回调参数为dom的尺寸，第二个回调参数为元素本身
  console.log(rect, target)
}
```
