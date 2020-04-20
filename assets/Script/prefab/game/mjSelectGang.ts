import { CardId } from '../../model/game/concept';
import uiTools from '../../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 杠选择。
 */
@ccclass
export default class MjSelectGang extends cc.Component {

  /**
   * 牌1牌花精灵。
   */
  @property(cc.Sprite)
  card1FaceSprite: cc.Sprite = null;

  /**
   * 牌2牌花精灵。
   */
  @property(cc.Sprite)
  card2FaceSprite: cc.Sprite = null;

  /**
   * 牌3牌花精灵。
   */
  @property(cc.Sprite)
  card3FaceSprite: cc.Sprite = null;

  /**
   * 最后一个卡牌节点。
   */
  @property(cc.Node)
  lastCardNode: cc.Node = null;

  /**
   * 最后一个分割线节点。
   */
  @property(cc.Node)
  lastSepNode: cc.Node = null;

  /**
   * 牌花帧列表。
   */
  @property(cc.SpriteFrame)
  cardFaceSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 第一张牌ID。
   */
  private _cardId1: CardId;

  /**
   * 第二张牌ID。
   */
  private _cardId2: CardId;

  /**
   * 第三张牌ID。
   */
  private _cardId3?: CardId;

  /**
   * 设置卡牌。
   * @param cardId1 第一张牌ID。
   * @param cardId2 第二张牌ID。
   * @param cardId3 第三张牌ID。
   */
  setup(cardId1: CardId, cardId2: CardId, cardId3?: CardId) {
    this._cardId1 = cardId1;
    this._cardId2 = cardId2;
    this._cardId3 = cardId3;
    if (this.card1FaceSprite) {
      this.card1FaceSprite.spriteFrame = this.cardFaceSpriteFrames[cardId1];
    }
    if (this.card2FaceSprite) {
      this.card2FaceSprite.spriteFrame = this.cardFaceSpriteFrames[cardId2];
    }
    if (cardId3 !== undefined) {
      if (this.lastSepNode) {
        this.lastSepNode.active = true;
      }
      if (this.lastCardNode) {
        this.lastCardNode.active = true;
      }
      if (this.card3FaceSprite) {
        this.card3FaceSprite.spriteFrame = this.cardFaceSpriteFrames[cardId3];
      }
    } else {
      if (this.lastSepNode) {
        this.lastSepNode.active = false;
      }
      if (this.lastCardNode) {
        this.lastCardNode.active = false;
      }
    }
  }

  /**
   * 显示。
   */
  show() {
    this.node.active = true;
  }

  /**
   * 隐藏。
   */
  hide() {
    this.node.active = false;
  }

  /**
   * 当前是否可见。
   */
  visible() {
    return this.node.active;
  }

  /**
   * 点击了第一张牌。
   * @param evn 事件。
   */
  onClickCard1(evn: cc.Event) {
    evn.stopPropagation();
    uiTools.fireEvent(this.node, 'selected', this._cardId1, false);
  }

  /**
   * 点击了第二张牌。
   * @param evn 事件。
   */
  onClickCard2(evn: cc.Event) {
    evn.stopPropagation();
    uiTools.fireEvent(this.node, 'selected', this._cardId2, false);
  }

  /**
   * 点击了第三张牌。
   * @param evn 事件。
   */
  onClickCard3(evn: cc.Event) {
    evn.stopPropagation();
    uiTools.fireEvent(this.node, 'selected', this._cardId3, false);
  }
}