import { CardId, HuTitle, HuForm } from '../concept';

/**
 * 牌组（碰、杠）数据。
 */
export interface CardGroupData {

  /**
   * 类型，可选值为：'peng'、'gang'。
   */
  type: string;

  /**
   * 卡牌（例如：1表示二筒，如果type为'peng'，那么表示有一个碰二筒）。
   */
  card: number;

  /**
   * 形成方位。
   */
  dir: string;

  /**
   * 是否明杠（仅杠时存在）。
   */
  open?: boolean;
}

/**
 * 我的数据。
 */
export interface MineData {

  /**
   * 我的用户ID。
   */
  uid: number;

  /**
   * 我的方位。
   */
  dir: string;

  /**
   * 我的昵称。
   */
  name: string;

  /**
   * 我的头像。
   */
  icon: string;

  /**
   * 玩家的分数。
   */
  score: number;

  /**
   * 我的手牌（还未发牌前为空数组）。
   */
  hands: CardId[];

  /**
   * 我新抽的牌（仅当轮到我的回合时才存在）。
   */
  drawCard?: CardId;

  /**
   * 牌组（碰、杠），依照产生的时间顺序排列，早的在前。
   */
  groups: CardGroupData[];

  /**
   * 我定缺的牌，可选值为：'tong'、'suo'、'wan'。
   */
  skipType?: string;
}

/**
 * 其他用户数据。
 */
export interface OtherUserData {

  /**
   * 用户ID。
   */
  uid: number;

  /**
   * 方位。
   */
  dir: string;

  /**
   * 昵称。
   */
  name: string;

  /**
   * 头像。
   */
  icon: string;

  /**
   * 玩家的分数。
   */
  score: number;

  /**
   * 手牌数量（开始发牌前此值为0）。
   */
  handSize: number;

  /**
   * 刚抽的牌的数量（通常情况为0，1表示正等待他出牌中）。
   */
  drawSize: number;

  /**
   * 牌组（碰、杠），依照产生的时间顺序排列，早的在前。
   */
  groups: CardGroupData[];

  /**
   * 定缺的牌，可选值为：'tong'、'suo'、'wan'。
   */
  skipType?: string;
}

/**
 * 待决的行为。
 */
export enum PendingAction {

  /**
   * 无。
   */
  None,

  /**
   * 等待设置就绪，即客户端需要发送game/setReady。
   */
  SetReady,

  /**
   * 等待完成发牌，即客户端需要发送game/finishDeal。
   */
  FinishDeal,

  /**
   * 等待定缺完成，即客户端需要发送game/finishSkipOne。
   */
  FinishSkipOne,

  /**
   * 等待碰、明杠、点炮胡、过。
   */
  Eat,

  /**
   * 等待抢杠胡、过。
   */
  QiangGangHu,

  /**
   * 等待暗杠、补杠、自摸胡、出牌。
   */
  AfterDraw,

  /**
   * 等待碰后的出牌。
   */
  AfterPeng,
}

/**
 * 供客户端使用的方位牌墙（子牌墙）信息。
 */
export interface PositionalCardWallClientInfo {

  /**
   * 起始墩编号（基于0），其值大于eClusterIdx表示整个方位上没有任何墩。
   */
  sClusterIdx: number;

  /**
   * 是否上下都有牌。
   */
  sDouble: boolean;

  /**
   * 结束墩编号（基于0），其值小于sClusterIdx表示整个方位上没有任何墩。
   */
  eClusterIdx: number;

  /**
   * 是否上下都有牌。
   */
  eDouble: boolean;
}

/**
 * 供客户端使用的牌墙信息。
 */
export interface CardWallClientInfo {

  /**
   * 东方牌墙信息。
   */
  east: PositionalCardWallClientInfo;

  /**
   * 北方牌墙信息。
   */
  north: PositionalCardWallClientInfo;

  /**
   * 西方牌墙信息。
   */
  west: PositionalCardWallClientInfo;

  /**
   * 南方牌墙信息。
   */
  south: PositionalCardWallClientInfo;
}

/**
 * 供客户端使用的丢牌区信息。
 */
export interface DiscardAreaClientInfo {

  /**
   * 最后出牌方位。
   */
  dir: string;

  /**
   * 东方丢牌区。
   */
  east: CardId[];

  /**
   * 北方丢牌区。
   */
  north: CardId[];

  /**
   * 西方丢牌区。
   */
  west: CardId[];

  /**
   * 南方丢牌区。
   */
  south: CardId[];
}

/**
 * 胡的客户端信息。
 */
