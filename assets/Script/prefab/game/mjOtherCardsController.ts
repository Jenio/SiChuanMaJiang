import { CardId, Direction, CardGroupType, fromDirChar, CardGroup } from '../../model/game/concept';
import MjCardGroup from './mjCardGroup';
import { CardGroupData } from '../../model/game/msgs/game-info';
import MjCard from './mjCard';

const { ccclass, property } = cc._decorator;

/**
 * 其他玩家的牌的控制器（用于控制出牌、碰、杠等行为）。
 */
@ccclass
export default class MjOtherCardsController extends cc.Component {

  /**
   * 手牌容器节点。
   */
  @property(cc.Node)
  handCardsNode: cc.Node = null;

  /**
   * 明牌手牌容器节点（不一定都需要有，没有的时候在摊牌的时候使用handCardsNode）。
   */
  @property(cc.Node)
  visibleHandCardsNode: cc.Node = null;

  /**
   * 牌组节点。
   */
  @property(cc.Node)
  cardGroupsNode: cc.Node =  null;

  /**
   * 手牌预制体。
   */
  @property(cc.Prefab)
  handCardPrefab: cc.Prefab = null;

  /**
   * 明牌预制体。
   */
  @property(cc.Prefab)
  visibleHandCardPrefab: cc.Prefab = null;

  /**
   * 碰预制体。
   */
  @property(cc.Prefab)
  pengPrefab: cc.Prefab = null;

  /**
   * 明杠预制体（也用于补杠）。
   */
  @property(cc.Prefab)
  mingGangPrefab: cc.Prefab = null;

  /**
   * 暗杠预制体。
   */
  @property(cc.Prefab)
  anGangPrefab: cc.Prefab = null;

  /**
   * 是否反转明牌的排序。
   */
  @property(cc.Boolean)
  invertVisibleHandCardOrder: boolean = false;

  /**
   * 初始化牌组。
   * @param dir 玩家所在的方位。
   * @param groups 牌组数组。
   */
  initCardGroups(dir: Direction, groups: CardGroupData[]) {
    if (this.cardGroupsNode) {
      for (let g of groups) {
        if (g.type === 'peng') {
          if (this.pengPrefab) {
            let node = cc.instantiate(this.pengPrefab);
            let c = node.getComponent(MjCardGroup);
            if (c) {
              c.setup(CardGroupType.Peng, g.card, dir, fromDirChar(g.dir));
            }
            this.cardGroupsNode.addChild(node);
          }
        } else if (g.type === 'gang') {
          if (g.open) {
            if (this.mingGangPrefab) {
              let node = cc.instantiate(this.mingGangPrefab);
              let c = node.getComponent(MjCardGroup);
              if (c) {
                c.setup(CardGroupType.Gang, g.card, dir, fromDirChar(g.dir));
              }
              this.cardGroupsNode.addChild(node);
            }
          } else {
            if (this.anGangPrefab) {
              let node = cc.instantiate(this.anGangPrefab);
              let c = node.getComponent(MjCardGroup);
              if (c) {
                c.setup(CardGroupType.Gang, g.card, dir, fromDirChar(g.dir));
              }
              this.cardGroupsNode.addChild(node);
            }
          }
        } else {
          throw new Error(`unknown card group '${g.type}'`);
        }
      }
    }
  }

  /**
   * 初始化手牌数组。
   * @param numCards 手牌数量（包含抽牌）。
   */
  initHandCards(numCards: number) {
    if (this.handCardsNode && this.handCardPrefab) {
      for (let n = 0; n < numCards; ++n) {
        let node = cc.instantiate(this.handCardPrefab);
        this.handCardsNode.addChild(node);
      }
    }
  }

  /**
   * 添加一张手牌。
   */
  addHandCard() {
    if (this.handCardsNode && this.handCardPrefab) {
      let node = cc.instantiate(this.handCardPrefab);
      this.handCardsNode.addChild(node);
    }
  }

  /**
   * 设置手牌（用于摊牌），会对传入的牌进行排序。
   * @param cards 卡牌。
   */
  setHandCards(cards: CardId[]) {

    // 选择摊牌容器，如果没有明牌容器，那么就选择暗牌容器（对于上方玩家，一般情况都是使用暗牌容器，当然编辑器中也可以给出一个明牌容器）。
    let handCardsNode = this.handCardsNode;
    if (this.visibleHandCardsNode) {
      handCardsNode = this.visibleHandCardsNode;
    }

    // 向容器添加牌。
    if (handCardsNode && this.visibleHandCardPrefab) {

      // 将牌进行排序。
      if (this.invertVisibleHandCardOrder) {
        cards.sort((a, b) => {
          return b - a;
        });
      } else {
        cards.sort((a, b) => {
          return a - b;
        });
      }

      // 放入牌。
      for (let cardId of cards) {
        let node = cc.instantiate(this.visibleHandCardPrefab);
        let c = node.getComponent(MjCard);
        if (c) {
          c.setup(cardId);
        }
        handCardsNode.addChild(node);
      }
    }
  }

  /**
   * 清空。
   */
  clear() {
    if (this.handCardsNode) {
      this.handCardsNode.removeAllChildren(true);
      this.handCardsNode.width = 0;
    }
    if (this.cardGroupsNode) {
      this.cardGroupsNode.removeAllChildren(true);
      this.cardGroupsNode.width = 0;
    }
    if (this.visibleHandCardsNode) {
      this.visibleHandCardsNode.removeAllChildren(true);
      this.visibleHandCardsNode.width = 0;
    }
  }

