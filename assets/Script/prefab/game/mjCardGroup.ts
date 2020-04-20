import { CardId, CardGroupType, Direction } from '../../model/game/concept';

const { ccclass, property } = cc._decorator;

/**
 * 牌组（碰、杠）。
 */
@ccclass
export default class MjCardGroup extends cc.Component {

  /**
   * 牌花精灵数组。
   */
  @property(cc.Sprite)
  cardFaceSprites: cc.Sprite[] = [];

  /**
   * 牌花帧列表。
   */
  @property(cc.SpriteFrame)
  cardFaceSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 来源方位指示器节点。
   */
  @property(cc.Node)
  indicatorNode: cc.Node = null;

  /**
   * 牌组类型。
   */
  private _cgType: CardGroupType;

  /**
   * 牌ID。
   */
  private _cardId: CardId;

  /**
   * 拥有者方位。
   */
  private _ownerDir: Direction;

  /**
   * 来源方位。
   */
  private _fromDir: Direction;

  /**
   * 牌组类型只读属性。
   */
  get cardGroupType() {
    return this._cgType;
  }

  /**
   * 卡牌ID只读属性。
   */
  get cardId() {
    return this._cardId;
  }

  /**
   * 来源方位只读属性。
   */
  get fromDir() {
    return this._fromDir;
  }

  /**
   * 是否碰只读属性。
   */
  get isPeng() {
    return this._cgType === CardGroupType.Peng;
  }

  /**
   * 是否明杠只读属性。
   */
  get isMingGang() {
    if (this._cgType === CardGroupType.Gang) {
      if (this._ownerDir !== this._fromDir) {
        return true;
      }
    }
    return false;
  }

  /**
   * 是否补杠只读属性。
   */
  get isBuGang() {
    if (this._cgType === CardGroupType.Gang) {
      if (this._ownerDir === this._fromDir) {
        if (this.cardFaceSprites.length > 1) {  // 补杠能看到3张牌花（不管是哪个方位的）。
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 是否暗杠只读属性。
   */
  get isAnGang() {
    if (this._cgType === CardGroupType.Gang) {
      if (this._ownerDir === this._fromDir) {
        if (this.cardFaceSprites.length === 1) {  // 暗杠能看到1张牌花。
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 设置牌组。
   * @param cgType 牌组类型。
   * @param cardId 牌组ID。
   * @param ownerDir 拥有者方位。
   * @param fromDir 来源方位。
   */
  setup(cgType: CardGroupType, cardId: CardId, ownerDir: Direction, fromDir: Direction) {
    this._cgType = cgType;
    this._cardId = cardId;
    this._ownerDir = ownerDir;
    this._fromDir = fromDir;
    let sf = this.cardFaceSpriteFrames[cardId];
    for (let s of this.cardFaceSprites) {
      s.spriteFrame = sf;
    }
    //TODO 设置指示器。
  }
}