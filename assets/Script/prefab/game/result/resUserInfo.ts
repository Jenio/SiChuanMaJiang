import ResScore from './resScore';

const { ccclass, property } = cc._decorator;

/**
 * 结果界面中的用户信息。
 */
@ccclass
export default class ResUserInfo extends cc.Component {

  /**
   * 昵称文本框。
   */
  @property(cc.Label)
  nameLabel: cc.Label = null;

  /**
   * 方位文本框。
   */
  @property(cc.Label)
  dirLabel: cc.Label = null;

  /**
   * 头像精灵。
   */
  @property(cc.Sprite)
  iconSprite: cc.Sprite = null;

  /**
   * 分数。
   */
  @property(ResScore)
  score: ResScore = null;

  /**
   * 头像列表。
   */
  @property(cc.SpriteFrame)
  iconSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 设置。
   * @param name 昵称。
   * @param icon 头像。
   * @param dir 相对方位。
   * @param score 分数。
   */
  setup(name: string, icon: string, dir: string, score: number) {
    if (this.nameLabel) {
      this.nameLabel.string = name;
    }
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
        if (this.iconSpriteFrames) {
          this.iconSprite.spriteFrame = this.iconSpriteFrames[+icon % this.iconSpriteFrames.length];
        }
      }
    }
    if (this.dirLabel) {
      this.dirLabel.string = dir;
    }
    if (this.score) {
      this.score.setup(score);
    }
  }
}