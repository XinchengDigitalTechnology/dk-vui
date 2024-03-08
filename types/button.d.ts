import { VComponent } from './component'
/**
 * dk-vui 组件 - 按钮
 */
export const VButton: VComponent<VButtonProps>
/**
 * dk-vui 组件 - 按钮
 */
export const Button: typeof VButton

export type VButtonProps = {
  /**
   * 按钮权限
   */
  auth?: string
}