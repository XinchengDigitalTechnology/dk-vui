<template>
  <VPage style="background: #f5f5f5;" :left-config="{width: 200, collapse: true, collapseValue: false, drag: true, showArrow: true}">
    <template #left>
      <el-tree :data="data" show-checkbox node-key="id" :default-expanded-keys="[2, 3]" :default-checked-keys="[5]" :props="defaultProps" />
    </template>
    <VTable ref="tableRef" v-bind="tableOptins">
      <template #form="{ form }">
        <el-input v-model="form.base" style="max-width: 150px" placeholder="普通类型"></el-input>
        <el-select v-model="form.select" multiple style="max-width: 100px">
            <el-option label="选项1" :value="0"></el-option>
            <el-option label="选项2" :value="1"></el-option>
          </el-select>
        <VGroup>
          <div class="v-group-item">带标题</div>
          <el-input v-model="form.base" class="w-40" placeholder="带标题"></el-input>
        </VGroup>
        <el-date-picker v-model="form.date.value" type="daterange" range-separator="至" start-placeholder="日期开始" end-placeholder="日期结束" style="max-width: 300px" />
        <VGroup>
          <el-select v-model="form.group.type" style="max-width: 100px">
            <el-option label="组合1" :value="0"></el-option>
            <el-option label="组合2" :value="1"></el-option>
          </el-select>
          <el-input v-model="form.group.value"></el-input>
        </VGroup>
        <VGroup>
          <el-select v-model="form.dateRange.type" style="max-width: 150px">
            <el-option label="类型+日期范围1" value="dateRange1"></el-option>
            <el-option label="类型+日期范围2" value="dateRange2"></el-option>
          </el-select>
          <el-date-picker v-model="form.dateRange.value" type="daterange" range-separator="至" start-placeholder="Start date" end-placeholder="End date" style="max-width: 300px" />
        </VGroup>
        <VGroup>
          <div class="v-group-item">普通范围</div>
          <el-input-number v-model="form.baseRange.start" :controls="false" placeholder="最小值" />
          <div class="v-group-item">至</div>
          <el-input-number v-model="form.baseRange.end" :controls="false" placeholder="最大值" />
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
      <template #high_form="{ form }">
        <el-form label-position="top">
          <div style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));column-gap: 0.75rem;">
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
      const list = [...new Array(80).keys()].reduce((acc, cur) => acc.concat({ id: cur, ...item }), [])
      resolve({
        total: list.length,
        data: list.slice((pageNum - 1) * pageSize, pageNum * pageSize)
      })
    }, 1000);
  })
}
const tableOptins = reactive({
  showHeaderOverflow: true,
  id: 'id',
  formConfig: {
    save: '/purchase/manage/plan',
    data: {
      base: '', // 基础类型
      baseRange: {},
      date: { value: [], range: true, rangeKeys: ['start_time', 'end_time'] }, // 日期
      group: { type: 0, value: '' }, // 组合
      dateRange: { type: 'dateRange1', value: [], range: true }, // 组合+日期范围
      sizeRange: { type: 'sizeRange1' }, // 组合+范围
    }
  },
  pagerConfig: {
    layouts: ['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Sizes', 'Total']
  },
  scrollY: { enabled: true, gt: 0 },
  rowConfig: { height: 100 },
  columns: [
    { type: 'checkbox', width: 50, fixed: 'left' },
    { type: 'seq', width: 60, fixed: 'left' },
    {
      title: '字体颜色', width: 150, field: 'aaa', sortable: true, slots: {
        default: ({ row }) => <div>
          <VText value='标题颜色#666' />
          <VText value='正文颜色#333' />
          <VText title='标题颜色' value='正文颜色' />
          <VText title='标题颜色' value='正文颜色' />
        </div>
      }
    },
    {
      title: '默认值', minWidth: 150
    },
    {
      title: '一行溢出', minWidth: 140, slots: {
        default: ({ row }) => <div>
          <VText value='一行溢出一行溢出一行溢出一行溢出' />
          <VText title='带标题' value='一行溢出一行溢出一行溢出一行溢出' />
        </div>
      }
    },
    {
      title: '两行溢出', minWidth: 140, slots: {
        default: ({ row }) => <div>
          <VText value='两行溢出两行溢出两行溢出两行溢出两行溢出两行溢出两行溢出两行溢出' line={2} />
          <VText title='带标题' value='两行溢出两行溢出两行溢出两行溢出两行溢出两行溢出两行溢出两行溢出' line={2} />
        </div>
      }
    },
    {
      title: '三行溢出', minWidth: 120, slots: {
        default: ({ row }) => <div>
          <VText value='三行溢出三行溢出三行溢出三行溢出三行溢出三行溢出三行溢出三行溢出' line={3} />
        </div>
      }
    },
    {
      title: '复制', minWidth: 150, slots: {
        default: ({ row }) => <div>
          <VText value='无标题复制' copy />
          <VText title='标题' value='带标题复制' copy />
          <VText value='溢出时的无标题复制' copy />
          <VText title='标题' value='溢出带标题复制' copy />
        </div>
      }
    },
    {
      title: '链接', minWidth: 150, slots: {
        default: ({ row }) => <div>
          <VText value='我是链接我是链接我是链接我是链接' type='link' onClick={log} />
          <VText title='两行' value='我是链接我是链接我是链接我是链接' line={2} type='link' copy onClick={log} />
        </div>
      }
    },
    {
      title: '禁用', minWidth: 150, slots: {
        default: ({ row }) => <div>
          <VText value='我是链接我是链接我是链接我是链接' type='link' disabled />
        </div>
      }
    },
    {
      title: '按钮', width: 150, fixed: 'right', slots: {
        default: ({ row }) => <div>
          <VText value='编辑' type='button' />
          <VText value='删除' type='button' />
        </div>
      }
    },
  ],
  proxyConfig: {
    ajax: {
      // 接收 Promise
      query: ({ page, form }) => {
        console.log('提交后端的form: ', JSON.stringify(form, null, 2))
        return findPageList(page.pageNum, page.pageSize)
      }
    }
  }
})

const log = () => {
  console.log('点击')
}

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
