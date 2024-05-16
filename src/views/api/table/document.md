# Table API

## columns item Attributes

column.item不传slots时，默认用 VText 组件渲染，支持设置 line 参数

| 属性名 | 说明     | 类型          | 默认值 |
| ------ | -------- | ------------- | ------ |
| line   | 展示行数 | number/string | -      |

## formConfig Attributes

| 属性名 | 说明                                                     | 类型   | 默认值 |
| ------ | -------------------------------------------------------- | ------ | ------ |
| data   | 表单默认值                                               | object | -      |
| save   | 有值则开启搜索条件保存功能，细节请看下方搜索条件保存功能 | string | ''     |
| proxy  | 搜索功能接口及主键配置，远程保存搜索条件时需要配置       | object | {}     |

## formConfig proxy Attributes

| 属性名  | 说明     | 类型                                                  | 默认值 |
| ------- | -------- | ----------------------------------------------------- | ------ |
| mainKey | 主键     | string                                                | -      |
| query   | 查询方法 | function({ model_type })                              | -      |
| save    | 保存方法 | function({ model_type, name, [mainKey], conditions }) | -      |
| remove  | 删除方法 | function({ [mainKey] })                               | -      |

## Table Exposes

| Method        | 说明                         | 类型                          |
| ------------- | ---------------------------- | ----------------------------- |
| getForm       | 获取原始查询条件             | function                      |
| getQueryForm  | 获取处理后(给后端)的查询条件 | function                      |
| setForm       | 设置原始查询条件             | function(object)              |
| setFormField  | 单个设置原始查询条件         | function(field, value)        |
| resetForm     | 重置查询条件                 | function                      |
| query         | 表格查询方法                 | function                      |
| resetAndQuery | 重置查询条件并查询           | function                      |
| setPager      | 设置分页参数并查询                 | function({pageNum, pageSize}) |
| initColumn    | 在调用vxe-table的 loadColumn及reloadColumn 方法时需要用这个方法初始化参数 columns                 | function                      |
| $table        | vxt-grid实例                 | object                        |

[其他属性、方法、事件请参考vxetable](https://vxetable.cn/#/grid/api)

# 内置功能


## 搜索条件保存功能

#### 本地存储，配置 formConfig.save 即可
  
```js
{
  tableOptions: {
    formConfig: {
      save: '/purchase/manage/process' // 必填，唯一
    }
  }
}
```

#### 远程存储，需要配置 main.js

vue文件
```js
{
  tableOptions: {
    formConfig: {
      save: '/purchase/manage/process' // 必填，唯一，如果后端有定义则使用后端提供的值
    }
  }
}
```

main.js
```js
import api from '@/api/tableForm'
app.use(DKVui)
DKVui.setup({
  table: {
    formConfig: {
      proxy: {
        mainKey: 'sc_id', // 主键
        query: ({ model_type }) => api.query({ model_type }),
        // model_type 类型/ name 保存名称 / sc_id 主键 / conditions保存条件
        save: ({ model_type, name, sc_id, conditions }) => api.save({ model_type, name, sc_id, conditions }),
        remove: ({ sc_id }) => api.remove({ sc_id })
      }
    }
  }
})
```

## 高级搜索功能

#### 使用插槽 high_form，自动开启高级搜索功能

```html
<VTable ref="tableRef" v-bind="tableOptins">
  <template #high_form="{form}">
    <el-form label-position="top">
      <div class="grid grid-cols-3 gap-x-3">
        <el-form-item label="高级搜索1">
          <el-input v-model="form.highform1" placeholder="请输入" class="w-full" />
        </el-form-item>
        <el-form-item label="高级搜索2">
          <el-input v-model="form.highform2" placeholder="请输入" class="w-full" />
        </el-form-item>
        <el-form-item label="高级搜索3">
          <el-input v-model="form.highform3" placeholder="请输入" class="w-full" />
        </el-form-item>
      </div>
    </el-form>
  </template>
</VTable>
```


## 带条件搜索

- 表格在请求数据时，如果游览器缓存存在 _table_form，则会把当前 _table_form 中的数据作为搜索条件消费，消费后清空该数据
- 因此，只需要设置 _table_form，然后跳转对应页面既可

```js
// 目标页面
tableOptions: {
  formConfig: {
    data: {
      input: { type: 'change_no', value: '' },
    }
  }
}

// 需跳转页面，tableForm格式与目标页面formConfig中的data一致
const tableForm = { input: { type: 'demand_no', value: '168168' } }
sessionStorage.setItem('_table_form', JSON.stringify({ tableForm }))
router.push('/demand/plan')
```

## 滚动隐藏搜索区域

#### 全局配置 main.js

```js
app.use(DKVui)
DKVui.setup({
  table: {
    scrollHideForm: true
  }
})
```

#### 单独配置

```js
tableOptions: {
  scrollHideForm: true
}
```

## getRoutes 组装路由方法

#### router/index.js

```js
import DKVui from 'dk-vui'

const routerFiles = import.meta.globEager(['../views/**/index.vue', '!**/components/**']) // 第二个参数为排除文件

export const routes = DKVui.getRoutes(routerFiles, 'Pms') // 第二个参数为路由名称前缀，如 Pms
```

<!-- - 基础页面为列表页，页面高度100%，溢出隐藏
- edit为true时为编辑页，横向溢出隐藏，纵向溢出为自动
- 编辑页保留滚动位置

## Table Exposes

| Method | 说明                                  | 类型    |
| ------ | ------------------------------------- | ------- |
| edit   | 是否为编辑页                          | boolean |
| footer | 为编辑页时底部固定区域配置 { offset } | object  |

## Table Events

| 事件名 | 说明                                  | 类型    |
| ------ | ------------------------------------- | ------- |
| edit   | 是否为编辑页                          | boolean |
| footer | 为编辑页时底部固定区域配置 { offset } | object  |
## Attributes

| 属性名 | 说明                                  | 类型    | 默认值 |
| ------ | ------------------------------------- | ------- | ------ |
| edit   | 是否为编辑页                          | boolean | —      |
| footer | 为编辑页时底部固定区域配置 { offset } | object  | {}     |

## Slots

| 插槽名 | 说明               |
| ------ | ------------------ |
| left   | 左侧区域           |
| footer | 编辑页底部固定区域 |

## 按钮

```js
<VPage>页面内容</VPage>
``` -->
