import uiTools from '../model/ui/tools';
import cache from '../model/cache';
import MjUser from './game/mjUser';
import MjCenterIndicator from './game/mjCenterIndicator';
import { GameInfo, PendingAction, ResultClientInfo, HuaZhuClientInfo } from '../model/game/msgs/game-info';
import { Direction, ScreenDirection, CardId, CardType, fromDirChar, HuTitle, HuForm, toHuFormName, toHuTitleName, toScreenDirNameOfMe } from '../model/game/concept';
import { StartDealNotify, StartSkipOneNotify, StartPlayNotify, DiscardNotify, DrawFrontNotify, DrawBackNotify, PengNotify, MingGangNotify, BuGangNotify, AnGangNotify, FinishInningNotify, KeepAliveNotify } from '../model/game/msgs/common';
import MjMyCardsController from './game/mjMyCardsController';
import MjPengGangHuGuoUi from './game/mjPengGangHuGuoUi';
import MjOtherCardsController from './game/mjOtherCardsController';
import MjDiscardArea from './game/mjDiscardArea';
import MjTingUi, { CardTingInfo } from './game/mjTingUi';
import MjCard from './game/mjCard';
import { PlayerResultInfo } from '../model/game/other-structs';
import InningResult from './inningResult';
import MjSkipOneUi from './game/mjSkipOneUi';

const { ccclass, property } = cc._decorator;

/**
 * 游戏（桌面）。
 */
@ccclass
export default class Game extends cc.Component {

  /**
   * 当前对局数文本框。
   */
  @property(cc.Label)
  currInningLabel: cc.Label = null;

  /**
   * 总对局数文本框。
   */
  @property(cc.Label)
  totalInningLabel: cc.Label = null;

  /**
   * 基准分文本框。
   */
  @property(cc.Label)
  baseScoreLabel: cc.Label = null;

  /**
   * 根节点。
   */
  @property(cc.Node)
  rootNode: cc.Node = null;

  /**
   * 我的出牌区域。
   */
  @property(MjDiscardArea)
  myDiscardArea: MjDiscardArea = null;

  /**
   * 上方玩家的出牌区域。
   */
  @property(MjDiscardArea)
  topDiscardArea: MjDiscardArea = null;

  /**
   * 左侧玩家的出牌区域。
   */
  @property(MjDiscardArea)
  leftDiscardArea: MjDiscardArea = null;

  /**
   * 右侧玩家的出牌区域。
   */
  @property(MjDiscardArea)
  rightDiscardArea: MjDiscardArea = null;

  /**
   * 中间指示器。
   */
  @property(MjCenterIndicator)
  centerIndicator: MjCenterIndicator = null;

  /**
   * 牌墙节点（弱化了的牌墙，仅显示剩余牌数）。
   */
  @property(cc.Node)
  cardWallNode: cc.Node = null;

  /**
   * 剩余牌数文本框。
   */
  @property(cc.Label)
  cardsLeftLabel: cc.Label = null;

  /**
   * 我的牌的控制器。
   */
  @property(MjMyCardsController)
  myCardsController: MjMyCardsController = null;

  /**
   * 上方玩家的牌的控制器。
   */
  @property(MjOtherCardsController)
  topCardsController: MjOtherCardsController = null;

  /**
   * 左侧玩家的牌的控制器。
   */
  @property(MjOtherCardsController)
  leftCardsController: MjOtherCardsController = null;

  /**
   * 右侧玩家的牌的控制器。
   */
  @property(MjOtherCardsController)
  rightCardsController: MjOtherCardsController = null;

  /**
   * 我的胡牌。
   */
  @property(MjCard)
  myHuCard: MjCard = null;

  /**
   * 上方玩家的胡牌。
   */
  @property(MjCard)
  topHuCard: MjCard = null;

  /**
   * 左侧玩家的胡牌。
   */
  @property(MjCard)
  leftHuCard: MjCard = null;

  /**
   * 右侧玩家的胡牌。
   */
  @property(MjCard)
  rightHuCard: MjCard = null;

  /**
   * 我胡的特效。
   */
  @property(cc.Animation)
  myHuAnim: cc.Animation = null;

  /**
   * 上方玩家胡的特效。
   */
  @property(cc.Animation)
  topHuAnim: cc.Animation = null;

  /**
   * 左边玩家胡的特效。
   */
  @property(cc.Animation)
  leftHuAnim: cc.Animation = null;

  /**
   * 右边玩家胡的特效。
   */
  @property(cc.Animation)
  rightHuAnim: cc.Animation = null;

  /**
   * 听按钮节点。
   */
  @property(cc.Node)
  tingNode: cc.Node = null;

  /**
   * 我的信息。
   */
  @property(MjUser)
  myInfo: MjUser = null;

  /**
   * 左测的用户信息。
   */
  @property(MjUser)
  leftInfo: MjUser = null;

  /**
   * 右侧的用户信息。
   */
  @property(MjUser)
  rightInfo: MjUser = null;

  /**
   * 顶部的用户信息。
   */
  @property(MjUser)
  topInfo: MjUser = null;

  /**
   * 定缺UI。
   */
  @property(MjSkipOneUi)
  skipOneUi: MjSkipOneUi = null;

  /**
   * 单行听UI。
   */
  @property(MjTingUi)
  singleLineTingUi: MjTingUi = null;

  /**
   * 两行听UI。
   */
  @property(MjTingUi)
  twoLineTingUi: MjTingUi = null;

  /**
   * 三行听UI。
   */
  @property(MjTingUi)
  threeLineTingUi: MjTingUi = null;

  /**
   * 碰、杠、胡、过UI。
   */
  @property(MjPengGangHuGuoUi)
  pengGangHuGuoUi: MjPengGangHuGuoUi = null;

  private _newClientNotifyHandler = this._onNewClient.bind(this);
  private _queryNotifyHandler = this._onQueryNotify.bind(this);
  private _startDealNotifyHandler = this._onStartDealNotify.bind(this);
  private _startSkipOneNotifyHandler = this._onStartSkipOneNotify.bind(this);
  private _startPlayNotifyHandler = this._onStartPlayNotify.bind(this);
  private _discardNotifyHandler = this._onDiscardNotify.bind(this);
  private _drawFrontNotifyHandler = this._onDrawFrontNotify.bind(this);
  private _drawBackNotifyHandler = this._onDrawBackNotify.bind(this);
  private _pengNotifyHandler = this._onPengNotify.bind(this);
  private _mingGangNotifyHandler = this._onMingGangNotify.bind(this);
  private _buGangNotifyHandler = this._onBuGangNotify.bind(this);
  private _anGangNotifyHandler = this._onAnGangNotify.bind(this);
  private _finishInningNotifyHandler = this._onFinishInningNotify.bind(this);
  private _keepAliveNotifyHandler = this._onKeepAliveNotify.bind(this);

  /**
   * 是否已销毁。
   */
  private _destroyed = false;

  /**
   * 我的方位。
   */
  private _myDir = Direction.East + 10;

  /**
   * 庄家的方位。
   */
  private _bankerDir = Direction.East;

  /**
   * 牌墙剩余的牌数，仅当打牌期间有意义。
   */
  private _numCardsLeft = 0;

  /**
   * 是否接受查询通知。
   */
  private _acceptQueryNotify = false;

  /**
   * 是否中途断线重连后的查询。
   */
  private _queryOnReconnect = false;

  /**
   * 听信息集。
   */
  private _tingInfos: CardTingInfo[] = [];

  /**
   * 结算通知（作为结算界面的数据源）。
   */
  private _finishInningNotify?: FinishInningNotify;

  /**
   * 对局结算界面节点（打开结算界面时记录下来，在开始下一局时关掉）。
   */
  private _inningResultNode?: cc.Node;

  /**
   * 缺牌提示的次数。
   */
  private _skipTipTimes = 0;

  /**
   * 是否已开始保活。
   */
  private _keepAliveRunning = false;

  onLoad() {
    if (this.rootNode) {
      let size = cc.view.getVisibleSize();
      cc.log(size);
      if (size.height < 1280) {
        if (size.height < 630) {
          this.rootNode.height = 630;
        } else {
          this.rootNode.height = size.height;
        }
      }
    }
    this.node.on('notFoundRoom', (evn: cc.Event) => {
      evn.stopPropagation();
      this._enterHall();
    });
    cache.otherEvent.on('newClient', this._newClientNotifyHandler);
    cache.notifyEvent.on('game/queryNotify', this._queryNotifyHandler);
    cache.notifyEvent.on('game/startDealNotify', this._startDealNotifyHandler);
    cache.notifyEvent.on('game/startSkipOneNotify', this._startSkipOneNotifyHandler);
    cache.notifyEvent.on('game/startPlayNotify', this._startPlayNotifyHandler);
    cache.notifyEvent.on('game/discardNotify', this._discardNotifyHandler);
    cache.notifyEvent.on('game/drawFrontNotify', this._drawFrontNotifyHandler);
    cache.notifyEvent.on('game/drawBackNotify', this._drawBackNotifyHandler);
    cache.notifyEvent.on('game/pengNotify', this._pengNotifyHandler);
    cache.notifyEvent.on('game/mingGangNotify', this._mingGangNotifyHandler);
    cache.notifyEvent.on('game/buGangNotify', this._buGangNotifyHandler);
    cache.notifyEvent.on('game/anGangNotify', this._anGangNotifyHandler);
    cache.notifyEvent.on('game/finishInningNotify', this._finishInningNotifyHandler);
    cache.notifyEvent.on('game/keepAliveNotify', this._keepAliveNotifyHandler);
    this._sendQueryGame();
  }

