import ChatListItem from './chatListItem';
import uiTools from '../../../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 聊天内容选择。
 */
@ccclass
export default class ChatSelection extends cc.Component {

  /**
   * 容器节点。
   */
  @property(cc.Node)
  containerNode: cc.Node = null;

  /**
   * 聊天项预制体。
   */
  @property(cc.Prefab)
  chatItemPrefab: cc.Prefab = null;

  /**
   * 分割线预制体。
   */
  @property(cc.Prefab)
  seperatorPrefab: cc.Prefab = null;

  /**
   * 消息列表。
   */
  static readonly chatMsgs = [
    '不要吵了不要吵了，吵什么吵嘛，专心玩游戏吧',
    '下次咱们再玩吧，我要走了',
    '再见了，我会想念大家的',
    '怎么又断线了，网络怎么这么差啊',
    '不要走，决战到天亮啊',
    '大家好，很高兴见到各位',
    '各位，真是不好意思啊，我得离开一会儿',
    '和你合作真是太愉快了啊',
    '快点啊，都等得我花都谢了',
    '你的牌打得忒好了啊',
    '你是MM还是GG啊',
    '交个朋友吧，能告诉我你咋联系的吗'
  ];

  onLoad() {
    if (this.containerNode && this.chatItemPrefab) {
      for (let n = 0; n < ChatSelection.chatMsgs.length; ++n) {
        let msg = ChatSelection.chatMsgs[n];
        let node = cc.instantiate(this.chatItemPrefab);
        let c = node.getComponent(ChatListItem);
        if (c) {
          c.setup(n, msg);
        }
        this.containerNode.addChild(node);
        if (n < ChatSelection.chatMsgs.length - 1) {
          if (this.seperatorPrefab) {
            let node = cc.instantiate(this.seperatorPrefab);
            this.containerNode.addChild(node);
          }
        }
      }
    }

    // 点击了聊天项则需要关闭本界面。
    this.node.on('fin', (evn: cc.Event) => {
      evn.stopPropagation();
      uiTools.closeWindowAndFireEvent(this.node, undefined, true);
    });

    cc.log(this.containerNode.childrenCount);
  }
}