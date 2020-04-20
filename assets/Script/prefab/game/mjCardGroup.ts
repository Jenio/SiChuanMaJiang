import { CardId, CardGroupType, Direction, ScreenDirection } from '../../model/game/concept';

const { ccclass, property } = cc._decorator;

/**
 * 牌组（碰、杠）。
 */
@ccclass
export default class MjCardGroup extends cc.Component {

  /**
   * 来源方位指示器节点。
   */
  @property(cc.Node)
  indicatorNode: cc.Node = null;

  /**
   * 指示器初始旋转角度。
   */
  @property(cc.Integer)
  indicatorSDir = ScreenDirection.Left;

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

    // 设置指示器。
    if (this.indicatorNode) {
      if (ownerDir === fromDir) {
        this.indicatorNode.active = false;
      } else {
        this.indicatorNode.active = true;
        switch (ownerDir) {
          case Direction.East:
            switch (fromDir) {
              case Direction.North:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 90;
                }
                break;
              case Direction.West:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = 180;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = -180;
                }
                break;
              case Direction.South:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = -180;
                }
                break;
            }
            break;
          case Direction.North:
            switch (fromDir) {
              case Direction.East:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 180;
                }
                break;
              case Direction.West:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -180;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 90;
                }
                break;
              case Direction.South:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = 180;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 90;
                }
                break;
            }
            break;
          case Direction.West:
            switch (fromDir) {
              case Direction.East:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = -180;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 90;
                }
                break;
              case Direction.North:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = -180;
                }
                break;
              case Direction.South:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -180;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 0;
                }
                break;
            }
            break;
          case Direction.South:
            switch (fromDir) {
              case Direction.East:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -180;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 90;
                }
                break;
              case Direction.North:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = -180;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 90;
                }
                break;
              case Direction.West:
                if (this.indicatorSDir === ScreenDirection.Bottom) {
                  this.indicatorNode.angle = 90;
                } else if (this.indicatorSDir === ScreenDirection.Top) {
                  this.indicatorNode.angle = -90;
                } else if (this.indicatorSDir === ScreenDirection.Left) {
                  this.indicatorNode.angle = 0;
                } else if (this.indicatorSDir === ScreenDirection.Right) {
                  this.indicatorNode.angle = 90;
                }
                break;
            }
            break;
        }
      }
    }
  }
}