  onDestroy() {
    this._destroyed = true;
    cache.otherEvent.off('newClient', this._newClientNotifyHandler);
    cache.notifyEvent.off('game/queryNotify', this._queryNotifyHandler);
    cache.notifyEvent.off('game/startDealNotify', this._startDealNotifyHandler);
    cache.notifyEvent.off('game/startSkipOneNotify', this._startSkipOneNotifyHandler);
    cache.notifyEvent.off('game/startPlayNotify', this._startPlayNotifyHandler);
    cache.notifyEvent.off('game/discardNotify', this._discardNotifyHandler);
    cache.notifyEvent.off('game/drawFrontNotify', this._drawFrontNotifyHandler);
    cache.notifyEvent.off('game/drawBackNotify', this._drawBackNotifyHandler);
    cache.notifyEvent.off('game/pengNotify', this._pengNotifyHandler);
    cache.notifyEvent.off('game/mingGangNotify', this._mingGangNotifyHandler);
    cache.notifyEvent.off('game/buGangNotify', this._buGangNotifyHandler);
    cache.notifyEvent.off('game/anGangNotify', this._anGangNotifyHandler);
    cache.notifyEvent.off('game/finishInningNotify', this._finishInningNotifyHandler);
    cache.notifyEvent.off('game/keepAliveNotify', this._keepAliveNotifyHandler);
  }

  /**
   * 进入大厅。
   */
  private async _enterHall() {
    try {
      await uiTools.openWindow('prefab/hall');
    } catch (err) {
      cc.error(err);
    }
    uiTools.closeWindow(this.node);
  }

  /**
   * 发送查询游戏状态。
   */
  private async _sendQueryGame() {
    this._acceptQueryNotify = true;
    try {
      var res = await cache.cmd.execCmd(`${cache.route}:game/query`, {
        roomId: cache.roomId
      });
    } catch (err) {
      this._acceptQueryNotify = false;
      cc.error(err);
      uiTools.toast('请求数据失败');
      return;
    }
    if (res.err !== undefined) {
      this._acceptQueryNotify = false;
      let tips = {
        1: '参数错误',
        2: '指定的房间不存在',
        3: '玩家不在房间内'
      };
      let tip = tips[res.err];
      if (tip === undefined) {
        tip = '未知错误';
      }
      uiTools.toast(tip);

      //TODO 如果是2，那么需要与服务器协商关闭自己所在的房间。
    }
  }

  /**
   * 发送就绪。
   */
  private async _sendSetReady() {
    try {
      var res = await cache.cmd.execCmd(`${cache.route}:game/setReady`, {
        roomId: cache.roomId
      });
    } catch (err) {
      cc.error(err);
      uiTools.toast('请求失败');
      return;
    }
    if (res.err !== undefined) {
      if (res.err === 2 || res.err === 3) {
        cc.warn(`res.err is: ${res.err}`);
        uiTools.toast('游戏已结束');
        await this._enterHall();
      } else if (res.err === 4 || res.err === 5) {
      } else {
        cc.warn(`res.err is: ${res.err}`);
      }
    }
  }

  /**
   * 发送完成发牌。
   */
  private async _sendFinishDeal() {
    try {
      var res = await cache.cmd.execCmd(`${cache.route}:game/finishDeal`, {
        roomId: cache.roomId
      });
    } catch (err) {
      cc.error(err);
      uiTools.toast('请求失败');
      return;
    }
    if (res.err !== undefined) {
      if (res.err === 2 || res.err === 3) {
        cc.warn(`res.err is: ${res.err}`);
        uiTools.toast('游戏已结束');
        await this._enterHall();
      } else if (res.err === 4 || res.err === 5) {
      } else {
        cc.warn(`res.err is: ${res.err}`);
      }
    }
  }

  /**
   * 转换牌桌方位到屏幕方位。
   * @param dir 要转换的牌桌方位。
   */
  private _toScreenDir(dir: Direction): ScreenDirection {
    switch (this._myDir) {
      case Direction.East:
        switch (dir) {
          case Direction.East:
            return ScreenDirection.Bottom;
          case Direction.North:
            return ScreenDirection.Right;
          case Direction.West:
            return ScreenDirection.Top;
          case Direction.South:
            return ScreenDirection.Left;
          default:
            throw new Error(`unknown dir ${dir}`);
        }
      case Direction.North:
        switch (dir) {
          case Direction.East:
            return ScreenDirection.Left;
          case Direction.North:
            return ScreenDirection.Bottom;
          case Direction.West:
            return ScreenDirection.Right;
          case Direction.South:
            return ScreenDirection.Top;
          default:
            throw new Error(`unknown dir ${dir}`);
        }
      case Direction.West:
        switch (dir) {
          case Direction.East:
            return ScreenDirection.Top;
          case Direction.North:
            return ScreenDirection.Left;
          case Direction.West:
            return ScreenDirection.Bottom;
          case Direction.South:
            return ScreenDirection.Right;
          default:
            throw new Error(`unknown dir ${dir}`);
        }
      case Direction.South:
        switch (dir) {
          case Direction.East:
            return ScreenDirection.Right;
          case Direction.North:
            return ScreenDirection.Top;
          case Direction.West:
            return ScreenDirection.Left;
          case Direction.South:
            return ScreenDirection.Bottom;
          default:
            throw new Error(`unknown dir ${dir}`);
        }
      default:
        throw new Error(`unknown my dir ${this._myDir}`);
    }
  }

  /**
   * 转换屏幕方位到牌桌方位。
   * @param sdir 屏幕方位。
   */
  private _fromScreenDir(sdir: ScreenDirection): Direction {
    switch (sdir) {
      case ScreenDirection.Bottom:
        return this._myDir;
      case ScreenDirection.Top:
        switch (this._myDir) {
          case Direction.East:
            return Direction.West;
          case Direction.North:
            return Direction.South;
          case Direction.West:
            return Direction.East;
          case Direction.South:
            return Direction.North;
          default:
            throw new Error(`unknown dir ${this._myDir}`);
        }
      case ScreenDirection.Left:
        switch (this._myDir) {
          case Direction.East:
            return Direction.South;
          case Direction.North:
            return Direction.East;
          case Direction.West:
            return Direction.North;
          case Direction.South:
            return Direction.West;
          default:
            throw new Error(`unknown dir ${this._myDir}`);
        }
      case ScreenDirection.Right:
        switch (this._myDir) {
          case Direction.East:
            return Direction.North;
          case Direction.North:
            return Direction.West;
          case Direction.West:
            return Direction.South;
          case Direction.South:
            return Direction.East;
          default:
            throw new Error(`unknown dir ${this._myDir}`);
        }
      default:
        throw new Error(`unknown screen dir ${sdir}`);
    }
  }

  /**
   * 根据方位获取用户信息控件。
   * @param dir 方位。
   */
  private _getPlayerInfo(dir: Direction): MjUser | null {
    let sdir = this._toScreenDir(dir);
    switch (sdir) {
      case ScreenDirection.Left:
        return this.leftInfo;
      case ScreenDirection.Top:
        return this.topInfo;
      case ScreenDirection.Right:
        return this.rightInfo;
      case ScreenDirection.Bottom:
        return this.myInfo;
      default:
        throw new Error(`unknown screen dir ${sdir}`);
    }
  }

  /**
   * 根据方位获取出牌区域控件。
   * @param dir 方位。
   */
  private _getDiscardArea(dir: Direction): MjDiscardArea | null {
    let sdir = this._toScreenDir(dir);
    switch (sdir) {
      case ScreenDirection.Left:
        return this.leftDiscardArea;
      case ScreenDirection.Top:
        return this.topDiscardArea;
      case ScreenDirection.Right:
        return this.rightDiscardArea;
      case ScreenDirection.Bottom:
        return this.myDiscardArea;
      default:
        throw new Error(`unknown screen dir ${sdir}`);
    }
  }

  /**
   * 统计已知的牌的数量。
   */
  private _calcCardCount(): { [cardId: number]: number } {
    let cards: CardId[] = [];
    for (let id = CardId.Wan1; id <= CardId.Wan9; ++id) {
      cards.push(id);
    }
    for (let id = CardId.Suo1; id <= CardId.Suo9; ++id) {
      cards.push(id);
    }
    for (let id = CardId.Tong1; id <= CardId.Tong9; ++id) {
      cards.push(id);
    }
    let cardCounts: { [cardId: number]: number } = {};
    for (let id of cards) {
      cardCounts[id] = 0;
    }

    // 从我的手牌和牌组中统计。
    if (this.myCardsController) {
      let cs = this.myCardsController.getHandCards(true);
      for (let id of cs) {
        cardCounts[id]++;
      }
      let cgs = this.myCardsController.getCardGroups();
      for (let cg of cgs) {
        if (cg.t === 'peng') {
          cardCounts[cg.cardId] += 3;
        } else if (cg.t === 'gang') {
          cardCounts[cg.cardId] = 4;
        }
      }
    }

    // 从上方玩家的牌组中统计。
    if (this.topCardsController) {
      let cgs = this.topCardsController.getCardGroups();
      for (let cg of cgs) {
        if (cg.t === 'peng') {
          cardCounts[cg.cardId] += 3;
        } else if (cg.t === 'gang') {
          cardCounts[cg.cardId] = 4;
        }
      }
    }

    // 从左侧玩家的牌组中统计。
    if (this.leftCardsController) {
      let cgs = this.leftCardsController.getCardGroups();
      for (let cg of cgs) {
        if (cg.t === 'peng') {
          cardCounts[cg.cardId] += 3;
        } else if (cg.t === 'gang') {
          cardCounts[cg.cardId] = 4;
        }
      }
    }

    // 从右侧玩家的牌组中统计。
    if (this.rightCardsController) {
      let cgs = this.rightCardsController.getCardGroups();
      for (let cg of cgs) {
        if (cg.t === 'peng') {
          cardCounts[cg.cardId] += 3;
        } else if (cg.t === 'gang') {
          cardCounts[cg.cardId] = 4;
        }
      }
    }

    // 从我的出牌区中统计。
    if (this.myDiscardArea) {
      let cs = this.myDiscardArea.getCards();
      for (let id of cs) {
        cardCounts[id]++;
      }
    }

    // 从上方玩家的出牌区中统计。
    if (this.topDiscardArea) {
      let cs = this.topDiscardArea.getCards();
      for (let id of cs) {
        cardCounts[id]++;
      }
    }

    // 从左侧玩家的出牌区中统计。
    if (this.leftDiscardArea) {
      let cs = this.leftDiscardArea.getCards();
      for (let id of cs) {
        cardCounts[id]++;
      }
    }

    // 从右侧玩家的出牌区中统计。
    if (this.rightDiscardArea) {
      let cs = this.rightDiscardArea.getCards();
      for (let id of cs) {
        cardCounts[id]++;
      }
    }

    return cardCounts;
  }

