import { CardId } from '../../model/game/concept';
import MjCard from './mjCard';

const { ccclass, property } = cc._decorator;

/**
 * 出牌区域。
 */
@ccclass
export default class MjDiscardArea extends cc.Component {

  /**
   * 第一行节点。
   */
  @property(cc.Node)
  firstLineNode: cc.Node = null;

  /**
   * 第二行节点。
   */
  @property(cc.Node)
  secondLineNode: cc.Node = null;

  /**
   * 牌预制体。
   */
  @property(cc.Prefab)
  cardPrefab: cc.Prefab = null;

  /**
   * 是否右侧（右侧的布局比较特殊，节点需要从前方插入）。
   */
  @property(cc.Boolean)
  rightSide: boolean = false;

  /**
   * 当前显示显示器的节点。
   */
  private _indicatorCard?: MjCard;

  /**
   * 添加牌。
   * @param cardId 牌。
   * @param showIndicator 是否顺便显示指示器。
   */
  addCard(cardId: CardId, showIndicator: boolean) {
    if (this.cardPrefab) {
      let lineNode = this.firstLineNode;
      if (lineNode && lineNode.childrenCount >= 9) {
        lineNode = this.secondLineNode;
      }
      if (lineNode) {
        let node = cc.instantiate(this.cardPrefab);
        let c = node.getComponent(MjCard);
        if (c) {
          c.setup(cardId);
          if (showIndicator) {
            c.showIndicator();
            this._indicatorCard = c;
          }
        }
        if (this.rightSide) {
          lineNode.insertChild(node, 0);
        } else {
          lineNode.addChild(node);
        }
      }
    }
  }

  /**
   * 获取最后一张牌的节点。
   */
  private _getLastCardNode(): cc.Node | null {
    if (this.secondLineNode && this.secondLineNode.childrenCount > 0) {
      if (this.rightSide) {
        return this.secondLineNode.children[0];
      } else {
        return this.secondLineNode.children[this.secondLineNode.childrenCount - 1];
      }
    }
    if (this.firstLineNode && this.firstLineNode.childrenCount > 0) {
      if (this.rightSide) {
        return this.firstLineNode.children[0];
      } else {
        return this.firstLineNode.children[this.firstLineNode.childrenCount - 1];
      }
    }
    return null;
  }

  /**
   * 移除最后一张牌。
   */
  removeLastCard() {
    let node = this._getLastCardNode();
    if (node) {
      node.removeFromParent(true);
    }
  }

  /**
   * 获取最后一张牌。
   */
  getLastCard(): CardId | undefined {
    let node = this._getLastCardNode();
    if (node) {
      let c = node.getComponent(MjCard);
      if (c) {
        return c.cardId;
      }
    }
    return undefined;
  }

  /**
   * 隐藏指示器。
   */
  hideIndicator() {
    if (this._indicatorCard) {
      this._indicatorCard.hideIndicator();
      this._indicatorCard = undefined;
    }
  }

  /**
   * 获取所有的牌。
   */
  getCards(): CardId[] {
    let cards: CardId[] = [];
    if (this.firstLineNode) {
      for (let node of this.firstLineNode.children) {
        let c = node.getComponent(MjCard);
        if (c) {
          cards.push(c.cardId);
        }
      }
    }
    if (this.secondLineNode) {
      for (let node of this.secondLineNode.children) {
        let c = node.getComponent(MjCard);
        if (c) {
          cards.push(c.cardId);
        }
      }
    }
    return cards;
  }

  /**
   * 空只读属性。
   */
  get empty() {
    let count = 0;
    if (this.firstLineNode) {
      count += this.firstLineNode.childrenCount;
    }
    if (this.secondLineNode) {
      count += this.secondLineNode.childrenCount;
    }
    return count;
  }

  /**
   * 清空。
   */
  clear() {
    this.hideIndicator();
    if (this.firstLineNode) {
      this.firstLineNode.removeAllChildren(true);
    }
    if (this.secondLineNode) {
      this.secondLineNode.removeAllChildren(true);
    }
  }
}