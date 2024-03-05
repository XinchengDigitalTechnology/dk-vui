
/**
 * 按钮
 */
export declare class VText {
  /**
   * 绑定值
   */
  value?:scring | number;
  /**
   * 标题
   */
  title?:scring;
  /**
   * 标题位置
   */
  titlePosition?:scring;
  /**
   * 文本类型
   */
  type?:'button' | 'link';
  /**
   * 溢出行数
   */
  line?:number;
  /**
   * 是否启用复制
   */
  copy?:boolean;
  /**
   * 是否禁用
   */
  disabled?:boolean;
  /**
   * 占位符
   */
  empty?:boolean;
}