  /**
   * 更新对局信息。
   * @param currInning 当前局数（基于0）。
   * @param totalInnings 总局数。
   * @param baseScore 基准分。
   */
  private _updateInningInfo(currInning: number, totalInnings: number, baseScore: number) {
    if (this.currInningLabel) {
      this.currInningLabel.string = (currInning + 1).toString();
    }
    if (this.totalInningLabel) {
      this.totalInningLabel.string = totalInnings.toString();
    }
    if (this.baseScoreLabel) {
      this.baseScoreLabel.string = baseScore.toString();
    }
  }

  /**
   * 判定我是否为首抽，如果我的出牌区中没有牌，且所有的玩家的牌组均为空则我是首抽。
   */
  private _isFirstDraw(): boolean {
    if (this.myDiscardArea && !this.myDiscardArea.empty) {
      return false;
    }
    if (this.myCardsController && this.myCardsController.numCardGroups > 0) {
      return false;
    }
    if (this.topCardsController && this.topCardsController.numCardGroups > 0) {
      return false;
    }
    if (this.leftCardsController && this.leftCardsController.numCardGroups > 0) {
      return false;
    }
    if (this.rightCardsController && this.rightCardsController.numCardGroups > 0) {
      return false;
    }
    return true;
  }

  /**
   * 生成指定方位的玩家结算数据。
   * @param res 结果信息。
   * @param sdir 要生成哪个方位的玩家的结果。
   */
  private _makeResultOf(res: ResultClientInfo, sdir: ScreenDirection): PlayerResultInfo {
    let ri: PlayerResultInfo = {
      sdir,
      name: '',
      icon: '',
      score: 0,
      huForm: undefined,
      detail: []
    };
    let userInfo = this._getPlayerInfo(this._fromScreenDir(sdir));
    if (userInfo) {
      ri.name = userInfo.userName;
      ri.icon = userInfo.userIcon;
    }

    // 记录胡的牌型。
    for (let hu of res.huList) {
      if (this._toScreenDir(fromDirChar(hu.dir)) === sdir) {
        ri.huForm = hu.form;
        break;
      }
    }

    // 生成胡的明细。
    let sdirArray = [ScreenDirection.Left, ScreenDirection.Top, ScreenDirection.Right, ScreenDirection.Bottom];
    if (ri.huForm !== undefined) {  // 该玩家胡了。
      for (let hu of res.huList) {
        let sdirOfHu = this._toScreenDir(fromDirChar(hu.dir));
        if (sdirOfHu === sdir) {
          let names: string[] = [];
          if (hu.dianPao === undefined) {  // 自摸的情况。

            // 天胡地胡时不显示称号，其他情况显示称号。
            if (hu.form === HuForm.Tian || hu.form === HuForm.Di) {
              names.push(toHuFormName(hu.form));
            } else {
              for (let t of hu.titles) {
                names.push(toHuTitleName(t));
              }
              names.push(toHuFormName(hu.form));
            }
            if (hu.gen > 0) {
              names.push(`${hu.gen}根`);
            }
            let desc = names.join('*');

            // 自摸的情况需要显示三条记录。
            for (let s of sdirArray) {
              if (s !== sdir) {
                ri.detail.push({
                  dir: `【${toScreenDirNameOfMe(s)}】`,
                  desc,
                  fan: hu.fan * Math.pow(2, hu.gen),
                  score: hu.score
                });
              }
            }

          } else {  // 没有自摸，那么应该是点炮类型的（包含抢杠胡）。
            let sdirOfDianPao = this._toScreenDir(fromDirChar(hu.dianPao.dir));

            // 地胡只显示地胡，其他情况又有很多情况。
            if (hu.form === HuForm.Di) {
              names.push(toHuFormName(hu.form));
            } else {
              if (hu.form !== HuForm.Ping) {  // 平胡的时候只显示“平胡”，其他情况比较复杂。
                if (hu.titles.indexOf(HuTitle.QiangGang) < 0) {  // 非抢杠胡的情况，需要显示“胡”。
                  names.push('胡');
                }
                for (let t of hu.titles) {
                  if (t !== HuTitle.DianPao) {  // 点炮的称号不显示。
                    names.push(toHuTitleName(t));
                  }
                }
              }
              names.push(toHuFormName(hu.form));
            }
            if (hu.gen > 0) {
              names.push(`${hu.gen}根`);
            }
            let desc = names.join('*');
            ri.detail.push({
              dir: `【${toScreenDirNameOfMe(sdirOfDianPao)}】`,
              desc,
              fan: hu.fan * Math.pow(2, hu.gen),
              score: hu.score
            });
          }
        }
      }
    } else if (res.huList.length > 0) {  // 该玩家以外的人胡了，该玩家是否被胡需要分析。
      for (let hu of res.huList) {
        let sdirOfHu = this._toScreenDir(fromDirChar(hu.dir));
        let names: string[] = [];
        if (hu.dianPao) {  // 点炮或抢杠胡。
          let sdirOfDianPao = this._toScreenDir(fromDirChar(hu.dianPao.dir));
          if (sdirOfDianPao === sdir) {  // 是该玩家点炮的。

            // 地胡特殊处理（点炮或抢杠胡时不可能为天胡）。
            if (hu.form === HuForm.Di) {
              names.push(toHuFormName(hu.form));
              if (hu.gen > 0) {
                names.push(`${hu.gen}根`);
              }
              ri.detail.push({
                dir: `【${toScreenDirNameOfMe(sdirOfHu)}】`,
                desc: `被${names.join('*')}`,
                fan: hu.fan * Math.pow(2, hu.gen),
                score: -hu.score
              });
            } else {  // 其他点炮或抢杠胡情况。
              if (hu.titles.indexOf(HuTitle.QiangGang) >= 0) {  // 被抢杠胡的情况。
                names.push(toHuTitleName(HuTitle.QiangGang));
                if (hu.gen > 0) {
                  names.push(`${hu.gen}根`);
                }
                names.push(toHuFormName(hu.form));
                if (hu.gen > 0) {
                  names.push(`${hu.gen}根`);
                }
                ri.detail.push({
                  dir: `【${toScreenDirNameOfMe(sdirOfHu)}】`,
                  desc: `被${names.join('*')}`,
                  fan: hu.fan * Math.pow(2, hu.gen),
                  score: -hu.score
                });
              } else if (hu.titles.indexOf(HuTitle.GangShangPao) >= 0) {  // 杠上炮的情况。
                for (let t of hu.titles) {
                  if (t !== HuTitle.DianPao) {
                    names.push(toHuTitleName(t));
                  }
                }
                names.push(toHuFormName(hu.form));
                if (hu.gen > 0) {
                  names.push(`${hu.gen}根`);
                }
                ri.detail.push({
                  dir: `【${toScreenDirNameOfMe(sdirOfHu)}】`,
                  desc: names.join('*'),
                  fan: hu.fan * Math.pow(2, hu.gen),
                  score: -hu.score
                });
              } else {  // 其他点炮情况。
                for (let t of hu.titles) {
                  names.push(toHuTitleName(t));
                }
                names.push(toHuFormName(hu.form));
                if (hu.gen > 0) {
                  names.push(`${hu.gen}根`);
                }
                ri.detail.push({
                  dir: `【${toScreenDirNameOfMe(sdirOfHu)}】`,
                  desc: names.join('*'),
                  fan: hu.fan * Math.pow(2, hu.gen),
                  score: -hu.score
                });
              }
            }
          }

        } else {  // 应该是该玩家以外的人自摸了。

          // 天胡、地胡一种处理方式，其他的另一种。
          if (hu.form === HuForm.Tian || hu.form === HuForm.Di) {  // 天胡或地胡。
            names.push(toHuFormName(hu.form));
            if (hu.gen > 0) {
              names.push(`${hu.gen}根`);
            }
            ri.detail.push({
              dir: `【${toScreenDirNameOfMe(sdirOfHu)}】`,
              desc: `被${names.join('*')}`,
              fan: hu.fan * Math.pow(2, hu.gen),
              score: -hu.score
            });
          } else {  // 其他自摸情况。
            for (let t of hu.titles) {
              names.push(toHuTitleName(t));
            }
            names.push(toHuFormName(hu.form));
            if (hu.gen > 0) {
              names.push(`${hu.gen}根`);
            }
            ri.detail.push({
              dir: `【${toScreenDirNameOfMe(sdirOfHu)}】`,
              desc: `被${names.join('*')}`,
              fan: hu.fan * Math.pow(2, hu.gen),
              score: -hu.score
            });
          }
        }
      }
    }

    // 生成杠的明细。
    for (let gang of res.gangList) {
      let sdirOfGang = this._toScreenDir(fromDirChar(gang.dir));
      if (sdirOfGang === sdir) {  // 该玩家的杠。
        if (gang.fang) {  // 明杠的情况。
          let sdirOfFang = this._toScreenDir(fromDirChar(gang.fang.dir));
          ri.detail.push({
            dir: `【${toScreenDirNameOfMe(sdirOfFang)}】`,
            desc: '明杠',
            fan: gang.fan,
            score: gang.score
          });
        } else {  // 暗杠或补杠（需要三条记录）。
          for (let s of sdirArray) {
            if (s !== sdir) {
              ri.detail.push({
                dir: `【${toScreenDirNameOfMe(s)}】`,
                desc: gang.type === 'an' ? '暗杠' : '补杠',
                fan: gang.fan,
                score: gang.score
              });
            }
          }
        }
      } else {  // 该玩家以外的人的杠。
        if (gang.fang) {  // 明杠的情况。
          let sdirOfFang = this._toScreenDir(fromDirChar(gang.fang.dir));
          if (sdirOfFang === sdir) {  // 该玩家放的杠。
            ri.detail.push({
              dir: `【${toScreenDirNameOfMe(sdirOfGang)}】`,
              desc: '被明杠',
              fan: gang.fan,
              score: -gang.score
            });
          }
        } else {  // 暗杠或补杠。
          ri.detail.push({
            dir: `【${toScreenDirNameOfMe(sdirOfGang)}】`,
            desc: gang.type === 'an' ? '被暗杠' : '被补杠',
            fan: gang.fan,
            score: -gang.score
          });
        }
      }
    }

    // 生成查花猪明细。
    if (res.huaZhuList) {
      let theHuaZhu: HuaZhuClientInfo | undefined;
      for (let huaZhu of res.huaZhuList) {
        if (this._toScreenDir(fromDirChar(huaZhu.dir)) === sdir) {
          theHuaZhu = huaZhu;
          break;
        }
      }
      if (theHuaZhu) {  // 该玩家是花猪。

        // 收集所有非花猪玩家的屏幕方位。
        let sdirsOfNoneHuaZhu = sdirArray.slice();
        for (let huaZhu of res.huaZhuList) {
          let sdirOfHuaZhu = this._toScreenDir(fromDirChar(huaZhu.dir));
          let idx = sdirsOfNoneHuaZhu.indexOf(sdirOfHuaZhu);
          if (idx >= 0) {
            sdirsOfNoneHuaZhu.splice(idx, 1);
          }
        }

        for (let s of sdirsOfNoneHuaZhu) {
          ri.detail.push({
            dir: `【${toScreenDirNameOfMe(s)}】`,
            desc: '被查花猪',
            fan: theHuaZhu.fan,
            score: theHuaZhu.score
          });
        }

      } else {  // 该玩家不是花猪。
        for (let huaZhu of res.huaZhuList) {
          let sdirOfHuaZhu = this._toScreenDir(fromDirChar(huaZhu.dir));
          ri.detail.push({
            dir: `【${toScreenDirNameOfMe(sdirOfHuaZhu)}】`,
            desc: '查花猪',
            fan: huaZhu.fan,
            score: -huaZhu.score
          });
        }
      }
    }

    // 统计总分。
    for (let x of ri.detail) {
      ri.score += x.score;
    }

    return ri;
  }

