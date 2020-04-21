import { CardType } from "../../model/game/concept";
import cache from "../../model/cache";
import uiTools from "../../model/ui/tools";

const { ccclass, property } = cc._decorator;

/**
 * 麻将定缺UI。
 */
@ccclass
export default class MjSkipOneUi extends cc.Component {

  /**
   * 牌容器节点。
   */
  @property(cc.Node)
  btnsNode: cc.Node = null;

  /**
   * 我的定缺状态节点。
   */
  @property(cc.Node)
  myStateNode: cc.Node = null;

  /**
   * 上方玩家定缺状态节点。
   */
  @property(cc.Node)
  topStateNode: cc.Node = null;

  /**
   * 左侧玩家定缺状态节点。
   */
  @property(cc.Node)
  leftStateNode: cc.Node = null;

  /**
   * 右侧玩家定缺状态节点。
   */
  @property(cc.Node)
  rightStateNode: cc.Node = null;

  /**
   * 是否忙。
   */
  private _busy = false;

  /**
   * 显示。
   */
  show() {
    if (this._busy) {
      return;
    }
    this.node.active = true;
    this._showBtns();
    if (this.myStateNode) {
      this.myStateNode.active = false;
    }
    if (this.topStateNode) {
      this.topStateNode.active = true;
    }
    if (this.leftStateNode) {
      this.leftStateNode.active = true;
    }
    if (this.rightStateNode) {
      this.rightStateNode.active = true;
    }
  }

  /**
   * 隐藏。
   */
  hide() {
    this.node.active = false;
  }

  /**
   * 设置我已经完成定缺。
   */
  private _setMyDone() {
    if (this.myStateNode) {
      this.myStateNode.active = true;
    }
  }

  /**
   * 显示按钮区。
   */
  private _showBtns() {
    if (this.btnsNode) {
      this.btnsNode.active = true;
    }
  }

  /**
   * 隐藏按钮区。
   */
  private _hideBtns() {
    if (this.btnsNode) {
      this.btnsNode.active = false;
    }
  }

  /**
   * 发送定缺完成。
   * @param type 卡牌类型。
   */
  private async _sendFinishSkipOne(type: CardType) {
    if (type === CardType.Wan) {
      var skipType = 'wan';
    } else if (type === CardType.Suo) {
      var skipType = 'suo';
    } else if (type === CardType.Tong) {
      var skipType = 'tong';
    } else {
      throw new Error(`unknown card type ${type}`);
    }
    try {
      var res = await cache.cmd.execCmd(`${cache.route}:game/finishSkipOne`, {
        roomId: cache.roomId,
        skipType
      });
    } catch (err) {
      cc.error(err);
      uiTools.toast('请求失败');
      return;
    }
    if (res.err !== undefined) {
      if (res.err === 2 || res.err === 3) {
        uiTools.fireEvent(this.node, 'notFoundRoom', undefined, true);
      }
      uiTools.toast('请求失败');
      throw new Error(`request error ${res.err}`);
    }
  }

  /**
   * 定缺时点击了万。
   */
  onSkipWan() {
    this._busy = true;
    this._hideBtns();
    this._sendFinishSkipOne(CardType.Wan).then(() => {
      this._setMyDone();
    }).catch((err) => {
      cc.warn(err);
      this._showBtns();
    }).then(() => {
      this._busy = false;
    });
  }

  /**
   * 定缺时点击了锁。
   */
  onSkipSuo() {
    this._busy = true;
    this._hideBtns();
    this._sendFinishSkipOne(CardType.Suo).then(() => {
      this._setMyDone();
    }).catch((err) => {
      cc.warn(err);
      this._showBtns();
    }).then(() => {
      this._busy = false;
    });
  }

  /**
   * 定缺时点击了筒。
   */
  onSkipTong() {
    this._busy = true;
    this._hideBtns();
    this._sendFinishSkipOne(CardType.Tong).then(() => {
      this._setMyDone();
    }).catch((err) => {
      cc.warn(err);
      this._showBtns();
    }).then(() => {
      this._busy = false;
    });
  }
}