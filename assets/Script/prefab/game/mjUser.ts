import { CardType } from '../../model/game/concept';

const { ccclass, property } = cc._decorator;

/**
 * 游戏中的用户。
 */
@ccclass
export default class MjUser extends cc.Component {

  /**
   * 离线节点。
   */
  @property(cc.Node)
  offlineNode: cc.Node = null;

  /**
   * 旋转动画（用来表示当前轮到该玩家出牌）。
   */
  @property(cc.Animation)
  rotateAnim: cc.Animation = null;

  /**
   * 头像精灵。
   */
  @property(cc.Sprite)
  iconSprite: cc.Sprite = null;

  /**
   * 缺牌类型精灵。
   */
  @property(cc.Sprite)
  queSprite: cc.Sprite = null;

  /**
   * 筒（饼）图片帧。
   */
  @property(cc.SpriteFrame)
  tongSpriteFrame: cc.SpriteFrame = null;

  /**
   * 锁（条）图片帧。
   */
  @property(cc.SpriteFrame)
  suoSpriteFrame: cc.SpriteFrame = null;

  /**
   * 万图片帧。
   */
  @property(cc.SpriteFrame)
  wanSpriteFrame: cc.SpriteFrame = null;

  /**
   * 庄家节点。
   */
  @property(cc.Node)
  bankerNode: cc.Node = null;

  /**
   * 聊天节点。
   */
  @property(cc.Node)
  chatNode: cc.Node = null;

  /**
   * 聊天内容文本框。
   */
  @property(cc.Label)
  chatLabel: cc.Label = null;

  /**
   * 昵称文本框。
   */
  @property(cc.Label)
  nameLabel: cc.Label = null;

  /**
   * 分数文本框。
   */
  @property(cc.Label)
  scoreLabel: cc.Label = null;

  /**
   * 头像精灵帧数组。
   */
  @property(cc.SpriteFrame)
  iconSpriteFrames: cc.SpriteFrame[] = [];

  private _name?: string;
  private _icon?: string;

  /**
   * 保活超时处理器。
   */
  private _keepAliveTimeoutHandler = this._onKeepAliveTimeout.bind(this);

  /**
   * 吟唱聊天框处理器。
   */
  private _hideChatHandler = this._onHideChat.bind(this);

  get userName() {
    return this._name;
  }
  get userIcon() {
    return this._icon;
  }

  /**
   * 设置。
   * @param icon 头像。
   * @param name 昵称。
   * @param score 分数。
   * @param banker 是否庄。
   */
  setup(icon: string, name: string, score: number, banker: boolean) {
    this._name = name;
    this._icon = icon;

    if (this.iconSprite) {

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
        this.iconSprite.spriteFrame = this.iconSpriteFrames[+icon % this.iconSpriteFrames.length];
      }
    }
    if (this.nameLabel) {
      this.nameLabel.string = name;
    }
    if (this.scoreLabel) {
      this.scoreLabel.string = score.toString();
    }
    if (this.queSprite) {
      this.queSprite.node.active = false;
    }
    if (this.bankerNode) {
      this.bankerNode.active = banker;
    }
  }

  /**
   * 设置为庄家。
   */
  setBanker() {
    if (this.bankerNode) {
      this.bankerNode.active = true;
    }
  }

  /**
   * 定缺。
   * @param queType 缺牌类型。
   */
  setQue(queType: CardType) {
    if (this.queSprite) {
      this.queSprite.node.active = true;
      if (queType === CardType.Tong) {
        if (this.tongSpriteFrame) {
          this.queSprite.spriteFrame = this.tongSpriteFrame;
        }
      } else if (queType === CardType.Suo) {
        if (this.suoSpriteFrame) {
          this.queSprite.spriteFrame = this.suoSpriteFrame;
        }
      } else if (queType === CardType.Wan) {
        if (this.wanSpriteFrame) {
          this.queSprite.spriteFrame = this.wanSpriteFrame;
        }
      }
    }
  }

  /**
   * 设置分数。
   * @param score 分数。
   */
  setScore(score: number) {
    if (this.scoreLabel) {
      this.scoreLabel.string = score.toString();
    }
  }

  /**
   * 设置为当前出牌玩家。
   */
  setCurrent() {
    if (this.rotateAnim) {
      this.rotateAnim.node.active = true;
      this.rotateAnim.play();
    }
  }

  /**
   * 取消作为当前出牌的玩家。
   */
  clearCurrent() {
    if (this.rotateAnim) {
      this.rotateAnim.stop();
      this.rotateAnim.node.active = false;
    }
  }

  /**
   * 重置到初始状态。
   */
  reset() {
    if (this.queSprite) {
      this.queSprite.node.active = false;
    }
    if (this.bankerNode) {
      this.bankerNode.active = false;
    }
    this.clearCurrent();
  }

  /**
   * 保活。
   */
  keepAlive() {
    this.unschedule(this._keepAliveTimeoutHandler);
    this.scheduleOnce(this._keepAliveTimeoutHandler, 5);
    if (this.offlineNode && this.offlineNode.active) {
      this.offlineNode.active = false;
    }
  }

  /**
   * 保活超时处理。
   */
  private _onKeepAliveTimeout() {
    if (this.offlineNode) {
      this.offlineNode.active = true;
    }
  }

  /**
   * 隐藏聊天内容。
   */
  private _onHideChat() {
    if (this.chatNode) {
      this.chatNode.active = false;
    }
  }

  /**
   * 设置聊天文本。
   * @param txt 聊天文本。
   */
  setChat(txt: string) {
    if (this.chatNode) {
      if (this.chatNode.active) {
        this.unschedule(this._hideChatHandler);
      } else {
        this.chatNode.active = true;
      }
      this.scheduleOnce(this._hideChatHandler, 2);
    }
    if (this.chatLabel) {
      this.chatLabel.string = txt;
    }
  }

  /**
   * 获取定缺节点所在的位置。
   * @param at 目标坐标系节点。
   */
  getSkipTypePos(at: cc.Node): cc.Vec3 {
    if (this.queSprite) {
      let worldPos = this.queSprite.node.convertToWorldSpaceAR(cc.v3(0, 0, 0));
      return at.convertToNodeSpaceAR(worldPos);
    }
    return cc.v3(0, 0, 0);
  }

  /**
   * 获取定缺节点的尺寸。
   */
  getSkipTypeSize(): cc.Size {
    if (this.queSprite) {
      return cc.size(this.queSprite.node.width, this.queSprite.node.height);
    }
    return cc.size(0, 0);
  }
}