  /**
   * 播放胡的特效。
   * @param sdir 屏幕方位。
   */
  private _playHuEffect(sdir: ScreenDirection) {
    let huAnim: cc.Animation | undefined;
    switch (sdir) {
      case ScreenDirection.Bottom:
        huAnim = this.myHuAnim;
        break;
      case ScreenDirection.Top:
        huAnim = this.topHuAnim;
        break;
      case ScreenDirection.Left:
        huAnim = this.leftHuAnim;
        break;
      case ScreenDirection.Right:
        huAnim = this.rightHuAnim;
        break;
    }
    if (huAnim) {
      huAnim.node.active = true;
      huAnim.once('stop', (evn) => {
        huAnim.node.active = false;
      });
      let state = huAnim.play();
      state.repeatCount = 1;
    }
  }

  /**
   * 清理，为下一局做准备。
   */
  private _clearForNextInning() {
    this._skipTipTimes = 0;
    this._numCardsLeft = 0;
    this._tingInfos.length = 0;
    this._finishInningNotify = undefined;

    // 听牌按钮隐藏。
    if (this.tingNode) {
      this.tingNode.active = false;
    }

    // 胡牌清理。
    if (this.myHuCard) {
      this.myHuCard.node.active = false;
    }
    if (this.topHuCard) {
      this.topHuCard.node.active = false;
    }
    if (this.leftHuCard) {
      this.leftHuCard.node.active = false;
    }
    if (this.rightHuCard) {
      this.rightHuCard.node.active = false;
    }
    if (this.myHuAnim) {
      this.myHuAnim.node.active = false;
    }
    if (this.topHuAnim) {
      this.topHuAnim.node.active = false;
    }
    if (this.leftHuAnim) {
      this.leftHuAnim.node.active = false;
    }
    if (this.rightHuAnim) {
      this.rightHuAnim.node.active = false;
    }

    // 手牌清理。
    if (this.myCardsController) {
      this.myCardsController.clear();
    }
    if (this.topCardsController) {
      this.topCardsController.clear();
    }
    if (this.leftCardsController) {
      this.leftCardsController.clear();
    }
    if (this.rightCardsController) {
      this.rightCardsController.clear();
    }

    // 丢牌区域清理。
    if (this.myDiscardArea) {
      this.myDiscardArea.clear();
    }
    if (this.topDiscardArea) {
      this.topDiscardArea.clear();
    }
    if (this.leftDiscardArea) {
      this.leftDiscardArea.clear();
    }
    if (this.rightDiscardArea) {
      this.rightDiscardArea.clear();
    }

    // 剩余牌数界面隐藏。
    if (this.cardWallNode) {
      this.cardWallNode.active = true;
    }

    // 中央指示器重置。
    if (this.centerIndicator) {
      this.centerIndicator.reset();
    }

    // 用户的定缺标志重置。
    if (this.myInfo) {
      this.myInfo.reset();
    }
    if (this.topInfo) {
      this.topInfo.reset();
    }
    if (this.leftInfo) {
      this.leftInfo.reset();
    }
    if (this.rightInfo) {
      this.rightInfo.reset();
    }

    // 关闭对局结算界面。
    if (this._inningResultNode) {
      uiTools.closeWindow(this._inningResultNode);
      this._inningResultNode = undefined;
    }
  }

  private _onNewClient() {
    cc.log('newClient');

    this._acceptQueryNotify = true;
    this._queryOnReconnect = true;
    this._sendQueryGame();
  }

