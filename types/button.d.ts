import { VComponent } from './component'
/**
 * 组件 - 按钮
 * @example import { VButton } from 'dk-vui'
 */
export const VxeButton: VComponent<VButtonProps>

export type VButtonProps = {
  /**
   * 按钮权限
   */
  auth?: string
}