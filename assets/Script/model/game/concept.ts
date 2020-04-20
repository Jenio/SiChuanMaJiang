/**
 * 方位，顺序按照逆时针出牌的顺序。
 */
export enum Direction {

  /**
   * 东。
   */
  East = 0,

  /**
   * 北。
   */
  North = 1,

  /**
   * 西。
   */
  West = 2,

  /**
   * 南。
   */
  South = 3,
}

/**
 * 方位字符转方位。
 * @param dir 方位字符。
 */
export function fromDirChar(dir: string): Direction {
  switch (dir) {
    case 'E':
      return Direction.East;
    case 'N':
      return Direction.North;
    case 'W':
      return Direction.West;
    case 'S':
      return Direction.South;
    default:
      throw new Error('unknown dir');
  }
}

/**
 * 屏幕方位。
 */
export enum ScreenDirection {

  /**
   * 左。
   */
  Left,

  /**
   * 上。
   */
  Top,

  /**
   * 右。
   */
  Right,

  /**
   * 下。
   */
  Bottom,
}

/**
 * 获取相对于我的屏幕方位名（例如：上家）。
 * @param sdir 屏幕方位。
 */
export function toScreenDirNameOfMe(sdir: ScreenDirection): string {
  switch (sdir) {
    case ScreenDirection.Bottom:
      return '自己';
    case ScreenDirection.Top:
      return '对家';
    case ScreenDirection.Left:
      return '上家';
    case ScreenDirection.Right:
      return '下家';
    default:
      throw new Error(`unknown screen dir ${sdir}`);
  }
}

/**
 * 卡牌ID。
 */
export enum CardId {
  Wan1,
  Wan2,
  Wan3,
  Wan4,
  Wan5,
  Wan6,
  Wan7,
  Wan8,
  Wan9,
  Suo1,
  Suo2,
  Suo3,
  Suo4,
  Suo5,
  Suo6,
  Suo7,
  Suo8,
  Suo9,
  Tong1,
  Tong2,
  Tong3,
  Tong4,
  Tong5,
  Tong6,
  Tong7,
  Tong8,
  Tong9,
}

/**
 * 牌组类型。
 */
export enum CardGroupType {
  Peng,
  Gang,
}

/**
 * 碰。
 */
export interface Peng {
  t: 'peng';

  /**
   * 卡牌ID。
   */
  cardId: CardId;

  /**
   * 绝对方向，从哪方放出的牌使得出现了碰。
   */
  fromDir: Direction;
}

/**
 * 杠。
 */
export interface Gang {
  t: 'gang';

  /**
   * 卡牌ID。
   */
  cardId: CardId;

  /**
   * 绝对方向，从哪方放出的牌使得出现了杠。
   */
  fromDir: Direction;

  /**
   * 是否明碰。
   */
  open: boolean;
}

/**
 * 牌组（本玩法只有碰、杠，没有吃）。
 */
export type CardGroup = Peng | Gang;

/**
 * 卡牌类型。
 */
export enum CardType {

  /**
   * 筒（一筒到九筒）。
   */
  Tong,

  /**
   * 锁（一锁到九锁）。
   */
  Suo,

  /**
   * 万（一万到九万）。
   */
  Wan,
}

/**
 * 杠的类型。
 */
export enum GangType {

  /**
   * 明杠。
   */
  Ming,

  /**
   * 补杠。
   */
  Bu,

  /**
   * 暗杠。
   */
  An,
}

/**
 * 胡的类型。
 */
export enum HuType {

  /**
   * 没有胡。
   */
  None,

  /**
   * 点炮胡。
   */
  DianPao,

  /**
   * 自摸胡。
   */
  ZiMo,

  /**
   * 抢杠胡。
   */
  QiangGang,
}

/**
 * 胡的称号（标签）。
 */
export enum HuTitle {

  /**
   * 点炮。
   */
  DianPao,

  /**
   * 自摸。
   */
  ZiMo,

  /**
   * 抢杠胡。
   */
  QiangGang,

  /**
   * 杠上花。
   */
  GangShangHua,

  /**
   * 杠上炮。
   */
  GangShangPao,

  /**
   * 海底捞月。
   */
  HaiDiLaoYue,
}

/**
 * 获取胡的称号名。
 * @param title 称号。
 */
export function toHuTitleName(title: HuTitle) {
  switch (title) {
    case HuTitle.DianPao:
      return '点炮';
    case HuTitle.ZiMo:
      return '自摸';
    case HuTitle.QiangGang:
      return '抢杠胡';
    case HuTitle.GangShangHua:
      return '杠上开花';
    case HuTitle.GangShangPao:
      return '杠上点炮';
    case HuTitle.HaiDiLaoYue:
      return '海底捞月';
    default:
      throw new Error(`unknown hu title ${title}`);
  }
}

/**
 * 胡的牌型。
 */
export enum HuForm {

  /**
   * 平胡。
   */
  Ping,

  /**
   * 碰碰胡。
   */
  PengPeng,

  /**
   * 清一色。
   */
  QingYiSe,

  /**
   * 七对。
   */
  QiDui,

  /**
   * 金钩钓。
   */
  JinGouDiao,

  /**
   * 清碰碰胡。
   */
  QingPengPeng,

  /**
   * 龙七对。
   */
  LongQiDui,

  /**
   * 清七对。
   */
  QingQiDui,

  /**
   * 清金钩钓。
   */
  QingJinGouDiao,

  /**
   * 天胡。
   */
  Tian,

  /**
   * 地胡。
   */
  Di,

  /**
   * 清龙七对。
   */
  QingLongQiDui,

  /**
   * 十八罗汉。
   */
  ShiBaLuoHan,

  /**
   * 清十八罗汉。
   */
  QingShiBaLuoHan,
}

/**
 * 获取胡的牌型名称。
 * @param form 胡的牌型。
 */
export function toHuFormName(form: HuForm) {
  switch (form) {
    case HuForm.Ping:
      return '平胡';
    case HuForm.PengPeng:
      return '碰碰胡';
    case HuForm.QingYiSe:
      return '清一色';
    case HuForm.QiDui:
      return '七对';
    case HuForm.JinGouDiao:
      return '金钩钓';
    case HuForm.QingPengPeng:
      return '清碰碰';
    case HuForm.LongQiDui:
      return '龙七对';
    case HuForm.QingQiDui:
      return '清七对';
    case HuForm.QingJinGouDiao:
      return '清金钩钓';
    case HuForm.Tian:
      return '天胡';
    case HuForm.Di:
      return '地胡';
    case HuForm.QingLongQiDui:
      return '清龙七对';
    case HuForm.ShiBaLuoHan:
      return '十八罗汉';
    case HuForm.QingShiBaLuoHan:
      return '清十八罗汉';
    default:
      throw new Error(`unknown hu form ${form}`);
  }
}