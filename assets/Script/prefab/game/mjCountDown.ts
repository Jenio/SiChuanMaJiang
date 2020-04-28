const { ccclass, property } = cc._decorator;

/**
 * 倒计时。
 */
@ccclass
export default class MjCountDown extends cc.Component {

  /**
   * 容器节点。
   */
  @property(cc.Node)
  containerNode: cc.Node = null;

  /**
   * 数字图片精灵帧。
   */
  @property(cc.SpriteFrame)
  numberSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 总倒计时秒数。
   */
  private _countDownSeconds = 0;

  /**
   * 倒计时开始时刻。
   */
  private _countDownStartTs = Date.now();

  /**
   * 当前倒计时数值。
   */
  private _countDownLeft = 0;

  /**
   * 刷新。
   */
  private _refresh() {
    if (this.containerNode) {
      this.containerNode.removeAllChildren(true);
      let chars = this._countDownLeft.toString();
      for (let c of chars) {
        let sf = this.numberSpriteFrames[+c];
        if (sf) {
          let node = new cc.Node();
          let sprite = node.addComponent(cc.Sprite);
          sprite.spriteFrame = sf;
          this.containerNode.addChild(node);
        }
      }
    }
  }

  /**
   * 更新倒计时剩余秒数，返回倒计时剩余秒数是否有变化。
   */
  private _updateCountDownLeft(): boolean {
    let nowTs = Date.now();
    let left = Math.ceil(this._countDownSeconds - (nowTs - this._countDownStartTs) / 1000);
    if (left < 0) {
      left = 0;
    }
    if (this._countDownLeft !== left) {
      this._countDownLeft = left;
      return true;
    }
    return false;
  }

  /**
   * 设置。
   * @param secondsLeft 倒计时剩余描述。
   */
  setup(secondsLeft: number) {

    // 记录倒计时。
    if (secondsLeft < 0) {
      secondsLeft = 0;
    }
    this._countDownSeconds = secondsLeft;
    this._countDownLeft = secondsLeft;
    this._countDownStartTs = Date.now();

    this._refresh();
  }

  update() {
    if (this._countDownLeft > 0) {
      if (this._updateCountDownLeft()) {
        this._refresh();
      }
    }
  }
}