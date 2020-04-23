import uiTools from '../../model/ui/tools';
import MjCard from './mjCard';
import cache from '../../model/cache';
import { CardId, Direction, CardGroupType, CardGroup, fromDirChar, HuType, GangType, CardType, HuForm } from '../../model/game/concept';
import MjCardGroup from './mjCardGroup';
import { CardGroupData } from '../../model/game/msgs/game-info';
import { ShowOption } from './mjPengGangHuGuoUi';
import { checkHuForm } from '../../model/game/hu-detection';
import { CardTingInfo } from './mjTingUi';

const { ccclass, property } = cc._decorator;

/**
 * 我的牌的控制器（用于控制选牌、出牌、碰、杠等行为）。
 */
@ccclass
export default class MjMyCardsController extends cc.Component {

  /**
   * 手牌容器节点。
   */
  @property(cc.Node)
  handCardsNode: cc.Node = null;

  /**
   * 抽牌。
   */
  @property(MjCard)
  drawCard: MjCard = null;

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
   * 定缺的类型。
   */
  private _skipType?: CardType;

  /**
   * 当前选择的牌。
   */
  private _selCard: MjCard = null;

  /**
   * 当前选择的牌的原始Y坐标。
   */
  private _selCardY = 0;

  /**
   * 是否允许点选牌。
   */
  private _enableSelect = false;

  /**
   * 是否允许出牌。
   */
  private _enableDiscard = false;

  /**
   * 是否正在出牌（已向服务端提交出牌请求，并且得到了服务端的认可，并且正在等待服务端的出牌通知）。
   * 此值为true时，_selCard为要出的牌。
   */
  private _discarding = false;

  /**
   * 定缺类型只读属性。
   */
  get skipType(): CardType | undefined {
    return this._skipType;
  }

  onLoad() {

    // 牌按下处理。
    this.node.on('pressed', this._onCardPressed.bind(this));
  }

  /**
   * 设置定缺的类型。
   * @param type 定缺的类型。
   */
  setSkipType(type: CardType) {
    if (this._skipType !== type) {
      this._skipType = type;
      if (this.handCardsNode) {
        for (let node of this.handCardsNode.children) {
          let c = node.getComponent(MjCard);
          if (c) {
            c.setDarken(this._needDarken(c.cardId));
          }
        }
      }
      if (this.drawCard && this.drawCard.node.active) {
        this.drawCard.setDarken(this._needDarken(this.drawCard.cardId));
      }
    }
  }

  /**
   * 牌点击处理。
   * @param evn 事件。
   */
  private _onCardPressed(evn: cc.Event) {
    evn.stopPropagation();
    if (this._enableSelect && !this._discarding) {
      let card: MjCard = uiTools.getEventUserData(evn);

      // 如果用户选择的卡牌再次点选，那么意味着出牌，否则切换点选。
      if (this._selCard === card) {

        // 仅当允许出牌才执行。
        if (this._enableDiscard) {

          // 出牌。
          this._discarding = true;
          cache.cmd.execCmd(`${cache.route}:game/discard`, {
            roomId: cache.roomId,
            cardId: card.cardId
          }).then((res) => {
            if (res.err !== undefined) {
              cc.warn(`res.err is: ${res.err}`);

              // 服务器没有认可，因此取消出牌中的状态。
              this._discarding = false;

              if (res.err === 2 || res.err === 3) {
                uiTools.fireEvent(this.node, 'notFoundRoom', undefined, true);
              }
            }
          }).catch((err) => {
            cc.error(err);

            // 请求失败了，因此取消出牌中的状态。
            this._discarding = false;

            uiTools.toast('出牌失败');
          });
        }
      } else {

        // 取消之前选择的卡牌的抬高。
        if (this._selCard) {
          this._selCard.node.y = this._selCardY;
        }

        // 更换选择。
        this._selCard = card;
        this._selCardY = card.node.y;

        // 抬高1/3。
        card.node.y += card.node.height / 3;
      }
    }
  }

  /**
   * 允许点选牌。
   */
  enableSelect() {
    this._enableSelect = true;
  }

