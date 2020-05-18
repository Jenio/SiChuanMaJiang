import { GameRecordUser } from '../../../model/game/other-structs';
import ScoreNumber from '../score/scoreNumber';

const { ccclass, property } = cc._decorator;

/**
 * 历史记录中的玩家信息。
 */
@ccclass
export default class HisPlayerInfo extends cc.Component {

  /**
   * 昵称文本框。
   */
  @property(cc.Label)
  nameLabel: cc.Label = null;

  /**
   * 头像。
   */
  @property(cc.Sprite)
  iconSprite: cc.Sprite = null;

  /**
   * 庄家节点。
   */
  @property(cc.Node)
  bankerNode: cc.Node = null;

  /**
   * 分数。
   */
  @property(ScoreNumber)
  score: ScoreNumber = null;

  /**
   * 头像列表。
   */
  @property(cc.SpriteFrame)
  iconSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 设置。
   * @param name 昵称。
   * @param icon 头像。
   * @param score 分数。
   * @param banker 是否庄家。
   */
  setup(name: string, icon: string | undefined, score: number, banker: boolean) {
    if (this.nameLabel) {
      this.nameLabel.string = name;
    }
    if (icon !== undefined && this.iconSprite) {

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
    if (this.bankerNode) {
      this.bankerNode.active = banker;
    }
    if (this.score) {
      this.score.setup(score);
    }
  }
}