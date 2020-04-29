import cache from '../../../model/cache';
import uiTools from '../../../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 聊天列表中列表项。
 */
@ccclass
export default class ChatListItem extends cc.Component {

  /**
   * 文本框。
   */
  @property(cc.Label)
  chatLabel: cc.Label = null;

  /**
   * 聊天内容ID。
   */
  private _chatId: number = 0;

  /**
   * 设置。
   * @param id 聊天内容ID。
   * @param txt 聊天内容文本。
   */
  setup(id: number, txt: string) {
    this._chatId = id;
    if (this.chatLabel) {
      this.chatLabel.string = txt;
    }
  }

  onClick(evn: cc.Event) {
    evn.stopPropagation();
    cache.cmd.execCmd(`${cache.route}:game/chat`, {
      roomId: cache.roomId,
      chatId: this._chatId
    }).then((res) => {
      if (res.err !== undefined) {
        cc.warn(`res.err is: ${res.err}`);
        if (res.err === 2 || res.err === 3) {
          uiTools.fireEvent(this.node, 'notFoundRoom', undefined, true);
        }
      }
    }).catch((err) => {
      cc.error(err);
      uiTools.toast('发送失败');
    }).then(() => {
      uiTools.fireEvent(this.node, 'fin', undefined, true);
    });
  }
}