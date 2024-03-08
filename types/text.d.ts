import { VComponent } from './component'
/**
 * dk-vui 组件 - 文本
 */
export const VText: VComponent<VTextProps>
/**
 * dk-vui 组件 - 文本
 */
export const Text: typeof VText

export type VTextProps = {
  /**
   * 绑定值
   */
  value?: string | number;
  /**
   * 标题
   */
  title?: string;
  /**
   * 标题位置
   */
  titlePosition?: string;
  /**
   * 文本类型
   */
  type?: 'button' | 'link';
  /**
   * 溢出行数
   */
  line?: number;
  /**
   * 是否启用复制
   */
  copy?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 占位符
   */
  empty?: boolean;
}
