/**
 * 楼宇属性
 */
export class Mall {
  /**
   * 唯一标识
   */
  id: string;
  /**
   * 楼宇名称
   */
  name?: string;
  /**
   * 楼宇地址
   */
  address?: string;
  /**
   * 楼宇类型
   */
  type?: string;
  /**
   * 开始楼层(地下几层)
   */
  minFloor?: number;
  /**
   * 总层数
   */
  floors?: number;
  /**
   * 是否展示地下层
   */
  isUnground?: boolean;
  /**
   * 管理员姓名
   */
  pName?: string;
  /**
   * 管理员电话
   */
  pTel?: string;
  /**
   * 创建时间
   */
  date?: Date;
  /**
   * 创建者ID
   */
  creator?: string;
}
