import uiTools from '../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 悬浮提示。
 */
@ccclass
export default class Toast extends cc.Component {

  /**
   * 提示内容框。
   */
  @property(cc.Label)
  tipLabel: cc.Label = null;

  onLoad() {
    let a1 = cc.moveBy(1, 0, 100);
    let a2 = cc.sequence(cc.delayTime(0.7), cc.fadeOut(0.3));
    let a3 = cc.callFunc(() => {
      uiTools.closeWindow(this.node);
    });
    this.node.runAction(cc.sequence(cc.spawn(a1, a2), a3));
  }
}