  private _onQueryNotify(gi: GameInfo) {
    cc.log('queryNotify');
    cc.log(gi);

    if (!this._acceptQueryNotify) {
      return;
    }
    this._acceptQueryNotify = false;

    // 断线自动重连成功后需要先清除牌桌数据。
    if (this._queryOnReconnect) {
      this._queryOnReconnect = false;
      uiTools.toast('已重新连上服务器');
      this._clearForNextInning();
    }

    // 每秒一次保活。
    if (!this._keepAliveRunning) {
      this._keepAliveRunning = true;
      this.schedule(() => {
        cache.cmd.execCmd(`${cache.route}:game/keepAlive`, { roomId: cache.roomId }).then((res) => {
          if (res.err !== undefined) {
            if (res.err === 2 || res.err === 3) {
              this._enterHall();
            }
          }
        }).catch((err) => {
          cc.error(err);
        });
      }, 1, cc.macro.REPEAT_FOREVER);
    }

    this._bankerDir = fromDirChar(gi.banker);
    this._myDir = fromDirChar(gi.mine.dir);

    // 设置对局信息。
    this._updateInningInfo(gi.currInning, gi.totalInnings, gi.baseScore);

    // 记录我的定缺类型。
    if (this.myCardsController) {
      if (gi.mine.skipType === 'wan') {
        this.myCardsController.setSkipType(CardType.Wan);
      } else if (gi.mine.skipType === 'suo') {
        this.myCardsController.setSkipType(CardType.Suo);
      } else if (gi.mine.skipType === 'tong') {
        this.myCardsController.setSkipType(CardType.Tong);
      }
    }

    // 更新所有玩家的头像信息。
    if (this.myInfo) {
      this.myInfo.setup(gi.mine.icon, gi.mine.name, gi.mine.score, gi.mine.dir === gi.banker);
      if (gi.mine.skipType === 'wan') {
        this.myInfo.setQue(CardType.Wan);
      } else if (gi.mine.skipType === 'suo') {
        this.myInfo.setQue(CardType.Suo);
      } else if (gi.mine.skipType === 'tong') {
        this.myInfo.setQue(CardType.Tong);
      }
    }
    for (let pi of gi.others) {
      let dir = fromDirChar(pi.dir);
      let userInfo = this._getPlayerInfo(dir);
      if (userInfo) {
        userInfo.setup(pi.icon, pi.name, pi.score, pi.dir === gi.banker);
        if (pi.skipType === 'wan') {
          userInfo.setQue(CardType.Wan);
        } else if (pi.skipType === 'suo') {
          userInfo.setQue(CardType.Suo);
        } else if (pi.skipType === 'tong') {
          userInfo.setQue(CardType.Tong);
        }
      }
    }

    // 设置中央指示器。
    if (this.centerIndicator) {
      this.centerIndicator.setMyDir(this._myDir);

      //TODO 这里是错误的，因为当前的出牌人不一定是庄家。
      this.centerIndicator.setCurrDir(this._bankerDir, true);

      //TODO 设置倒计时。
    }

    // 设置我的牌组、手牌、抽牌等。
    if (this.myCardsController) {
      this.myCardsController.initCardGroups(this._myDir, gi.mine.groups);
      this.myCardsController.initHandCards(gi.mine.hands);
      if (gi.mine.drawCard !== undefined) {
        let darken = false;
        if (gi.mine.skipType === 'wan') {
          if (gi.mine.drawCard >= CardId.Wan1 && gi.mine.drawCard <= CardId.Wan9) {
            darken = true;
          }
        } else if (gi.mine.skipType === 'suo') {
          if (gi.mine.drawCard >= CardId.Suo1 && gi.mine.drawCard <= CardId.Suo9) {
            darken = true;
          }
        } else if (gi.mine.skipType === 'tong') {
          if (gi.mine.drawCard >= CardId.Tong1 && gi.mine.drawCard <= CardId.Tong9) {
            darken = true;
          }
        }
        this.myCardsController.setDrawCard(gi.mine.drawCard);
      } else {
        this.myCardsController.removeDrawCard();
      }
    }

    // 设置其他三家的牌组、手牌、抽牌等。
    for (let pi of gi.others) {
      let dir = fromDirChar(pi.dir);
      let sdir = this._toScreenDir(dir);
      if (sdir === ScreenDirection.Top) {
        if (this.topCardsController) {
          this.topCardsController.initCardGroups(dir, pi.groups);
          this.topCardsController.initHandCards(pi.handSize + pi.drawSize);
        }
      } else if (sdir === ScreenDirection.Left) {
        if (this.leftCardsController) {
          this.leftCardsController.initCardGroups(dir, pi.groups);
          this.leftCardsController.initHandCards(pi.handSize + pi.drawSize);
        }
      } else if (sdir === ScreenDirection.Right) {
        if (this.rightCardsController) {
          this.rightCardsController.initCardGroups(dir, pi.groups);
          this.rightCardsController.initHandCards(pi.handSize + pi.drawSize);
        }
      }
    }

    // 计算并设置牌墙剩余牌数。
    if (gi.cardWall) {
      this._numCardsLeft = 0;
      if (gi.cardWall.east.eClusterIdx > gi.cardWall.east.sClusterIdx) {
        this._numCardsLeft += (gi.cardWall.east.eClusterIdx - gi.cardWall.east.sClusterIdx) * 2;
        if (gi.cardWall.east.sDouble) {
          this._numCardsLeft++;
        }
        if (gi.cardWall.east.eDouble) {
          this._numCardsLeft++;
        }
      }
      if (gi.cardWall.north.eClusterIdx > gi.cardWall.north.sClusterIdx) {
        this._numCardsLeft += (gi.cardWall.north.eClusterIdx - gi.cardWall.north.sClusterIdx) * 2;
        if (gi.cardWall.north.sDouble) {
          this._numCardsLeft++;
        }
        if (gi.cardWall.north.eDouble) {
          this._numCardsLeft++;
        }
      }
      if (gi.cardWall.west.eClusterIdx > gi.cardWall.west.sClusterIdx) {
        this._numCardsLeft += (gi.cardWall.west.eClusterIdx - gi.cardWall.west.sClusterIdx) * 2;
        if (gi.cardWall.west.sDouble) {
          this._numCardsLeft++;
        }
        if (gi.cardWall.west.eDouble) {
          this._numCardsLeft++;
        }
      }
      if (gi.cardWall.south.eClusterIdx > gi.cardWall.south.sClusterIdx) {
        this._numCardsLeft += (gi.cardWall.south.eClusterIdx - gi.cardWall.south.sClusterIdx) * 2;
        if (gi.cardWall.south.sDouble) {
          this._numCardsLeft++;
        }
        if (gi.cardWall.south.eDouble) {
          this._numCardsLeft++;
        }
      }
      cc.log(`num cards left: ${this._numCardsLeft}`);
    }

    // 设置出牌区。
    if (gi.discardArea) {
      let eastArea = this._getDiscardArea(Direction.East);
      let northArea = this._getDiscardArea(Direction.North);
      let westArea = this._getDiscardArea(Direction.West);
      let southArea = this._getDiscardArea(Direction.South);
      if (eastArea) {
        for (let cardId of gi.discardArea.east) {
          eastArea.addCard(undefined, undefined, cardId, false);
        }
      }
      if (northArea) {
        for (let cardId of gi.discardArea.north) {
          northArea.addCard(undefined, undefined, cardId, false);
        }
      }
      if (westArea) {
        for (let cardId of gi.discardArea.west) {
          westArea.addCard(undefined, undefined, cardId, false);
        }
      }
      if (southArea) {
        for (let cardId of gi.discardArea.south) {
          southArea.addCard(undefined, undefined, cardId, false);
        }
      }

      //TODO 给最后出牌方位的最后一张牌显示指示器。
      //gi.discardArea.dir
    }

    // 分不同状态进行处理。
    if (gi.state === 1) {  // 等待开局就绪。

      //TODO 服务端需要下发当前局及总局数。

      // 如果正在等待客户端发送就绪，且为第一局的情况，那么应该立即发送就绪。
      if (gi.pendingAction === PendingAction.SetReady) {

        // 有结果则不是第一局。
        if (!gi.result) {

          this._sendSetReady();
        }

      } else if (gi.pendingAction !== PendingAction.None) {
        throw new Error(`wrong pending action ${gi.pendingAction} in state 1`);
      }

      // 弹出结算界面。
      if (gi.result) {
        let pris: PlayerResultInfo[] = [
          this._makeResultOf(gi.result, ScreenDirection.Bottom),
          this._makeResultOf(gi.result, ScreenDirection.Top),
          this._makeResultOf(gi.result, ScreenDirection.Left),
          this._makeResultOf(gi.result, ScreenDirection.Right)
        ];
        uiTools.openWindow('prefab/inningResult').then((node) => {
          this._inningResultNode = node;
          let c = node.getComponent(InningResult);
          if (c) {
            c.setup(pris);
            if (gi.pendingAction === PendingAction.None) {
              c.showContinueDisabledButton();
            }
          }
        }).catch((err) => {
          cc.error(err);
        });
      }

    } else if (gi.state === 2) {  // 等待发牌完成。

      // 如果正在等待客户端发牌完成，那么补充提交发牌完成。
      if (gi.pendingAction === PendingAction.FinishDeal) {
        this._sendFinishDeal();
      }
    } else if (gi.state === 3) {  // 等待定缺完成。

      // 如果正在等待客户端定缺完成，那么弹出定缺界面。
      if (gi.pendingAction === PendingAction.FinishSkipOne) {
        if (this.skipOneUi) {
          this.skipOneUi.show();
        }
      }
    } else if (gi.state === 4) {  // 等待牌局结束。

      // 显示牌墙简要信息。
      if (this.cardWallNode) {
        this.cardWallNode.active = true;
      }
      if (this.cardsLeftLabel) {
        this.cardsLeftLabel.string = this._numCardsLeft.toString();
      }

      // 允许选择手牌。
      if (this.myCardsController) {
        this.myCardsController.enableSelect();
      }

      //TODO 显示发牌区指示器。

      // 中央指示器调整。
      //TODO
      if (gi.pendingAction === PendingAction.None) {
        if (this.myCardsController && this.myCardsController.existsDrawCard()) {
          this.myCardsController.enableDiscard();
        }
      } else if (gi.pendingAction === PendingAction.Eat) {
        if (this.myCardsController) {

          // 从出牌区的末尾取得输入的卡牌进行分析，根据分析的结果可能会弹出碰、杠、胡、过的界面。
          if (gi.discardArea) {
            let discardArea = this._getDiscardArea(fromDirChar(gi.discardArea.dir));
            let cardId = discardArea.getLastCard();
            if (cardId !== undefined) {
              let sop = this.myCardsController.calcShowOptionOnDiscard(cardId, this._numCardsLeft);
              if (sop) {
                if (this.pengGangHuGuoUi) {
                  this.pengGangHuGuoUi.show(sop);
                }
              }
            }
          }
        }
      } else if (gi.pendingAction === PendingAction.QiangGangHu) {
        //TODO
      } else if (gi.pendingAction === PendingAction.AfterDraw) {
        if (this.myCardsController) {
          let sop = this.myCardsController.calcShowOptionOnDraw(this._numCardsLeft);
          if (sop) {
            if (this.pengGangHuGuoUi) {
              this.pengGangHuGuoUi.show(sop);
              this.pengGangHuGuoUi.node.once('pass', (evn: cc.Event) => {
                evn.stopPropagation();
                this.myCardsController.enableDiscard();
              });
            }
          } else {
            this.myCardsController.enableDiscard();
          }
        }
      }
      else if (gi.pendingAction === PendingAction.AfterPeng) {
        if (this.myCardsController) {
          this.myCardsController.enableDiscard();

          // 中央指示器指向我。
          if (this.centerIndicator) {
            this.centerIndicator.setCurrDir(this._myDir, true);
          }
        }
      }

      // 计算听。
      if (this.tingNode && this.myCardsController) {
        this._tingInfos = this.myCardsController.calcTing(this._calcCardCount(), this._isFirstDraw(), this._bankerDir === this._myDir);
        if (this._tingInfos.length > 0) {
          if (!this.tingNode.active) {
            this.tingNode.active = true;
          }
        } else {
          if (this.threeLineTingUi && this.threeLineTingUi.node.active) {
            this.threeLineTingUi.node.active = false;
          }
          if (this.twoLineTingUi && this.twoLineTingUi.node.active) {
            this.twoLineTingUi.node.active = false;
          }
          if (this.singleLineTingUi && this.singleLineTingUi.node.active) {
            this.singleLineTingUi.node.active = false;
          }
          this.tingNode.active = false;
        }
      }

    } else {
      throw new Error(`unknown state ${gi.state}`);
    }
  }

