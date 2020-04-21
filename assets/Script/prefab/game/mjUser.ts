import { CardType } from '../../model/game/concept';

const { ccclass, property } = cc._decorator;

/**
 * 游戏中的用户。
 */
@ccclass
export default class MjUser extends cc.Component {

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
   * 重置到初始状态。
   */
  reset() {
    if (this.queSprite) {
      this.queSprite.node.active = false;
    }
    if (this.bankerNode) {
      this.bankerNode.active = false;
    }
  }
}