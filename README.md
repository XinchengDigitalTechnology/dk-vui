# dk-vui组件库（Vue 3 + Vite）

#### 组件

- VTable 表格组件（基于vxe-table二次封装）

- VPage 页面组件（覆盖所有页面）

- VGroup 组合组件（多元素组合）

- VButton 按钮组件（按钮级权限）

- VAuth 按钮组件（区块级权限）

- VText 文本组件（默认值、颜色、溢出、复制）

#### 指令

- V-dom-load dom加载完毕时触发

- V-dom-resize dom大小改变时触发

#### 安装

```git
pnpm i -g dk-vui
```

#### 注册

main.js
```js
...
import DKVui from 'dk-vui'
import 'dk-vui/dist/style.css'

app.use(DKVui)
```

#### 使用

```html
<VPage>
  <VTable ref="tableRef" v-bind="tableOptins">
    <template #form="{ form }">
      <el-input v-model="form.base" class="w-40" placeholder="普通类型"></el-input>
      <VGroup>
        <div class="v-group-item">带标题</div>
        <el-input v-model="form.base" class="w-40" placeholder="带标题"></el-input>
      </VGroup>
      <el-date-picker v-model="form.date.value" type="daterange" range-separator="至" start-placeholder="日期开始"
        end-placeholder="日期结束" style="max-width: 300px" />
      <VGroup>
        <el-select v-model="form.group.type" style="max-width: 100px">
          <el-option label="组合1" value="group1"></el-option>
          <el-option label="组合2" value="group2"></el-option>
        </el-select>
        <el-input v-model="form.group.value"></el-input>
      </VGroup>
      <VGroup>
        <el-select v-model="form.dateRange.type" style="max-width: 150px">
          <el-option label="类型+日期范围1" value="dateRange1"></el-option>
          <el-option label="类型+日期范围2" value="dateRange2"></el-option>
        </el-select>
        <el-date-picker v-model="form.dateRange.value" type="daterange" range-separator="至"
          start-placeholder="Start date" end-placeholder="End date" style="max-width: 300px" />
      </VGroup>
      <VGroup>
        <el-select v-model="form.sizeRange.type" style="max-width: 150px">
          <el-option label="类型+尺寸范围1" value="sizeRange1"></el-option>
          <el-option label="类型+尺寸范围2" value="sizeRange2"></el-option>
        </el-select>
        <el-input-number v-model="form.sizeRange.start" :controls="false" placeholder="最小值" />
        <div class="v-group-item">至</div>
        <el-input-number v-model="form.sizeRange.end" :controls="false" placeholder="最大值" />
      </VGroup>
    </template>
    <template #toolbar_btns>
      <el-button type="primary" @click="create(tableRef)">新增</el-button>
      <el-button class="ml-auto">导出</el-button>
    </template>
  </VTable>
</VPage>
```

```js
const tableRef = ref()
const query = () => {
  tableRef?.value.query()
}
const tableOptins = reactive({
  formConfig: {
    data: {
      base: '', // 基础类型
      date: { value: [], range: true, rangeKeys: ['start_time', 'end_time'] }, // 日期
      group: { type: 'group1', value: '' }, // 组合
      dateRange: { type: 'dateRange1', value: [], range: true }, // 组合+日期范围
      sizeRange: { type: 'sizeRange1' }, // 组合+范围
    }
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 60 },
    { field: 'name', title: 'Name' },
    { field: 'nickname', title: 'Nickname' },
    { field: 'role', title: 'Role' },
    { field: 'address', title: 'Address', showOverflow: true }
  ],
  proxyConfig: {
    ajax: {
      query: ({ page, form }) => {
        console.log('提交后端的form: ', form)
        return api.query(...page, ...form)
      }
    }
  }
})

```