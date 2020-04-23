import ScoreNumber from './scoreNumber';

const { ccclass, property } = cc._decorator;

/**
 * 对局流水界面中的列表项。
 */
@ccclass
export default class ScoreListItem extends cc.Component {

  /**
   * 头部标签文本框。
   */
  @property(cc.Label)
  headLabel: cc.Label = null;

  /**
   * 东方玩家分数。
   */
  @property(ScoreNumber)
  eastScore: ScoreNumber = null;

  /**
   * 北方玩家分数。
   */
  @property(ScoreNumber)
  northScore: ScoreNumber = null;

  /**
   * 西方玩家分数。
   */
  @property(ScoreNumber)
  westScore: ScoreNumber = null;

  /**
   * 南方玩家分数。
   */
  @property(ScoreNumber)
  southScore: ScoreNumber = null;

  /**
   * 设置。
   * @param inningIdx 局号（基于0），传-1表示小计。
   * @param eastScore 东方玩家分数。
   * @param northScore 北方玩家分数。
   * @param westScore 西方玩家分数。
   * @param southScore 南方玩家分数。
   */
  setup(inningIdx: number, eastScore: number, northScore: number, westScore: number, southScore: number) {
    let head = '小计';
    if (inningIdx >= 0) {
      head = `第${inningIdx + 1}局`;
    }
    if (this.headLabel) {
      this.headLabel.string = head;
    }
    if (this.eastScore) {
      this.eastScore.setup(eastScore);
    }
    if (this.northScore) {
      this.northScore.setup(northScore);
    }
    if (this.westScore) {
      this.westScore.setup(westScore);
    }
    if (this.southScore) {
      this.southScore.setup(southScore);
    }
  }
}