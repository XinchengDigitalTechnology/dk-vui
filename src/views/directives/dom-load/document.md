# dom-load 元素加载完成

- dom加载完成时触发

## 按钮

#### template
```html
<div v-dom-load="load">元素</div>
```

#### script
```js
const load = (rect, target) => {
  // 第一个回调参数为dom的尺寸，第二个回调参数为元素本身
  console.log(rect, target)
}
```