export interface HuClientInfo {

  /**
   * 胡牌的用户ID。
   */
  uid: number;

  /**
   * 胡牌的用户方位。
   */
  dir: string;

  /**
   * 胡的标签。
   */
  titles: HuTitle[];

  /**
   * 胡的牌型。
   */
  form: HuForm;

  /**
   * 点炮者（仅当点炮或抢杠胡时存在）。
   */
  dianPao?: {

    /**
     * 点炮者用户ID。
     */
    uid: number;

    /**
     * 点炮者方位。
     */
    dir: string;
  };

  /**
   * 根。
   */
  gen: number;

  /**
   * 番。
   */
  fan: number;

  /**
   * 得分。
   */
  score: number;
}

/**
 * 杠的客户端信息。
 */
export interface GangClientInfo {

  /**
   * 杠牌的用户ID。
   */
  uid: number;

  /**
   * 杠牌的用户方位。
   */
  dir: string;

  /**
   * 杠的类型。
   */
  type: 'ming' | 'an' | 'bu';

  /**
   * 放杠者（仅当明杠时存在）。
   */
  fang?: {

    /**
     * 放杠者用户ID。
     */
    uid: number;

    /**
     * 放杠者方位。
     */
    dir: string;
  };

  /**
   * 番。
   */
  fan: number;

  /**
   * 杠牌得分。
   */
  score: number;
}

/**
 * 花猪客户端信息。
 */
export interface HuaZhuClientInfo {

  /**
   * 花猪用户ID。
   */
  uid: number;

  /**
   * 花猪所在方位。
   */
  dir: string;

  /**
   * 番。
   */
  fan: number;

  /**
   * 分数（负数）。
   */
  score: number;
}

/**
 * 结果的客户端信息。
 */
export interface ResultClientInfo {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 胡列表，空数组表示流局。
   */
  huList: HuClientInfo[];

  /**
   * 杠列表。
   */
  gangList: GangClientInfo[];

  /**
   * 花猪列表，仅当玩法开启定缺选项时存在。
   */
  huaZhuList?: HuaZhuClientInfo[];

  /**
   * 东方玩家的手牌。
   */
  east: CardId[];

  /**
   * 北方玩家的手牌。
   */
  north: CardId[];

  /**
   * 西方玩家的手牌。
   */
  west: CardId[];

  /**
   * 南方玩家的手牌。
   */
  south: CardId[];

  /**
   * 东方玩家的胡牌，仅当东方玩家胡时存在。
   */
  eastHu?: CardId;

  /**
   * 北方玩家的胡牌，仅当北方玩家胡时存在。
   */
  northHu?: CardId;

  /**
   * 西方玩家的胡牌，仅当西方玩家胡时存在。
   */
  westHu?: CardId;

  /**
   * 南方玩家的胡牌，仅当南方玩家胡时存在。
   */
  southHu?: CardId;

  /**
   * 东方玩家的最终分数（多局总分）。
   */
  eastScore: number;

  /**
   * 北方玩家的最终分数（多局总分）。
   */
  northScore: number;

  /**
   * 西方玩家的最终分数（多局总分）。
   */
  westScore: number;

  /**
   * 南方玩家的最终分数（多局总分）。
   */
  southScore: number;
}

/**
 * 游戏信息。
 */
export interface GameInfo {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 当前局数（基于0）。
   */
  currInning: number;

  /**
   * 总局数。
   */
  totalInnings: number;

  /**
   * 基准分。
   */
  baseScore: number;

  /**
   * 状态，取值如下：等待开局就绪（如果是首局，此时不用显示上局结果，如果非首局，那么需要显示上局结果）=1，等待发牌完成=2，等待定缺完成=3，等待牌局结束=4。
   */
  state: number;

  /**
   * 待决的行为。
   */
  pendingAction: PendingAction,

  /**
   * 倒计时剩余秒数。
   */
  countDownLeft: number;

  /**
   * 是否进入了第二阶段倒计时。
   */
  secondWait: boolean;

  /**
   * 当前有几个玩家申请了提前终止游戏。
   */
  numCancelApps: number;

  /**
   * 庄家方位。
   */
  banker: string;

  /**
   * 牌墙。
   */
  cardWall?: CardWallClientInfo;

  /**
   * 丢牌区。
   */
  discardArea?: DiscardAreaClientInfo;

  /**
   * 我的信息。
   */
  mine: MineData;

  /**
   * 其他玩家信息。
   */
  others: OtherUserData[];

  /**
   * 结果。
   */
  result?: ResultClientInfo;
}