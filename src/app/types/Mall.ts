/**
 * 楼宇属性
 */
export class Mall {
  id: string; // 唯一标识
  name: string; // 楼宇名称
  startFloor?: number; // 开始楼层(地下几层)
  endFloor?: number; // 结束楼层
  floors?: number; // 总层数
  address: string; // 地址
  pName: string; // 联系人姓名
  pTel: string; // 联系人电话
  date: string; // 创建时间
  creator: string; // 创建者
}
