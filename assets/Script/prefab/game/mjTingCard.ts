import { CardId } from '../../model/game/concept';

const { ccclass, property } = cc._decorator;

/**
 * 麻将的听牌（用于显示在听提示信息中）。
 */
@ccclass
export default class MjTingCard extends cc.Component {

  /**
   * 牌花精灵。
   */
  @property(cc.Sprite)
  cardFaceSprite: cc.Sprite = null;

  /**
   * 番数文本框。
   */
  @property(cc.Label)
  fanLabel: cc.Label = null;

  /**
   * 剩余张数文本框。
   */
  @property(cc.Label)
  leftLabel: cc.Label = null;

  /**
   * 牌花帧列表。
   */
  @property(cc.SpriteFrame)
  cardFaceSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 设置卡牌。
   * @param cardId 牌ID。
   * @param fan 番数。
   * @param left 剩余张数。
   */
  setup(cardId: CardId, fan: number, left: number) {
    if (this.cardFaceSprite) {
      let sf = this.cardFaceSpriteFrames[cardId];
      if (sf) {
        this.cardFaceSprite.spriteFrame = sf;
      } else {
        this.cardFaceSprite.spriteFrame = null;
      }
    }
    if (this.fanLabel) {
      this.fanLabel.string = fan.toString();
    }
    if (this.leftLabel) {
      this.leftLabel.string = left.toString();
    }
  }
}