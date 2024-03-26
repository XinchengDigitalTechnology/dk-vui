import '@vue/runtime-core'
import type VButton from './button'
import type VText from './text'
import type VAuth from './auth'
import type VPage from './page'
import type VSelect from './select'
import type VTable from './table'
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    VButton: typeof VButton
    VText: typeof VText
    VAuth: typeof VAuth
    VPage: typeof VPage
    VSelect: typeof VSelect
    VTable: typeof VTable
  }
}