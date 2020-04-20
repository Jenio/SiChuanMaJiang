const { ccclass, property } = cc._decorator;

/**
 * 结果界面中的列表界面中的行控件。
 */
@ccclass
export default class ResListItem extends cc.Component {

  /**
   * 来源文本框。
   */
  @property(cc.Label)
  fromLabel: cc.Label = null;

  /**
   * 描述文本框。
   */
  @property(cc.Label)
  detailLabel: cc.Label = null;

  /**
   * 番文本框。
   */
  @property(cc.Label)
  fanLabel: cc.Label = null;

  /**
   * 分数文本框。
   */
  @property(cc.Label)
  scoreLabel: cc.Label = null;

  update() {
    if (this.detailLabel && this.detailLabel.node.height > this.node.height) {
      this.node.height = this.detailLabel.node.height;
    }
  }

  /**
   * 设置。
   * @param from 来源方向（例如：上家）。
   * @param detail 详细（例如：清一色）。
   * @param fan 番。
   * @param score 分数。
   */
  setup(from: string, detail: string, fan: number, score: number) {
    if (this.fromLabel) {
      this.fromLabel.string = from;
    }
    if (this.detailLabel) {
      this.detailLabel.string = detail;
    }
    if (this.fanLabel) {
      this.fanLabel.string = `${fan}番`;
    }
    if (this.scoreLabel) {
      if (score >= 0) {
        this.scoreLabel.string = `+${score}`;
      } else {
        this.scoreLabel.string = score.toString();
      }
    }
  }
}