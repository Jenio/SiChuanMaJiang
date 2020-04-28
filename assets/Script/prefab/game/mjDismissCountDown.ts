import MjCountDown from './mjCountDown';

const { ccclass, property } = cc._decorator;

/**
 * 队伍解散倒计时。
 */
@ccclass
export default class MjDismissCountDown extends cc.Component {

  /**
   * 倒计时。
   */
  @property(MjCountDown)
  countDown: MjCountDown = null;

  hide() {
    this.node.active = false;
  }

  show(countDown: number) {
    this.node.active = true;
    if (this.countDown) {
      this.countDown.setup(countDown);
    }
  }
}