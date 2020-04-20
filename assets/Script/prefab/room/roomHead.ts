import uiTools from '../../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 房间内的用户头像。
 */
@ccclass
export default class RoomHead extends cc.Component {

  /**
   * 空节点（默认active=true）。
   */
  @property(cc.Node)
  emptyNode: cc.Node = null;

  /**
   * 用户节点（默认active=false）。
   */
  @property(cc.Node)
  userNode: cc.Node = null;

  /**
   * 就绪节点（默认active=false）。
   */
  @property(cc.Node)
  readyNode: cc.Node = null;

  /**
   * 踢玩家节点 (默认active=false）。
   */
  @property(cc.Node)
  kickNode: cc.Node = null;

  /**
   * 房主标志节点（默认active=false）。
   */
  @property(cc.Node)
  ownerNode: cc.Node = null;

  /**
   * 昵称文本框。
   */
  @property(cc.Label)
  nameLabel: cc.Label = null;

  /**
   * 头像精灵。
   */
  @property(cc.Sprite)
  iconSprite: cc.Sprite = null;

  /**
   * 头像列表。
   */
  @property(cc.SpriteFrame)
  iconSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 用户ID。
   */
  private _uid?: number;

  /**
   * 空只读属性。
   */
  get empty() {
    if (this.emptyNode) {
      return this.emptyNode.active;
    }
    return true;
  }

  /**
   * 用户ID（仅当empty为false时有意义）只读属性。
   */
  get uid() {
    return this._uid;
  }

  /**
   * 设置用户。
   * @param uid 用户ID。
   * @param owner 是否房主。
   * @param kickable 是否有踢按钮。
   * @param ready 是否已就绪。
   * @param name 昵称。
   * @param icon 头像。
   */
  setUser(uid: number, owner: boolean, kickable: boolean, ready: boolean, name: string, icon: string) {
    this._uid = uid;
    if (this.userNode) {
      this.userNode.active = true;
      if (this.ownerNode) {
        this.ownerNode.active = owner;
      }
      if (this.kickNode) {
        this.kickNode.active = kickable;
      }
      if (this.readyNode) {
        this.readyNode.active = ready;
      }

      // 设置昵称。
      if (this.nameLabel) {
        this.nameLabel.string = name;
      }

      // 加载头像。
      // 1、头像来自外部url，那么加载并显示。
      // 2、头像不是外部url，那么直接显示。
      if (icon.indexOf('/') > 0) {
        cc.loader.load(icon, (err, texture) => {
          if (err) {
            //TODO 使用加载失败的头像。
            return;
          }
          this.iconSprite.spriteFrame = new cc.SpriteFrame(texture);
        });
      } else {
        if (this.iconSpriteFrames) {
          this.iconSprite.spriteFrame = this.iconSpriteFrames[+icon % this.iconSpriteFrames.length];
        }
      }
    }
    if (this.emptyNode) {
      this.emptyNode.active = false;
    }
  }

  /**
   * 清除头像（即界面显示问号的状态）。
   */
  clearUser() {
    if (this.userNode) {
      this.userNode.active = false;
    }
    if (this.emptyNode) {
      this.emptyNode.active = true;
    }
  }

  /**
   * 设置为就绪。
   */
  setReady() {
    if (this.readyNode) {
      this.readyNode.active = true;
    }
  }

  /**
   * 清除就绪状态。
   */
  clearReady() {
    if (this.readyNode) {
      this.readyNode.active = false;
    }
  }

  /**
   * 点击踢出按钮的处理。
   */
  onClickKick() {
    if (this._uid !== undefined) {
      uiTools.fireEvent(this.node, 'kick', this._uid, true);
    }
  }
}