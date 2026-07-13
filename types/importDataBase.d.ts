import { defineComponent } from 'vue'

/**
 * dk-vui 组件 - 导入数据
 */

export interface ImportDataBaseUploadFile extends File {
  name: string
}

export type ImportDataBaseResult = string[] | {
  list?: string[]
  [key: string]: unknown
}

export type ImportDataBaseCallback = (res: ImportDataBaseResult) => ImportDataBaseResult

export default /*#__PURE__*/ defineComponent(
  {
    props: {
      auth: String,
      title: String,
      multiple: Boolean,
      templateLink: [String, Object],
      templateName: String,
      xlsxMatch: Object,
      onChange: Function,
      upload: Function,
      width: [String, Number],
    },
    emits: ['success', 'refresh']
  }
)
