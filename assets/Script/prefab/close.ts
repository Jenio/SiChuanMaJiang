import uiTools from '../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 关闭窗口，在关闭时会发出closed事件。
 */
@ccclass
export default class Close extends cc.Component {

  @property(cc.Node)
  closeBtnNode: cc.Node = null;

  onLoad() {

    // 处理关闭按钮的点击。
    if (this.closeBtnNode) {
      this.closeBtnNode.on(cc.Node.EventType.TOUCH_END, (evn) => {
        evn.stopPropagation();
        uiTools.closeWindowAndFireEvent(this.node, undefined, false);
      });
    }
  }
}