  private async _onStartDealNotify(notify: StartDealNotify) {

    // 清理上局的数据。
    this._clearForNextInning();

    // 更新对局信息。
    if (this.currInningLabel) {
      this.currInningLabel.string = (notify.currInning + 1).toString();
    }

    // 确定庄的位置。
    this._bankerDir = fromDirChar(notify.bankerDir);
    let bankerSDir = this._toScreenDir(this._bankerDir);

    // 庄家所在的用户头像显示“庄”。
    if (bankerSDir === ScreenDirection.Bottom) {
      if (this.myInfo) {
        this.myInfo.setBanker();
      }
    } else if (bankerSDir === ScreenDirection.Top) {
      if (this.topInfo) {
        this.topInfo.setBanker();
      }
    } else if (bankerSDir === ScreenDirection.Left) {
      if (this.leftInfo) {
        this.leftInfo.setBanker();
      }
    } else if (bankerSDir === ScreenDirection.Right) {
      if (this.rightInfo) {
        this.rightInfo.setBanker();
      }
    }

    // 确定发牌的顺序，发牌是从庄家开始的。
    let dirs: Direction[] = [];
    if (this._bankerDir === Direction.East) {
      dirs.push(Direction.East, Direction.North, Direction.West, Direction.South);
    } else if (this._bankerDir === Direction.North) {
      dirs.push(Direction.North, Direction.West, Direction.South, Direction.East);
    } else if (this._bankerDir === Direction.West) {
      dirs.push(Direction.West, Direction.South, Direction.East, Direction.North);
    } else if (this._bankerDir === Direction.South) {
      dirs.push(Direction.South, Direction.East, Direction.North, Direction.West);
    }

    // 分3次，每次每人发4张（2墩）。
    let myHandsIdx = 0;
    let idx = 0;
    for (let n = 0; n < 12; ++n) {

      // 获取发牌方位。
      let dir = dirs[idx++];
      if (dir === undefined) {
        idx = 1;
        dir = dirs[0];
      }

      // 发4张。
      let sdir = this._toScreenDir(dir);
      switch (sdir) {
        case ScreenDirection.Bottom:
          if (this.myCardsController) {
            for (let m = 0; m < 4; ++m) {
              this.myCardsController.addHandCard(notify.hands[myHandsIdx++]);
            }
          }
          break;
        case ScreenDirection.Top:
          if (this.topCardsController) {
            for (let m = 0; m < 4; ++m) {
              this.topCardsController.addHandCard();
            }
          }
          break;
        case ScreenDirection.Left:
          if (this.leftCardsController) {
            for (let m = 0; m < 4; ++m) {
              this.leftCardsController.addHandCard();
            }
          }
          break;
        case ScreenDirection.Right:
          if (this.rightCardsController) {
            for (let m = 0; m < 4; ++m) {
              this.rightCardsController.addHandCard();
            }
          }
          break;
        default:
          throw new Error(`unknown screen dir ${sdir}`);
      }

      // 停顿一下。
      await new Promise(res => setTimeout(res, 300));
      if (this._destroyed) {
        return;
      }
    }

    // 每人发1张。
    for (let n = 0; n < 4; ++n) {

      // 获取发牌方位。
      let dir = dirs[idx++];
      if (dir === undefined) {
        idx = 1;
        dir = dirs[0];
      }

      // 发1张。
      let sdir = this._toScreenDir(dir);
      switch (sdir) {
        case ScreenDirection.Bottom:
          if (this.myCardsController) {
            this.myCardsController.addHandCard(notify.hands[myHandsIdx++]);
          }
          break;
        case ScreenDirection.Top:
          if (this.topCardsController) {
            this.topCardsController.addHandCard();
          }
          break;
        case ScreenDirection.Left:
          if (this.leftCardsController) {
            this.leftCardsController.addHandCard();
          }
          break;
        case ScreenDirection.Right:
          if (this.rightCardsController) {
            this.rightCardsController.addHandCard();
          }
          break;
        default:
          throw new Error(`unknown screen dir ${sdir}`);
      }

      // 停顿一下。
      await new Promise(res => setTimeout(res, 300));
      if (this._destroyed) {
        return;
      }
    }

    // 庄家抽一张。
    switch (bankerSDir) {
      case ScreenDirection.Bottom:
        if (this.myCardsController && notify.draw !== undefined) {
          this.myCardsController.setDrawCard(notify.draw);
        }
        break;
      case ScreenDirection.Top:
        if (this.topCardsController) {
          this.topCardsController.addHandCard();
        }
        break;
      case ScreenDirection.Left:
        if (this.leftCardsController) {
          this.leftCardsController.addHandCard();
        }
        break;
      case ScreenDirection.Right:
        if (this.rightCardsController) {
          this.rightCardsController.addHandCard();
        }
        break;
      default:
        throw new Error(`unknown screen dir ${bankerSDir}`);
    }

    // 停顿一下。
    await new Promise(res => setTimeout(res, 300));
    if (this._destroyed) {
      return;
    }

    // 删除手牌。
    if (this.myCardsController) {
      this.myCardsController.clear();
    }

    //TODO 显示盖牌一段时间。
    await new Promise(res => setTimeout(res, 1000));
    if (this._destroyed) {
      return;
    }
    //TODO 隐藏盖牌。

    // 重新初始化手牌（排序）。
    let hands = notify.hands.slice();
    hands.sort((a, b) => {
      return a - b;
    });
    if (this.myCardsController) {
      for (let cardId of hands) {
        this.myCardsController.addHandCard(cardId);
      }
      if (notify.draw) {
        this.myCardsController.setDrawCard(notify.draw);
      }
    }

    // 完成发牌。
    await this._sendFinishDeal();
  }

  private async _onStartSkipOneNotify(notify: StartSkipOneNotify) {
    this._numCardsLeft = 55;
    if (this.skipOneUi) {
      this.skipOneUi.show();
    }
    if (this.cardWallNode) {
      this.cardWallNode.active = true;
    }
    if (this.cardsLeftLabel) {
      this.cardsLeftLabel.string = this._numCardsLeft.toString();
    }
  }

  private async _onStartPlayNotify(notify: StartPlayNotify) {
    this._numCardsLeft = 55;

    // 隐藏定缺界面。
    if (this.skipOneUi) {
      this.skipOneUi.hide();
    }

    // 显示牌墙简要信息。
    if (this.cardWallNode && !this.cardWallNode.active) {
      this.cardWallNode.active = true;
      if (this.cardsLeftLabel) {
        this.cardsLeftLabel.string = this._numCardsLeft.toString();
      }
    }

    // 更新定缺。
    for (let x of notify.skipOnes) {
      let dir = fromDirChar(x.dir);
      let ui = this._getPlayerInfo(dir);
      if (ui) {
        if (x.skipType === 'wan') {
          ui.setQue(CardType.Wan);
        } else if (x.skipType === 'suo') {
          ui.setQue(CardType.Suo);
        } else if (x.skipType === 'tong') {
          ui.setQue(CardType.Tong);
        }
      }
      if (dir === this._myDir) {
        if (this.myCardsController) {
          if (x.skipType === 'wan') {
            this.myCardsController.setSkipType(CardType.Wan);
          } else if (x.skipType === 'suo') {
            this.myCardsController.setSkipType(CardType.Suo);
          } else if (x.skipType === 'tong') {
            this.myCardsController.setSkipType(CardType.Tong);
          }
        }
      }
    }

    // 从现在开始，点击手牌和抽牌，牌会向上移动。
    // 并且如果轮到自己出牌，需要检查杠、胡。
    if (this.myCardsController) {
      this.myCardsController.enableSelect();
      if (this.myCardsController.existsDrawCard()) {
        let sop = this.myCardsController.calcShowOptionOnDraw(this._numCardsLeft);
        if (sop) {
          if (this.pengGangHuGuoUi) {
            this.pengGangHuGuoUi.show(sop);
            this.pengGangHuGuoUi.node.once('pass', (evn: cc.Event) => {
              evn.stopPropagation();
              this.myCardsController.enableDiscard();
            });
          }
        } else {
          this.myCardsController.enableDiscard();
        }
      }
    }
  }

  private async _onDiscardNotify(notify: DiscardNotify) {
    cc.log('discardNotify');
    cc.log(notify);

    let dir = fromDirChar(notify.dir);
    let sdir = this._toScreenDir(dir);

    // 关闭所有的出牌区指示器。
    if (this.myDiscardArea) {
      this.myDiscardArea.hideIndicator();
    }
    if (this.topDiscardArea) {
      this.topDiscardArea.hideIndicator();
    }
    if (this.leftDiscardArea) {
      this.leftDiscardArea.hideIndicator();
    }
    if (this.rightDiscardArea) {
      this.rightDiscardArea.hideIndicator();
    }

    // 打出一张牌，并将牌添加到相应的出牌区。
    if (sdir === ScreenDirection.Bottom) {
      if (this.myCardsController) {
        var pos = this.myCardsController.finishDiscard(this.node);
        if (pos === undefined) {
          cc.log('_onDiscardNotify enter code 1');
          //TODO 有可能我在出牌期间掉线了，重新上线时由于丢失了上次的状态（选牌状态）无法完成出牌，因此需要随便打出一张同名牌。
        }
      }
      if (this.myDiscardArea) {
        this.myDiscardArea.addCard(this.node, pos, notify.cardId, true);
      }
    } else if (sdir === ScreenDirection.Top) {
      if (this.topCardsController) {
        var pos = this.topCardsController.finishDiscard(this.node, sdir);
      }
      if (this.topDiscardArea) {
        this.topDiscardArea.addCard(this.node, pos, notify.cardId, true);
      }
    } else if (sdir === ScreenDirection.Left) {
      if (this.leftCardsController) {
        var pos = this.leftCardsController.finishDiscard(this.node, sdir);
      }
      if (this.leftDiscardArea) {
        this.leftDiscardArea.addCard(this.node, pos, notify.cardId, true);
      }
    } else if (sdir === ScreenDirection.Right) {
      if (this.rightCardsController) {
        var pos = this.rightCardsController.finishDiscard(this.node, sdir);
      }
      if (this.rightDiscardArea) {
        this.rightDiscardArea.addCard(this.node, pos, notify.cardId, true);
      }
    }

    // 如果是别人出的牌，那么可能需要弹出碰、杠、胡、过。
    if (sdir !== ScreenDirection.Bottom) {
      if (this.myCardsController) {
        let sop = this.myCardsController.calcShowOptionOnDiscard(notify.cardId, this._numCardsLeft);
        if (sop) {
          if (this.pengGangHuGuoUi) {
            this.pengGangHuGuoUi.show(sop);
          }
        }
      }
    }

    // 如果是自己打出了牌，那么计算听。
    if (sdir === ScreenDirection.Bottom) {
      if (this.tingNode && this.myCardsController) {
        this._tingInfos = this.myCardsController.calcTing(this._calcCardCount(), this._isFirstDraw(), this._bankerDir === this._myDir);
        if (this._tingInfos.length > 0) {
          if (!this.tingNode.active) {
            this.tingNode.active = true;
          }
        } else {
          if (this.threeLineTingUi && this.threeLineTingUi.node.active) {
            this.threeLineTingUi.node.active = false;
          }
          if (this.twoLineTingUi && this.twoLineTingUi.node.active) {
            this.twoLineTingUi.node.active = false;
          }
          if (this.singleLineTingUi && this.singleLineTingUi.node.active) {
            this.singleLineTingUi.node.active = false;
          }
          this.tingNode.active = false;
        }
      }
    }

    // 如果是自己打出的牌，且手上还存在定缺的牌，且打出的牌不是定缺的牌，且为前三次，那么提示用户。
    if (sdir === ScreenDirection.Bottom) {
      if (this._skipTipTimes < 3 && this.myCardsController && !this.myCardsController.isSkipCard(notify.cardId) && this.myCardsController.existsSkipCard()) {
        let tips = ['缺一门才能胡牌', '结束时有缺门的牌将被查花猪'];
        let tip = tips[this._skipTipTimes % tips.length];
        this._skipTipTimes++;
        uiTools.toast(tip);
      }
    }
  }