  /**
   * 禁止点选牌。
   */
  disableSelect() {
    this._enableSelect = false;
  }

  /**
   * 取消已选择的卡（让其取消抬高）。
   */
  cancelSelection() {
    if (this._selCard) {
      this._selCard.node.y = this._selCardY;
      this._selCard = null;
      this._selCardY = 0;
    }
  }

  /**
   * 允许出牌。
   */
  enableDiscard() {
    this._enableDiscard = true;
  }

  /**
   * 禁止出牌。
   */
  disableDiscard() {
    this._enableDiscard = false;
  }

  /**
   * 初始化牌组。
   * @param myDir 我所在的方位。
   * @param groups 牌组数组。
   */
  initCardGroups(myDir: Direction, groups: CardGroupData[]) {
    if (this.cardGroupsNode) {
      for (let g of groups) {
        if (g.type === 'peng') {
          if (this.pengPrefab) {
            let node = cc.instantiate(this.pengPrefab);
            let c = node.getComponent(MjCardGroup);
            if (c) {
              c.setup(CardGroupType.Peng, g.card, myDir, fromDirChar(g.dir));
            }
            this.cardGroupsNode.addChild(node);
          }
        } else if (g.type === 'gang') {
          if (g.open) {
            if (this.mingGangPrefab) {
              let node = cc.instantiate(this.mingGangPrefab);
              let c = node.getComponent(MjCardGroup);
              if (c) {
                c.setup(CardGroupType.Gang, g.card, myDir, fromDirChar(g.dir));
              }
              this.cardGroupsNode.addChild(node);
            }
          } else {
            if (this.anGangPrefab) {
              let node = cc.instantiate(this.anGangPrefab);
              let c = node.getComponent(MjCardGroup);
              if (c) {
                c.setup(CardGroupType.Gang, g.card, myDir, fromDirChar(g.dir));
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
   * 初始化手牌数组，如果给定的手牌是乱序的，会先排序。
   * @param hands 手牌数组，可以是乱序的。
   */
  initHandCards(hands: CardId[]) {
    if (this.handCardsNode && this.handCardPrefab) {

      // 排序。
      let myCards = hands.slice();
      myCards.sort((a, b) => {
        return a - b;
      });

      for (let card of myCards) {
        let node = cc.instantiate(this.handCardPrefab);
        let c = node.getComponent(MjCard);
        if (c) {
          c.setup(card, this._needDarken(card));
        }
        this.handCardsNode.addChild(node);
      }
    }
  }

  /**
   * 添加一张手牌，不排序，总是插入尾部。
   * @param cardId 牌。
   */
  addHandCard(cardId: CardId) {
    if (this.handCardsNode && this.handCardPrefab) {
      let node = cc.instantiate(this.handCardPrefab);
      let c = node.getComponent(MjCard);
      if (c) {
        c.setup(cardId, this._needDarken(cardId));
      }
      this.handCardsNode.addChild(node);
    }
  }

  /**
   * 添加一张手牌，会按照万、锁、筒的升序顺序插入相应的位置。
   * @param cardId 牌。
   */
  insertHandCard(cardId: CardId) {
    if (this.handCardsNode && this.handCardPrefab) {
      let node = cc.instantiate(this.handCardPrefab);
      let c = node.getComponent(MjCard);
      if (c) {
        c.setup(cardId, this._needDarken(cardId));
      }

      // 插入。
      for (let n = 0; n < this.handCardsNode.childrenCount; ++n) {
        let child = this.handCardsNode.children[n];
        let c = child.getComponent(MjCard);
        if (c) {
          if (cardId <= c.cardId) {
            this.handCardsNode.insertChild(node, child.getSiblingIndex());
            return;
          }
        }
      }
      this.handCardsNode.addChild(node);
    }
  }

  /**
   * 判定指定的牌是否需要变暗显示。
   * @param cardId 牌。
   */
  private _needDarken(cardId: CardId) {
    if (this._skipType === CardType.Wan) {
      if (cardId >= CardId.Wan1 && cardId <= CardId.Wan9) {
        return true;
      }
    } else if (this._skipType === CardType.Suo) {
      if (cardId >= CardId.Suo1 && cardId <= CardId.Suo9) {
        return true;
      }
    } else if (this._skipType === CardType.Tong) {
      if (cardId >= CardId.Tong1 && cardId <= CardId.Tong9) {
        return true;
      }
    }
    return false;
  }

  /**
   * 设置抽牌。
   * @param cardId 牌。
   */
  setDrawCard(cardId: CardId) {
    if (this.drawCard) {
      this.drawCard.node.active = true;
      this.drawCard.setup(cardId, this._needDarken(cardId));
    }
  }

  /**
   * 获取我的手牌。
   * @param includeDraw 是否包含抽牌。
   */
  getHandCards(includeDraw: boolean): CardId[] {
    let cardIds: CardId[] = [];
    if (this.handCardsNode) {
      for (let x of this.handCardsNode.children) {
        let card = x.getComponent(MjCard);
        if (card) {
          cardIds.push(card.cardId);
        }
      }
    }
    if (includeDraw && this.drawCard && this.drawCard.node.active) {
      cardIds.push(this.drawCard.cardId);
    }
    return cardIds;
  }

  /**
   * 获取我的牌组。
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
   * 清空。
   */
  clear() {
    if (this.handCardsNode) {
      this.handCardsNode.removeAllChildren(true);
      this.handCardsNode.width = 0;
    }
    this.removeDrawCard();
    if (this.cardGroupsNode) {
      this.cardGroupsNode.removeAllChildren(true);
      this.cardGroupsNode.width = 0;
    }
    this.cancelSelection();
    this.disableSelect();
    this.disableDiscard();
    this._skipType = undefined;
  }

  /**
   * 判定指定的牌是否为定缺的牌。
   * @param cardId 牌。
   */
  isSkipCard(cardId: CardId): boolean {
    if (this._skipType === CardType.Wan) {
      if (cardId >= CardId.Wan1 && cardId <= CardId.Wan9) {
        return true;
      }
    } else if (this._skipType === CardType.Suo) {
      if (cardId >= CardId.Suo1 && cardId <= CardId.Suo9) {
        return true;
      }
    } else if (this._skipType === CardType.Tong) {
      if (cardId >= CardId.Tong1 && cardId <= CardId.Tong9) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判定手上是否存在定缺的牌。
   */
  existsSkipCard(): boolean {
    if (this._skipType !== undefined) {
      let cardIds = this.getHandCards(true);
      for (let cardId of cardIds) {
        if (this.isSkipCard(cardId)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 从手牌中移除指定的牌，返回是否成功移除。
   * @param cardId 要移除的牌。
   */
  removeHandCard(cardId: CardId): boolean {
    if (this.handCardsNode) {
      for (let x of this.handCardsNode.children) {
        let c = x.getComponent(MjCard);
        if (c && c.cardId === cardId) {
          x.removeFromParent(true);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 移除抽牌，返回是否成功移除。
   * @param cardId 要移除的牌，undefined时表示任何牌都行。
   */
  removeDrawCard(cardId?: CardId): boolean {
    if (cardId !== undefined) {
      if (this.drawCard && this.drawCard.node.active && this.drawCard.cardId === cardId) {
        this.drawCard.node.active = false;
        return true;
      }
    } else {
      if (this.drawCard && this.drawCard.node.active) {
        this.drawCard.node.active = false;
        return true;
      }
    }
    return false;
  }

  /**
   * 判定是否有抽牌存在。
   */
  existsDrawCard() {
    return this.drawCard && this.drawCard.node.active;
  }

  /**
   * 将抽牌移动到手牌中。
   */
  moveDrawCardToHands() {
    if (this.existsDrawCard()) {
      this.insertHandCard(this.drawCard.cardId);
      this.removeDrawCard();
    }
  }

  /**
   * 计算出牌后的显示选项（碰、杠、胡、过）。
   * @param cardId 出的牌。
   * @param cardsLeft 牌墙剩余的牌数。
   */
  calcShowOptionOnDiscard(cardId: CardId, cardsLeft: number): ShowOption | undefined {

    // 如果出的牌是我定缺的牌，那么不可能需要弹出UI。
    if (this.isSkipCard(cardId)) {
      return undefined;
    }

    // 准备。
    let option: ShowOption = {
      peng: false,
      gang: [],
      huType: HuType.None,
      sendPass: true
    };
    let cardGroups = this.getCardGroups();
    let cards = this.getHandCards(true);

    // 检测是否有明杠或碰。
    let matchCount = 0;
    for (let c of cards) {
      if (c === cardId) {
        matchCount++;
      }
    }
    if (matchCount >= 2) {
      option.peng = true;
    }
    if (cardsLeft > 0) {  // 牌墙还有牌时才允许杠。
      if (matchCount === 3) {
        option.gang.push({
          cardId,
          type: GangType.Ming
        });
      }
    }

    // 检测是否有点炮胡。
    if (!this.existsSkipCard()) {
      cards.push(cardId);
      if (checkHuForm(false, false, cards, cardGroups) !== undefined) {
        option.huType = HuType.DianPao;
        cc.log(cards);
      }
    }

    // 如果没有碰、杠也没有胡，那么不需要显示。
    if (!option.peng && option.gang.length === 0 && option.huType === HuType.None) {
      return undefined;
    }

    return option;
  }

  /**
   * 计算补杠后的显示选项（胡、过）。
   * @param cardId 补杠的牌。
   */
  calcShowOptionOnBuGang(cardId: CardId): ShowOption | undefined {

    // 如果补杠的牌是我定缺的牌，那么不可能需要弹出UI。
    if (this.isSkipCard(cardId)) {
      return undefined;
    }

    // 检测胡。
    if (!this.existsSkipCard()) {
      let option: ShowOption = {
        peng: false,
        gang: [],
        huType: HuType.None,
        sendPass: true
      };
      let cardGroups = this.getCardGroups();
      let cards = this.getHandCards(false);
      if (checkHuForm(false, false, cards, cardGroups) !== undefined) {
        option.huType = HuType.QiangGang;
        return option;
      }
    }

    return undefined;
  }

  /**
   * 计算抽牌后的显示选项（杠、胡、过）。
   * @param cardsLeft 牌墙剩余的牌数。
   */
  calcShowOptionOnDraw(cardsLeft: number): ShowOption | undefined {
    if (!this.existsDrawCard()) {
      return undefined;
    }

    // 准备。
    let option: ShowOption = {
      peng: false,
      gang: [],
      huType: HuType.None,
      sendPass: false
    };
    let cardGroups = this.getCardGroups();
    let cards = this.getHandCards(true);

    // 牌墙还有牌的时候才需要计算杠。
    if (cardsLeft > 0) {

      // 统计所有非定缺手牌的数量。
      let cardCount: { [card: number]: number } = {};
      for (let c of cards) {
        if (this.isSkipCard(c)) {
          continue;
        }
        let count = cardCount[c];
        if (count === undefined) {
          cardCount[c] = 1;
        } else {
          cardCount[c]++;
        }
      }

      // 收集所有暗杠的牌。
      let anGangs: CardId[] = [];
      for (let card in cardCount) {
        let count = cardCount[card];
        if (count === 4) {
          anGangs.push(+card);
        }
      }

      // 检测是否有补杠（补杠必须来自于抽牌）。
      let includeBuGang = false;
      for (let cg of cardGroups) {
        if (cg.t === 'peng') {
          if (cg.cardId === this.drawCard.cardId) {

            // 这里不需要验证是否是定缺的牌，因为存在碰必定不是定缺的牌。
            includeBuGang = true;
            break;
          }
        }
      }

      // 生成杠选项。
      for (let card of anGangs) {
        option.gang.push({
          cardId: card,
          type: GangType.An
        });
      }
      if (includeBuGang) {
        option.gang.push({
          cardId: this.drawCard.cardId,
          type: GangType.Bu
        });
      }
    }

    // 检测是否有自摸胡，首先手牌和抽牌中不能存在定缺的牌才有可能胡。
    let enableHu = true;
    for (let c of cards) {
      if (this.isSkipCard(c)) {
        enableHu = false;
        break;
      }
    }
    if (enableHu && checkHuForm(false, false, cards, cardGroups) !== undefined) {
      option.huType = HuType.ZiMo
    }

    // 如果没有杠也没有胡，那么不需要显示。
    if (option.gang.length === 0 && option.huType === HuType.None) {
      return undefined;
    }

    return option;
  }

  /**
   * 计算听。
   * @param cardCounts 已出牌或牌组中持有的牌的数量。
   * @param firstDraw 是否首抽。
   * @param isBanker 是否庄家。
   */
  calcTing(cardCounts: { [cardId: number]: number }, firstDraw: boolean, isBanker: boolean): CardTingInfo[] {
    let tingInfos: CardTingInfo[] = [];

    // 手牌中存在缺牌类型的牌则不可能听。
    let cards = this.getHandCards(false);
    for (let c of cards) {
      if (this.isSkipCard(c)) {
        return tingInfos;
      }
    }

    // 获取牌组。
    let cardGroups = this.getCardGroups();

    // 枚举所有的牌，计算其与现有牌是否能组成胡。
    for (let cardId in cardCounts) {
      let checkCardId = +cardId;
      if (this._skipType === CardType.Wan) {
        if (checkCardId >= CardId.Wan1 && checkCardId <= CardId.Wan9) {
          continue;
        }
      } else if (this._skipType === CardType.Suo) {
        if (checkCardId >= CardId.Suo1 && checkCardId <= CardId.Suo9) {
          continue;
        }
      } else if (this._skipType === CardType.Tong) {
        if (checkCardId >= CardId.Tong1 && checkCardId <= CardId.Tong9) {
          continue;
        }
      }
      let count = cardCounts[cardId];

      // 检测该牌是否可胡。
      let cs = cards.slice();
      cs.push(checkCardId);
      let huForm = checkHuForm(firstDraw, isBanker, cs, cardGroups);
      if (huForm !== undefined) {
        let fan = 0;
        switch (huForm) {
          case HuForm.Ping:
            fan = 1;
            break;
          case HuForm.PengPeng:
            fan = 4;
            break;
          case HuForm.QingYiSe:
            fan = 4;
            break;
          case HuForm.QiDui:
            fan = 4;
            break;
          case HuForm.JinGouDiao:
            fan = 4;
            break;
          case HuForm.QingPengPeng:
            fan = 8;
            break;
          case HuForm.LongQiDui:
            fan = 8;
            break;
          case HuForm.QingQiDui:
            fan = 16;
            break;
          case HuForm.QingJinGouDiao:
            fan = 16;
            break;
          case HuForm.Tian:
            fan = 64;
            break;
          case HuForm.Di:
            fan = 32;
            break;
          case HuForm.QingLongQiDui:
            fan = 32;
            break;
          case HuForm.ShiBaLuoHan:
            fan = 64;
            break;
          case HuForm.QingShiBaLuoHan:
            fan = 256;
            break;
        }
        tingInfos.push({
          cardId: checkCardId,
          fan,
          left: 4 - count
        });
      }
    }

    return tingInfos;
  }

  /**
   * 碰。
   * @param cardId 牌。
   * @param myDir 我所在的方位。
   * @param fromDir 来源方位。
   */
  peng(cardId: CardId, myDir: Direction, fromDir: Direction) {

    // 添加牌组。
    if (this.cardGroupsNode && this.pengPrefab) {
      let node = cc.instantiate(this.pengPrefab);
      let c = node.getComponent(MjCardGroup);
      if (c) {
        c.setup(CardGroupType.Peng, cardId, myDir, fromDir);
      }
      this.cardGroupsNode.addChild(node);
    }

    // 从手牌中移除2张同名牌。
    if (!this.removeHandCard(cardId)) {
      cc.warn('not found card');
    }
    if (!this.removeHandCard(cardId)) {
      cc.warn('not found card');
    }
  }

  /**
   * 明杠。
   * @param cardId 牌。
   * @param myDir 我所在的方位。
   * @param fromDir 来源方位。
   */
  mingGang(cardId: CardId, myDir: Direction, fromDir: Direction) {

    // 添加牌组。
    if (this.cardGroupsNode && this.mingGangPrefab) {
      let node = cc.instantiate(this.mingGangPrefab);
      let c = node.getComponent(MjCardGroup);
      if (c) {
        c.setup(CardGroupType.Gang, cardId, myDir, fromDir);
      }
      this.cardGroupsNode.addChild(node);
    }

    // 从手牌中移除3张同名牌。
    if (!this.removeHandCard(cardId)) {
      cc.warn('not found card');
    }
    if (!this.removeHandCard(cardId)) {
      cc.warn('not found card');
    }
    if (!this.removeHandCard(cardId)) {
      cc.warn('not found card');
    }
  }

  /**
   * 补杠。
   * @param cardId 牌。
   * @param dir 即是我所在的方位，也是来源方位。
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

    // 移除抽牌。
    if (!this.removeDrawCard(cardId)) {
      cc.warn('card mismatch');
    }
  }

  /**
   * 补杠回退（即被抢杠胡了），目前会丢失来源方向。
   * @param cardId 牌。
   * @param dir 我所在的方位。
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
   * @param dir 即是我所在的方位，也是来源方位。
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

    // 从抽牌、手牌中移除4张同名牌。
    if (this.removeDrawCard(cardId)) {
      if (!this.removeHandCard(cardId)) {
        cc.warn('not found card');
      }
      if (!this.removeHandCard(cardId)) {
        cc.warn('not found card');
      }
      if (!this.removeHandCard(cardId)) {
        cc.warn('not found card');
      }
    } else {
      if (!this.removeHandCard(cardId)) {
        cc.warn('not found card');
      }
      if (!this.removeHandCard(cardId)) {
        cc.warn('not found card');
      }
      if (!this.removeHandCard(cardId)) {
        cc.warn('not found card');
      }
      if (!this.removeHandCard(cardId)) {
        cc.warn('not found card');
      }

      // 将抽牌移动到手牌中。
      this.moveDrawCardToHands();
    }
  }

  /**
   * 完成出牌。
   * @param node 参考节点（返回的坐标相对于此节点）。
   */
  finishDiscard(node: cc.Node): cc.Vec3 | undefined {
    if (!this._discarding) {
      return undefined;
    }
    this._discarding = false;
    this._enableDiscard = false;
    let card = this._selCard;  // 因为在请求期间不能点击其他牌，所以此时_selCard就是那张要打出的牌。
    this._selCard = null;

    // 优先尝试移除抽牌。
    if (card === this.drawCard) {

      // 根据锚点的不同，计算中心的坐标（本地坐标）。
      let fromX = 0;
      let fromY = 0;
      if (card.node.anchorX === 0) {
        fromX = card.node.width / 2;
      } else if (card.node.anchorX === 1) {
        fromX = -card.node.width / 2;
      }
      if (card.node.anchorY === 0) {
        fromY = card.node.height / 2;
      } else if (card.node.anchorY === 1) {
        fromY = -card.node.height / 2;
      }

      // 向上偏移半个牌的高度。
      fromY += card.node.height / 2;

      let worldPos = card.node.convertToWorldSpaceAR(cc.v3(fromX, fromY, 0));
      card.node.y = this._selCardY;
      this.removeDrawCard();
      return node.convertToNodeSpaceAR(worldPos);
    }

    // 从手牌中移除。
    let fromX = 0;
    let fromY = 0;
    if (card.node.anchorX === 0) {
      fromX = card.node.width / 2;
    } else if (card.node.anchorX === 1) {
      fromX = -card.node.width / 2;
    }
    if (card.node.anchorY === 0) {
      fromY = card.node.width / 2;
    } else if (card.node.anchorY === 1) {
      fromY = -card.node.width / 2;
    }
    let worldPos = card.node.convertToWorldSpaceAR(cc.v3(fromX, fromY, 0));
    let pos = node.convertToNodeSpaceAR(worldPos);
    card.node.removeFromParent(true);

    // 如果有抽牌（当自己碰的时候是不会有抽牌的），那么应该将抽牌移动到手牌中。
    if (this.existsDrawCard()) {
      this.insertHandCard(this.drawCard.cardId);
      this.removeDrawCard();
    }

    return pos;
  }
}