import { CardId } from '../../model/game/concept';
import uiTools from '../../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 麻将牌。
 */
@ccclass
export default class MjCard extends cc.Component {

  /**
   * 胡动画。
   */
  @property(cc.Animation)
  huAnim: cc.Animation = null;

  /**
   * 牌花精灵。
   */
  @property(cc.Sprite)
  cardFaceSprite: cc.Sprite = null;

  /**
   * 变暗节点。
   */
  @property(cc.Node)
  darkenNode: cc.Node = null;

  /**
   * 牌花帧列表。
   */
  @property(cc.SpriteFrame)
  cardFaceSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 指示器节点。
   */
  @property(cc.Node)
  indicatorNode: cc.Node = null;

  /**
   * 指示器是否沿Y轴运动。
   */
  @property(cc.Boolean)
  indicatorMoveAlongYAxis: boolean = true;

  /**
   * 指示器是否沿正方向移动。
   */
  @property(cc.Boolean)
  indicatorMovePositive: boolean = true;

  /**
   * 牌ID。
   */
  private _cardId: CardId;

  /**
   * 指示器的Y或X坐标（打开时记录，关闭时恢复）。
   */
  private _indicatorYOrX?: number;

  /**
   * 卡牌ID只读属性。
   */
  get cardId() {
    return this._cardId;
  }

  /**
   * 是否变暗只读属性。
   */
  get darken() {
    if (this.darkenNode) {
      return this.darkenNode.active;
    }
    return false;
  }

  /**
   * 设置卡牌。
   * @param cardId 牌ID。
   * @param darken 是否变暗。
   */
  setup(cardId: CardId, darken?: boolean) {
    this._cardId = cardId;
    if (this.cardFaceSprite) {
      let sf = this.cardFaceSpriteFrames[cardId];
      if (sf) {
        this.cardFaceSprite.spriteFrame = sf;
      } else {
        this.cardFaceSprite.spriteFrame = null;
      }
    }
    if (this.darkenNode) {
      this.darkenNode.active = !!darken;
    }
    if (this.huAnim) {
      this.huAnim.node.active = false;
    }
  }

  /**
   * 设置是否变暗。
   * @param darken 是否变暗。
   */
  setDarken(darken: boolean) {
    if (this.darkenNode) {
      if (this.darkenNode.active !== darken) {
        this.darkenNode.active = darken;
      }
    }
  }

  onLoad() {

    // 点击处理。
    this.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
      evn.stopPropagation();
      this._onClicked();
    });
  }

  /**
   * 点击处理。
   */
  private _onClicked() {
    uiTools.fireEvent(this.node, 'pressed', this, true);
  }

  /**
   * 显示指示器。
   */
  showIndicator() {
    if (this.indicatorNode) {
      this.indicatorNode.active = true;
      if (this.indicatorMoveAlongYAxis) {
        this._indicatorYOrX = this.indicatorNode.y;
      } else {
        this._indicatorYOrX = this.indicatorNode.x;
      }
      let dis = 20;
      if (!this.indicatorMovePositive) {
        dis = -dis;
      }
      if (this.indicatorMoveAlongYAxis) {
        var bounce = cc.sequence(cc.moveBy(0.5, 0, dis).easing(cc.easeSineOut()), cc.moveBy(0.5, 0, -dis).easing(cc.easeSineIn()));
      } else {
        var bounce = cc.sequence(cc.moveBy(0.5, dis, 0).easing(cc.easeSineOut()), cc.moveBy(0.5, -dis, 0).easing(cc.easeSineIn()));
      }
      this.indicatorNode.runAction(cc.repeatForever(bounce));
    }
  }

  /**
   * 隐藏指示器。
   */
  hideIndicator() {
    if (this.indicatorNode) {
      this.indicatorNode.stopAllActions();
      if (this._indicatorYOrX !== undefined) {
        if (this.indicatorMoveAlongYAxis) {
          this.indicatorNode.y = this._indicatorYOrX;
        } else {
          this.indicatorNode.x = this._indicatorYOrX;
        }
      }
      this.indicatorNode.active = false;
    }
  }

  /**
   * 播放胡特效。
   */
  playHuEffect() {
    if (this.huAnim) {
      this.huAnim.node.active = true;
      this.huAnim.once('stop', (evn) => {
        this.huAnim.node.active = false;
      });
      let state = this.huAnim.play();
      state.repeatCount = 1;
    }
  }
}