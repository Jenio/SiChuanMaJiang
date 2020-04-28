import uiTools from '../model/ui/tools';
import cache from '../model/cache';
import Room from './room';

const { ccclass, property } = cc._decorator;

/**
 * 加入房间。
 */
@ccclass
export default class JoinRoom extends cc.Component {

  /**
   * 输入区域文本框。
   */
  @property(cc.Label)
  inputLabels: cc.Label[] = [];

  /**
   * 按键文本框。
   */
  @property(cc.Label)
  keyLabels: cc.Label[] = [];

  /**
   * 按键节点。
   */
  @property(cc.Node)
  keyNodes: cc.Node[] = [];

  /**
   * 删除键节点。
   */
  @property(cc.Node)
  backNode: cc.Node = null;

  /**
   * 输入光标。
   */
  private _inputs: string[] = [];

  /**
   * 是否允许输入。
   */
  private _enableInput = true;

  onLoad() {
    for (let node of this.keyNodes) {
      node.on(cc.Node.EventType.TOUCH_END, this._onClickKey.bind(this));
    }
    if (this.backNode) {
      this.backNode.on(cc.Node.EventType.TOUCH_END, this._onClickBack.bind(this));
    }
  }

  /**
   * 点击按键的处理。
   * @param evn 事件。
   */
  private _onClickKey(evn: cc.Event) {
    evn.stopPropagation();
    if (!this._enableInput) {
      return;
    }
    if (this._inputs.length < 8) {
      let node: cc.Node = evn.target;
      node.stopAllActions();
      node.scale = 1;
      let zoomIn = cc.scaleTo(0.1, 1.2).easing(cc.easeBackIn());
      let zoomOut = cc.scaleTo(0.1, 1).easing(cc.easeBackIn());
      node.runAction(cc.sequence(zoomIn, zoomOut));
      let idx = this.keyNodes.indexOf(node);
      if (idx >= 0) {
        let label = this.keyLabels[idx];
        if (label) {
          let char = label.string;
          let inputLabel = this.inputLabels[this._inputs.length];
          if (inputLabel) {
            inputLabel.string = char;
          }
          this._inputs.push(char);

          // 输入完毕。
          if (this._inputs.length === 8) {

            // 尝试加入房间。
            let roomId = this._inputs.join('');
            this._enableInput = false;
            cache.cmd.execCmd('room/join', { roomId }).then((res) => {
              if (res.err !== undefined) {
                let tips = {
                  1: '参数错误',
                  2: '指定的房间不存在',
                  3: '玩家已在其他房间内',
                  4: '玩家已在该房间内',
                  5: '游戏已开始，不允许加入',
                  6: '内部错误'
                };
                let tip = tips[res.err];
                if (tip === undefined) {
                  tip = '其他错误';
                }
                uiTools.toast(tip);
                return;
              }

              // 成功加入了，因此切换界面。
              //TODO 如果考虑到并发因素，那么可能会出现丢失收到某些通知而引起bug，目前暂时没有好的简便的解决方法。
              uiTools.openWindow('prefab/room').then((node) => {
                let c = node.getComponent(Room);
                if (c) {
                  c.setRoomInfo(res);
                }
              }).catch((err) => {
                cc.error(err);
              });
              uiTools.closeWindowAndFireEvent(this.node, true, false);

            }).catch((err) => {
              cc.error(err);
            }).then(() => {
              this._enableInput = true;
            });
          }
        }
      }
    }
  }

  /**
   * 点击退格键的处理。
   * @param evn 事件。
   */
  private _onClickBack(evn: cc.Event) {
    evn.stopPropagation();
    if (!this._enableInput) {
      return;
    }
    if (this._inputs.length > 0) {
      this.backNode.stopAllActions();
      this.backNode.scale = 1;
      let zoomIn = cc.scaleTo(0.1, 1.2).easing(cc.easeBackIn());
      let zoomOut = cc.scaleTo(0.1, 1).easing(cc.easeBackIn());
      this.backNode.runAction(cc.sequence(zoomIn, zoomOut));
      this._inputs.pop();
      let label = this.inputLabels[this._inputs.length];
      if (label) {
        label.string = '';
      }
    }
  }
}