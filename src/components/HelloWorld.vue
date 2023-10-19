<template>
  <VPage edit :footer="{height: 50, offset: 0, align: 'center'}">
    <template #left>
      <div class="p-2 text-sm">信诚网络</div>
      <el-tree :data="data" show-checkbox node-key="id" :default-expanded-keys="[2, 3]" :default-checked-keys="[5]"
        :props="defaultProps" />
    </template>
    <VTable ref="tableRef" v-bind="tableOptins">
      <template #form="{ form }">
        <el-input v-model="form.base" style="max-width: 150px" placeholder="普通类型"></el-input>
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
        <el-button type="primary" class="ml-auto" @click="create(tableRef)">新增</el-button>
        <el-button>批量编辑</el-button>
      </template>
    </VTable>
    <template #footer>
      <el-button>返 回</el-button>
      <el-button type="primary">保 存</el-button>
    </template>
  </VPage>
</template>

<script setup lang="jsx" name="Index">

const tableRef = ref(null)

const create = table => {
  console.log('tableRef.value', tableRef.value)
}
// 模拟分页接口
const findPageList = (pageNum, pageSize) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const item = { name: 'Test1', nickname: 'T1', role: 'Develop', sex: 'Man', age: 28, address: 'Shenzhen' }
      const list = [...new Array(10000).keys()].reduce((acc, cur) => acc.concat({ id: cur, ...item }), [])
      resolve({
        total: list.length,
        data: list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
      })
    }, 100)
  })
}
const tableOptins = reactive({
  id: 'id',
  formConfig: {
    data: {
      base: '', // 基础类型
      date: { value: [], range: true, rangeKeys: ['start_time', 'end_time'] }, // 日期
      group: { type: 'group1', value: '' }, // 组合
      dateRange: { type: 'dateRange1', value: [], range: true }, // 组合+日期范围
      sizeRange: { type: 'sizeRange1' }, // 组合+范围
    }
  },
  scrollY: {enabled: true, gt: 0},
  rowConfig: { height: 140 },
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 60 },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'name', title: 'Name', minWidth: 100, slots: {
      default: ({row}) => <div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <div>{row.name}</div>
        <el-button type="primary" link>查看详情</el-button>
      </div>
    } },
    { field: 'nickname', title: 'Nickname', minWidth: 100 },
    { field: 'role', title: 'Role', minWidth: 100 },
    { field: 'address', title: 'Address', showOverflow: true, minWidth: 100 },
    { field: 'address', title: 'Address', showOverflow: true, minWidth: 100 },
    { field: 'address', title: 'Address', showOverflow: true, minWidth: 100 },
    { field: 'address', title: 'Address', fixed: 'right' },
  ],
  proxyConfig: {
    ajax: {
      // 接收 Promise
      query: ({ page, form }) => {
        console.log('提交后端的form: ', form)
        return findPageList(page.pageNum, page.pageSize)
      }
    }
  }
})
const defaultProps = {
  children: 'children',
  label: 'label',
}
const data = [
  {
    id: 1,
    label: 'Level one 1',
    children: [
      {
        id: 4,
        label: 'Level two 1-1',
        children: [
          {
            id: 9,
            label: 'Level three 1-1-1',
          },
          {
            id: 10,
            label: 'Level three 1-1-2',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: 'Level one 2',
    children: [
      {
        id: 5,
        label: 'Level two 2-1',
      },
      {
        id: 6,
        label: 'Level two 2-2',
      },
    ],
  },
  {
    id: 3,
    label: 'Level one 3',
    children: [
      {
        id: 7,
        label: 'Level two 3-1',
      },
      {
        id: 8,
        label: 'Level two 3-2',
      },
    ],
  },
]
</script>