  private async _onDrawFrontNotify(notify: DrawFrontNotify) {
    cc.log('drawFrontNotify');
    cc.log(notify);

    let dir = fromDirChar(notify.dir);
    let sdir = this._toScreenDir(dir);

    // 剩余牌数减一。
    this._numCardsLeft--;
    //TODO 需要跟踪通知的数量，以防同一个通知多次接收导致牌墙的数量同步错误了。

    // 更新剩余牌数的显示。
    if (this.cardsLeftLabel) {
      this.cardsLeftLabel.string = this._numCardsLeft.toString();
    }

    // 执行抽牌。
    if (sdir === ScreenDirection.Bottom) {

      // 设置抽牌。
      if (this.myCardsController) {
        this.myCardsController.setDrawCard(notify.cardId);
      }

      // 检测补杠、暗杠、自摸胡。
      if (this.myCardsController) {
        let sop = this.myCardsController.calcShowOptionOnDraw(this._numCardsLeft);
        if (sop) {
          if (this.pengGangHuGuoUi) {
            this.pengGangHuGuoUi.show(sop);
            this.pengGangHuGuoUi.node.once('pass', (evn: cc.Event) => {
              evn.stopPropagation();
              this.myCardsController.enableDiscard();
            });
          }
        } else {
          this.myCardsController.enableDiscard();
        }
      }

      //TODO 允许自己出牌。
    } else if (sdir === ScreenDirection.Top) {
      if (this.topCardsController) {
        this.topCardsController.addHandCard();
      }
    } else if (sdir === ScreenDirection.Left) {
      if (this.leftCardsController) {
        this.leftCardsController.addHandCard();
      }
    } else if (sdir === ScreenDirection.Right) {
      if (this.rightCardsController) {
        this.rightCardsController.addHandCard();
      }
    }

    // 切换中央指示器。
    if (this.centerIndicator) {
      this.centerIndicator.setCurrDir(dir, true);
      this.centerIndicator.beginCountDown(30);
    }
  }

  private async _onDrawBackNotify(notify: DrawBackNotify) {
    cc.log('drawBackNotify');
    cc.log(notify);

    let dir = fromDirChar(notify.dir);
    let sdir = this._toScreenDir(dir);

    // 剩余牌数减一。
    this._numCardsLeft--;
    //TODO 需要跟踪通知的数量，以防同一个通知多次接收导致牌墙的数量同步错误了。

    // 更新剩余牌数的显示。
    if (this.cardsLeftLabel) {
      this.cardsLeftLabel.string = this._numCardsLeft.toString();
    }

    // 处理抽牌。
    if (sdir === ScreenDirection.Bottom) {

      // 设置抽牌。
      if (this.myCardsController) {
        this.myCardsController.setDrawCard(notify.cardId);
      }

      // 检测补杠、暗杠、自摸胡。
      if (this.myCardsController) {
        let sop = this.myCardsController.calcShowOptionOnDraw(this._numCardsLeft);
        if (sop) {
          cc.log(sop);
          if (this.pengGangHuGuoUi) {
            this.pengGangHuGuoUi.show(sop);
            this.pengGangHuGuoUi.node.once('pass', (evn: cc.Event) => {
              evn.stopPropagation();
              this.myCardsController.enableDiscard();
            });
          }
        } else {
          this.myCardsController.enableDiscard();
        }
      }

      //TODO 允许自己出牌。
    } else if (sdir === ScreenDirection.Top) {
      if (this.topCardsController) {
        this.topCardsController.addHandCard();
      }
    } else if (sdir === ScreenDirection.Left) {
      if (this.leftCardsController) {
        this.leftCardsController.addHandCard();
      }
    } else if (sdir === ScreenDirection.Right) {
      if (this.rightCardsController) {
        this.rightCardsController.addHandCard();
      }
    }

    // 切换中央指示器。
    if (this.centerIndicator) {
      this.centerIndicator.setCurrDir(dir, true);
      this.centerIndicator.beginCountDown(30);
    }
  }

  private async _onPengNotify(notify: PengNotify) {
    cc.log('pengNotify');
    cc.log(notify);

    let dir = fromDirChar(notify.dir);
    let fromDir = fromDirChar(notify.fromDir);

    // 关闭所有的出牌区指示器。
    if (this.myDiscardArea) {
      this.myDiscardArea.hideIndicator();
    }
    if (this.topDiscardArea) {
      this.topDiscardArea.hideIndicator();
    }
    if (this.leftDiscardArea) {
      this.leftDiscardArea.hideIndicator();
    }
    if (this.rightDiscardArea) {
      this.rightDiscardArea.hideIndicator();
    }

    // 从丢牌区移除牌。
    let discardArea = this._getDiscardArea(fromDir);
    if (discardArea) {
      discardArea.removeLastCard();
    }

    // 切换中央指示器。
    if (this.centerIndicator) {
      this.centerIndicator.setCurrDir(dir, true);
      this.centerIndicator.beginCountDown(30);
    }

    // 执行碰。
    let sdir = this._toScreenDir(dir);
    if (sdir === ScreenDirection.Bottom) {
      if (this.myCardsController) {
        this.myCardsController.peng(notify.cardId, dir, fromDir);
      }
    } else if (sdir === ScreenDirection.Top) {
      if (this.topCardsController) {
        this.topCardsController.peng(notify.cardId, dir, fromDir);
      }
    } else if (sdir === ScreenDirection.Left) {
      if (this.leftCardsController) {
        this.leftCardsController.peng(notify.cardId, dir, fromDir);
      }
    } else if (sdir === ScreenDirection.Right) {
      if (this.rightCardsController) {
        this.rightCardsController.peng(notify.cardId, dir, fromDir);
      }
    }

    // 如果是自己的碰，那么轮到自己出牌。
    if (dir === this._myDir) {

      // 允许自己出牌。
      if (this.myCardsController) {
        this.myCardsController.enableDiscard();
      }
    }
  }

  private async _onMingGangNotify(notify: MingGangNotify) {
    cc.log('mingGangNotify');
    cc.log(notify);

    let dir = fromDirChar(notify.dir);
    let fromDir = fromDirChar(notify.fromDir);

    // 关闭所有的出牌区指示器。
    if (this.myDiscardArea) {
      this.myDiscardArea.hideIndicator();
    }
    if (this.topDiscardArea) {
      this.topDiscardArea.hideIndicator();
    }
    if (this.leftDiscardArea) {
      this.leftDiscardArea.hideIndicator();
    }
    if (this.rightDiscardArea) {
      this.rightDiscardArea.hideIndicator();
    }

    // 切换中央指示器。
    if (this.centerIndicator) {
      this.centerIndicator.setCurrDir(dir, true);
      this.centerIndicator.beginCountDown(30);
    }

    // 执行明杠。
    let sdir = this._toScreenDir(dir);
    if (sdir === ScreenDirection.Bottom) {
      if (this.myCardsController) {
        this.myCardsController.mingGang(notify.cardId, dir, fromDir);
      }
    } else if (sdir === ScreenDirection.Top) {
      if (this.topCardsController) {
        this.topCardsController.mingGang(notify.cardId, dir, fromDir);
      }
    } else if (sdir === ScreenDirection.Left) {
      if (this.leftCardsController) {
        this.leftCardsController.mingGang(notify.cardId, dir, fromDir);
      }
    } else if (sdir === ScreenDirection.Right) {
      if (this.rightCardsController) {
        this.rightCardsController.mingGang(notify.cardId, dir, fromDir);
      }
    }
  }

  private async _onBuGangNotify(notify: BuGangNotify) {
    cc.log('buGangNotify');
    cc.log(notify);

    let dir = fromDirChar(notify.dir);

    // 切换中央指示器。
    if (this.centerIndicator) {
      this.centerIndicator.setCurrDir(dir, true);
      this.centerIndicator.beginCountDown(30);
    }

    // 执行补杠。
    let sdir = this._toScreenDir(dir);
    if (sdir === ScreenDirection.Bottom) {
      if (this.myCardsController) {
        this.myCardsController.buGang(notify.cardId, dir);
      }
    } else if (sdir === ScreenDirection.Top) {
      if (this.topCardsController) {
        this.topCardsController.buGang(notify.cardId, dir);
      }
    } else if (sdir === ScreenDirection.Left) {
      if (this.leftCardsController) {
        this.leftCardsController.buGang(notify.cardId, dir);
      }
    } else if (sdir === ScreenDirection.Right) {
      if (this.rightCardsController) {
        this.rightCardsController.buGang(notify.cardId, dir);
      }
    }

    // 如果是其他三家补杠，那么需要计算是否有抢杠胡，如果有，那么弹出UI。
    if (sdir !== ScreenDirection.Bottom) {
      if (this.myCardsController) {
        let sop = this.myCardsController.calcShowOptionOnBuGang(notify.cardId);
        if (sop) {
          if (this.pengGangHuGuoUi) {
            this.pengGangHuGuoUi.show(sop);
          }
        }
      }
    }
  }

