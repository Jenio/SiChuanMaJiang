import { Direction } from '../../../model/game/concept';
import cache from '../../../model/cache';

const { ccclass, property } = cc._decorator;

/**
 * 对局流水界面中的用户头像信息。
 */
@ccclass
export default class ScoreUserInfo extends cc.Component {

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
   * 方位图片精灵。
   */
  @property(cc.Sprite)
  dirSprite: cc.Sprite = null;

  /**
   * 东图片精灵帧。
   */
  @property(cc.SpriteFrame)
  eastSpriteFrame: cc.SpriteFrame = null;

  /**
   * 北图片精灵帧。
   */
  @property(cc.SpriteFrame)
  northSpriteFrame: cc.SpriteFrame = null;

  /**
   * 西图片精灵帧。
   */
  @property(cc.SpriteFrame)
  westSpriteFrame: cc.SpriteFrame = null;

  /**
   * 南图片精灵帧。
   */
  @property(cc.SpriteFrame)
  southSpriteFrame: cc.SpriteFrame = null;

  /**
   * 头像图片精灵帧。
   */
  @property(cc.SpriteFrame)
  iconSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 设置。
   * @param dir 方位。
   * @param name 昵称。
   * @param icon 头像。
   */
  setup(dir: Direction, name: string, icon: string) {
    if (this.dirSprite) {
      if (dir === Direction.East) {
        this.dirSprite.spriteFrame = this.eastSpriteFrame;
      } else if (dir === Direction.North) {
        this.dirSprite.spriteFrame = this.northSpriteFrame;
      } else if (dir === Direction.West) {
        this.dirSprite.spriteFrame = this.westSpriteFrame;
      } else if (dir === Direction.South) {
        this.dirSprite.spriteFrame = this.southSpriteFrame;
      }
    }
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
  }

}