  /**
   * 从手牌中移除一张牌，返回是否成功移除。
   */
  removeHandCard(): boolean {
    if (this.handCardsNode) {
      if (this.handCardsNode.childrenCount > 0) {
        this.handCardsNode.children[this.handCardsNode.children.length - 1].removeFromParent(true);
        return true;
      }
    }
    return false;
  }

  /**
   * 清除所有手牌。
   */
  removeAllHandCards() {
    if (this.handCardsNode) {
      this.handCardsNode.removeAllChildren(true);
    }
  }

  /**
   * 获取牌组。
   */
  getCardGroups(): CardGroup[] {
    let groups: CardGroup[] = [];
    if (this.cardGroupsNode) {
      for (let x of this.cardGroupsNode.children) {
        let cg = x.getComponent(MjCardGroup);
        if (cg) {
          if (cg.isPeng) {
            groups.push({
              t: 'peng',
              cardId: cg.cardId,
              fromDir: cg.fromDir
            });
          } else if (cg.isBuGang) {
            groups.push({
              t: 'gang',
              cardId: cg.cardId,
              fromDir: cg.fromDir,
              open: true,
            });
          } else if (cg.isAnGang) {
            groups.push({
              t: 'gang',
              cardId: cg.cardId,
              fromDir: cg.fromDir,
              open: false,
            });
          } else if (cg.isMingGang) {
            groups.push({
              t: 'gang',
              cardId: cg.cardId,
              fromDir: cg.fromDir,
              open: true,
            });
          }
        }
      }
    }
    return groups;
  }

  /**
   * 牌组数量只读属性。
   */
  get numCardGroups() {
    if (this.cardGroupsNode) {
      return this.cardGroupsNode.childrenCount;
    }
    return 0;
  }

  /**
   * 碰。
   * @param cardId 牌。
   * @param dir 执行碰的玩家所在的方位。
   * @param fromDir 来源方位。
   */
  peng(cardId: CardId, dir: Direction, fromDir: Direction) {

    // 添加牌组。
    if (this.cardGroupsNode && this.pengPrefab) {
      let node = cc.instantiate(this.pengPrefab);
      let c = node.getComponent(MjCardGroup);
      if (c) {
        c.setup(CardGroupType.Peng, cardId, dir, fromDir);
      }
      this.cardGroupsNode.addChild(node);
    }

    // 从手牌中移除2张。
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
  }

  /**
   * 明杠。
   * @param cardId 牌。
   * @param dir 执行明杠的玩家所在的方位。
   * @param fromDir 来源方位。
   */
  mingGang(cardId: CardId, dir: Direction, fromDir: Direction) {

    // 添加牌组。
    if (this.cardGroupsNode && this.mingGangPrefab) {
      let node = cc.instantiate(this.mingGangPrefab);
      let c = node.getComponent(MjCardGroup);
      if (c) {
        c.setup(CardGroupType.Gang, cardId, dir, fromDir);
      }
      this.cardGroupsNode.addChild(node);
    }

    // 从手牌中移除3张。
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
  }

  /**
   * 补杠。
   * @param cardId 牌。
   * @param dir 即是执行补杠的玩家所在的方位，也是来源方位。
   */
  buGang(cardId: CardId, dir: Direction) {

    // 删除碰牌组，添加杠牌组。
    if (this.cardGroupsNode) {

      // 删除碰。
      let idx = 0;
      for (let x of this.cardGroupsNode.children) {
        let c = x.getComponent(MjCardGroup);
        if (c && c.isPeng && c.cardId === cardId) {
          idx = x.getSiblingIndex();
          x.removeFromParent(true);
          break;
        }
      }

      // 添加补杠。
      if (this.mingGangPrefab) {
        let node = cc.instantiate(this.mingGangPrefab);
        let c = node.getComponent(MjCardGroup);
        if (c) {
          c.setup(CardGroupType.Gang, cardId, dir, dir);
        }
        this.cardGroupsNode.insertChild(node, idx);
      }
    }

    // 移除一张牌。
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
  }

  /**
   * 补杠回退（即被抢杠胡了），目前会丢失来源方向。
   * @param cardId 牌。
   * @param dir 执行补杠的玩家所在的方位。
   */
  unBuGang(cardId: CardId, dir: Direction) {

    // 删除指定的杠牌组，添加碰牌组。
    if (this.cardGroupsNode) {

      // 删除杠。
      let idx = 0;
      for (let x of this.cardGroupsNode.children) {
        let c = x.getComponent(MjCardGroup);
        if (c && c.isBuGang && c.cardId === cardId) {
          idx = x.getSiblingIndex();
          x.removeFromParent(true);
          break;
        }
      }

      // 添加碰。
      if (this.pengPrefab) {
        let node = cc.instantiate(this.pengPrefab);
        let c = node.getComponent(MjCardGroup);
        if (c) {
          c.setup(CardGroupType.Peng, cardId, dir, dir);  // 丢失来源方位。
        }
      }
    }
  }

  /**
   * 暗杠。
   * @param cardId 牌。
   * @param dir 即是执行补杠的玩家所在的方位，也是来源方位。
   */
  anGang(cardId: CardId, dir: Direction) {

    // 添加牌组。
    if (this.cardGroupsNode && this.anGangPrefab) {
      let node = cc.instantiate(this.anGangPrefab);
      let c = node.getComponent(MjCardGroup);
      if (c) {
        c.setup(CardGroupType.Gang, cardId, dir, dir);
      }
      this.cardGroupsNode.addChild(node);
    }

    // 从手牌中移除4张。
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
    if (!this.removeHandCard()) {
      cc.warn('no card');
    }
  }
}
