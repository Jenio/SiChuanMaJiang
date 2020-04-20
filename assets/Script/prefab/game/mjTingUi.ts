import { CardId } from '../../model/game/concept';
import MjTingCard from './mjTingCard';

const { ccclass, property } = cc._decorator;

/**
 * 牌的听信息。
 */
export interface CardTingInfo {

  /**
   * 牌ID。
   */
  cardId: CardId;

  /**
   * 番数。
   */
  fan: number;

  /**
   * 剩余数量。
   */
  left: number;
}

/**
 * 麻将听牌提示UI。
 */
@ccclass
export default class MjTingUi extends cc.Component {

  /**
   * 张数文本框。
   */
  @property(cc.Label)
  numCardsLabel: cc.Label = null;

  /**
   * 牌容器节点。
   */
  @property(cc.Node)
  cardContainerNode: cc.Node = null;

  /**
   * 牌信息预制体。
   */
  @property(cc.Prefab)
  cardInfoPrefab: cc.Prefab = null;

  /**
   * 设置。
   * @param infos 听牌信息数组。
   */
  setup(infos: CardTingInfo[]) {
    if (infos.length < 1) {
      throw new Error('not enough cards');
    }

    if (this.numCardsLabel) {
      let numCards = 0;
      for (let info of infos) {
        numCards += info.left;
      }
      this.numCardsLabel.string = numCards.toString();
    }

    if (this.cardContainerNode) {

      // 获取听牌节点。
      let tingCardNodes: cc.Node[] = [];
      for (let node of this.cardContainerNode.children) {
        if (node.getComponent(MjTingCard)) {
          tingCardNodes.push(node);
        }
      }

      // 数量不足则添加。
      for (let n = tingCardNodes.length; n < infos.length; ++n) {
        if (this.cardInfoPrefab) {
          let node = cc.instantiate(this.cardInfoPrefab);
          this.cardContainerNode.addChild(node);
          tingCardNodes.push(node);
        }
      }

      // 数量太多则删除。
      for (let n = tingCardNodes.length - 1; n >= infos.length; --n) {
        tingCardNodes[n].removeFromParent(true);
      }

      // 设置所有的牌。
      for (let n = 0; n < infos.length; ++n) {
        let info = infos[n];
        let node = tingCardNodes[n];
        if (node) {
          let c = node.getComponent(MjTingCard);
          if (c) {
            c.setup(info.cardId, info.fan, info.left);
          }
        }
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
   * 是否可见。
   */
  visible() {
    return this.node.active;
  }
}