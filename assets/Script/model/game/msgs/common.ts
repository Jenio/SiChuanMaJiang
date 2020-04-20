import { CardId } from '../concept';
export { ResultClientInfo as FinishInningNotify } from './game-info';

/**
 * 开始发牌通知。
 */
export interface StartDealNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 庄所在的方位。
   */
  bankerDir: string;

  /**
   * 决定发牌起始方位和起始牌墩的骰子1点数。
   */
  firstDice: number;

  /**
   * 决定发牌起始方位和起始牌墩的骰子2点数。
   */
  secondDice: number;

  /**
   * 我的手牌。
   */
  hands: CardId[];

  /**
   * 我的新抽牌（仅当庄家存在）。
   */
  draw?: CardId;
}

/**
 * 开始定缺通知。
 */
export interface StartSkipOneNotify {

  /**
   * 房间ID。
   */
  roomId: string;
}

/**
 * 开始出牌通知。
 */
export interface StartPlayNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 所有玩家的定缺情况。
   */
  skipOnes: {

    /**
     * 用户ID。
     */
    uid: number;

    /**
     * 方位。
     */
    dir: string;

    /**
     * 缺牌类型。
     */
    skipType: string;
  }[];
}

/**
 * 出牌通知。
 */
export interface DiscardNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 出牌的用户ID。
   */
  uid: number;

  /**
   * 出牌的用户所在的方位。
   */
  dir: string;

  /**
   * 卡牌ID。
   */
  cardId: number;
}

/**
 * 从牌墙前方抽牌通知。
 */
export interface DrawFrontNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 抽牌的用户ID。
   */
  uid: number;

  /**
   * 抽牌的用户所在的方位。
   */
  dir: string;

  /**
   * 抽的牌的ID，仅当抽牌方存在。
   */
  cardId: number;
}

/**
 * 从牌墙后方抽牌通知。
 */
export interface DrawBackNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 抽牌的用户ID。
   */
  uid: number;

  /**
   * 抽牌的用户所在的方位。
   */
  dir: string;

  /**
   * 抽的牌的ID，仅当抽牌方存在。
   */
  cardId: number;
}

/**
 * 碰通知。
 */
export interface PengNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 碰牌的用户ID。
   */
  uid: number;

  /**
   * 碰牌的用户所在的方位。
   */
  dir: string;

  /**
   * 碰来自哪个方位。
   */
  fromDir: string;

  /**
   * 碰牌ID。
   */
  cardId: number;
}

/**
 * 明杠通知。
 */
export interface MingGangNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 杠牌的用户ID。
   */
  uid: number;

  /**
   * 杠牌的用户所在的方位。
   */
  dir: string;

  /**
   * 杠来自哪个方位。
   */
  fromDir: string;

  /**
   * 杠牌ID。
   */
  cardId: number;
}

/**
 * 补杠通知。
 */
export interface BuGangNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 补杠牌的用户ID。
   */
  uid: number;

  /**
   * 补杠牌的用户所在的方位。
   */
  dir: string;

  /**
   * 杠牌ID。
   */
  cardId: number;
}

/**
 * 暗杠通知。
 */
export interface AnGangNotify {

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 暗杠牌的用户ID。
   */
  uid: number;

  /**
   * 暗杠牌的用户所在的方位。
   */
  dir: string;

  /**
   * 暗杠的牌。
   */
  cardId: number;
}