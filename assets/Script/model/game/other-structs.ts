import { HuForm, ScreenDirection } from './concept';

/**
 * 计分项。
 */
export interface ScoreItem {

  /**
   * 方位（例如：【上家】，均为以我为视角的）。
   */
  dir: string;

  /**
   * 描述（例如：平胡、自摸）。
   */
  desc: string;

  /**
   * 番。
   */
  fan: number;

  /**
   * 分数。
   */
  score: number;
}

/**
 * 玩家的对局结果信息。
 */
export interface PlayerResultInfo {

  /**
   * 该玩家的屏幕方位。
   */
  sdir: ScreenDirection;

  /**
   * 昵称。
   */
  name: string;

  /**
   * 头像。
   */
  icon: string;

  /**
   * 本局得分（可正可负）。
   */
  score: number;

  /**
   * 胡牌型。
   */
  huForm?: HuForm;

  /**
   * 计分明细。
   */
  detail: ScoreItem[];
}

/**
 * 游戏记录中的用户。
 */
export interface GameRecordUser {

  /**
   * 用户ID。
   */
  uid: number;

  /**
   * 是否庄家。
   */
  banker: boolean;

  /**
   * 分数。
   */
  score: number;
}

/**
 * 游戏记录。
 */
export interface GameRecord {

  /**
   * 时间戳。
   */
  ts: number;

  /**
   * 房间ID。
   */
  roomId: string;

  /**
   * 游戏参与的玩家。
   */
  record: GameRecordUser[];
}