  private async _onAnGangNotify(notify: AnGangNotify) {
    cc.log('anGangNotify');
    cc.log(notify);

    let dir = fromDirChar(notify.dir);

    // 切换中央指示器。
    if (this.centerIndicator) {
      this.centerIndicator.setCurrDir(dir, true);
      this.centerIndicator.beginCountDown(30);
    }

    // 执行暗杠。
    let sdir = this._toScreenDir(dir);
    if (sdir === ScreenDirection.Bottom) {
      if (this.myCardsController) {
        this.myCardsController.anGang(notify.cardId, dir);
      }
    } else if (sdir === ScreenDirection.Top) {
      if (this.topCardsController) {
        this.topCardsController.anGang(notify.cardId, dir);
      }
    } else if (sdir === ScreenDirection.Left) {
      if (this.leftCardsController) {
        this.leftCardsController.anGang(notify.cardId, dir);
      }
    } else if (sdir === ScreenDirection.Right) {
      if (this.rightCardsController) {
        this.rightCardsController.anGang(notify.cardId, dir);
      }
    }
  }

  private _onFinishInningNotify(notify: FinishInningNotify) {
    cc.log('finishInningNotify');
    cc.log(notify);

    // 记录消息，以便结算界面弹出时使用。
    this._finishInningNotify = notify;

    // 关闭听的显示。
    this._tingInfos.length = 0;
    if (this.tingNode && this.tingNode.active) {
      this.tingNode.active = false;
    }

    // 删除其他三家的手牌暗牌，替换为手牌明牌（显示区域不变）。
    let list = [
      {
        dir: this._fromScreenDir(ScreenDirection.Top),
        controller: this.topCardsController
      },
      {
        dir: this._fromScreenDir(ScreenDirection.Left),
        controller: this.leftCardsController
      },
      {
        dir: this._fromScreenDir(ScreenDirection.Right),
        controller: this.rightCardsController
      }
    ];
    for (let x of list) {
      let dir = x.dir;
      let controller = x.controller;
      switch (dir) {
        case Direction.East:
          if (controller) {
            controller.removeAllHandCards();
            controller.setHandCards(notify.east);
          }
          break;
        case Direction.North:
          if (controller) {
            controller.removeAllHandCards();
            controller.setHandCards(notify.north);
          }
          break;
        case Direction.West:
          if (controller) {
            controller.removeAllHandCards();
            controller.setHandCards(notify.west);
          }
          break;
        case Direction.South:
          if (controller) {
            controller.removeAllHandCards();
            controller.setHandCards(notify.south);
          }
          break;
      }
    }

    // 显示胡牌。
    if (notify.eastHu !== undefined) {
      let sdir = this._toScreenDir(Direction.East);
      if (sdir === ScreenDirection.Bottom) {
        if (this.myHuCard) {
          this.myHuCard.node.active = true;
          this.myHuCard.setup(notify.eastHu);
          this.myHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Top) {
        if (this.topHuCard) {
          this.topHuCard.node.active = true;
          this.topHuCard.setup(notify.eastHu);
          this.topHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Left) {
        if (this.leftHuCard) {
          this.leftHuCard.node.active = true;
          this.leftHuCard.setup(notify.eastHu);
          this.leftHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Right) {
        if (this.rightHuCard) {
          this.rightHuCard.node.active = true;
          this.rightHuCard.setup(notify.eastHu);
          this.rightHuCard.playHuEffect();
        }
      }
      this._playHuEffect(sdir);
    }
    if (notify.northHu !== undefined) {
      let sdir = this._toScreenDir(Direction.North);
      if (sdir === ScreenDirection.Bottom) {
        if (this.myHuCard) {
          this.myHuCard.node.active = true;
          this.myHuCard.setup(notify.northHu);
          this.myHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Top) {
        if (this.topHuCard) {
          this.topHuCard.node.active = true;
          this.topHuCard.setup(notify.northHu);
          this.topHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Left) {
        if (this.leftHuCard) {
          this.leftHuCard.node.active = true;
          this.leftHuCard.setup(notify.northHu);
          this.leftHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Right) {
        if (this.rightHuCard) {
          this.rightHuCard.node.active = true;
          this.rightHuCard.setup(notify.northHu);
          this.rightHuCard.playHuEffect();
        }
      }
      this._playHuEffect(sdir);
    }
    if (notify.westHu !== undefined) {
      let sdir = this._toScreenDir(Direction.West);
      if (sdir === ScreenDirection.Bottom) {
        if (this.myHuCard) {
          this.myHuCard.node.active = true;
          this.myHuCard.setup(notify.westHu);
          this.myHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Top) {
        if (this.topHuCard) {
          this.topHuCard.node.active = true;
          this.topHuCard.setup(notify.westHu);
          this.topHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Left) {
        if (this.leftHuCard) {
          this.leftHuCard.node.active = true;
          this.leftHuCard.setup(notify.westHu);
          this.leftHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Right) {
        if (this.rightHuCard) {
          this.rightHuCard.node.active = true;
          this.rightHuCard.setup(notify.westHu);
          this.rightHuCard.playHuEffect();
        }
      }
      this._playHuEffect(sdir);
    }
    if (notify.southHu !== undefined) {
      let sdir = this._toScreenDir(Direction.South);
      if (sdir === ScreenDirection.Bottom) {
        if (this.myHuCard) {
          this.myHuCard.node.active = true;
          this.myHuCard.setup(notify.southHu);
          this.myHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Top) {
        if (this.topHuCard) {
          this.topHuCard.node.active = true;
          this.topHuCard.setup(notify.southHu);
          this.topHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Left) {
        if (this.leftHuCard) {
          this.leftHuCard.node.active = true;
          this.leftHuCard.setup(notify.southHu);
          this.leftHuCard.playHuEffect();
        }
      } else if (sdir === ScreenDirection.Right) {
        if (this.rightHuCard) {
          this.rightHuCard.node.active = true;
          this.rightHuCard.setup(notify.southHu);
          this.rightHuCard.playHuEffect();
        }
      }
      this._playHuEffect(sdir);
    }

    // 抢杠胡时需要将对方的杠替换为碰。
    let huCard: CardId | undefined;
    if (notify.eastHu !== undefined) {
      huCard = notify.eastHu;
    } else if (notify.northHu !== undefined) {
      huCard = notify.northHu;
    } else if (notify.westHu !== undefined) {
      huCard = notify.westHu;
    } else if (notify.southHu !== undefined) {
      huCard = notify.southHu;
    }
    if (notify.huList.length === 1) {  // 抢杠胡时只会有一家胡牌。
      let dianPao = notify.huList[0].dianPao;
      if (dianPao) {  // 抢杠胡时此变量会有值。
        let titles = notify.huList[0].titles;
        if (titles.indexOf(HuTitle.QiangGang) >= 0) {  // 确认是抢杠胡。
          let sdirDianPao = this._toScreenDir(fromDirChar(dianPao.dir));
          switch (sdirDianPao) {
            case ScreenDirection.Bottom:
              if (this.myCardsController) {
                this.myCardsController.unBuGang(huCard, this._myDir);
              }
              break;
            case ScreenDirection.Top:
              if (this.topCardsController) {
                this.topCardsController.unBuGang(huCard, this._fromScreenDir(ScreenDirection.Top));
              }
              break;
            case ScreenDirection.Left:
              if (this.leftCardsController) {
                this.leftCardsController.unBuGang(huCard, this._fromScreenDir(ScreenDirection.Left));
              }
              break;
            case ScreenDirection.Right:
              if (this.rightCardsController) {
                this.rightCardsController.unBuGang(huCard, this._fromScreenDir(ScreenDirection.Right));
              }
              break;
          }
        }
      }
    }

    // 更新玩家的分数。
    let ui = this._getPlayerInfo(Direction.East);
    if (ui) {
      ui.setScore(notify.eastScore);
    }
    ui = this._getPlayerInfo(Direction.North);
    if (ui) {
      ui.setScore(notify.northScore);
    }
    ui = this._getPlayerInfo(Direction.West);
    if (ui) {
      ui.setScore(notify.westScore);
    }
    ui = this._getPlayerInfo(Direction.South);
    if (ui) {
      ui.setScore(notify.southScore);
    }

    // 延迟弹出结算界面。
    let pris: PlayerResultInfo[] = [
      this._makeResultOf(notify, ScreenDirection.Bottom),
      this._makeResultOf(notify, ScreenDirection.Top),
      this._makeResultOf(notify, ScreenDirection.Left),
      this._makeResultOf(notify, ScreenDirection.Right)
    ];
    this.scheduleOnce(() => {
      uiTools.openWindow('prefab/inningResult').then((node) => {
        this._inningResultNode = node;
        let c = node.getComponent(InningResult);
        if (c) {
          c.setup(pris);
        }
      }).catch((err) => {
        cc.error(err);
      });
    }, 2);
  }

  private _onKeepAliveNotify(notify: KeepAliveNotify) {
    let userInfo = this._getPlayerInfo(fromDirChar(notify.dir));
    if (userInfo !== this.myInfo) {
      userInfo.keepAlive();
    }
  }

  /**
   * 点击记录按钮的处理。
   */
  onClickRecord() {
  }

  /**
   * 点击聊天按钮的处理。
   */
  onClickChat() {
  }

  /**
   * 点击听按钮的处理。
   */
  onClickTing() {
    if (!this.threeLineTingUi || !this.twoLineTingUi || !this.singleLineTingUi) {
      return;
    }

    // 如果之前界面是打开的，那么关闭之，否则开启。
    if (this.threeLineTingUi.visible() || this.twoLineTingUi.visible() || this.singleLineTingUi.visible()) {
      this.threeLineTingUi.hide();
      this.twoLineTingUi.hide();
      this.singleLineTingUi.hide();
    } else {
      if (this._tingInfos.length > 0) {
        if (this._tingInfos.length > 8) {
          var ui = this.threeLineTingUi;
          var anotherUi1 = this.singleLineTingUi;
          var anotherUi2 = this.twoLineTingUi;
        } else if (this._tingInfos.length > 4) {
          var ui = this.twoLineTingUi;
          var anotherUi1 = this.singleLineTingUi;
          var anotherUi2 = this.threeLineTingUi;
        } else {
          var ui = this.singleLineTingUi;
          var anotherUi1 = this.twoLineTingUi;
          var anotherUi2 = this.threeLineTingUi;
        }
        anotherUi1.hide();
        anotherUi2.hide();
        ui.setup(this._tingInfos);
        ui.show();
      }
    }
  }
}