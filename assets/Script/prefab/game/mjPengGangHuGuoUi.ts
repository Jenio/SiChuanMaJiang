import { CardId, GangType, HuType } from '../../model/game/concept';
import uiTools from '../../model/ui/tools';
import cache from '../../model/cache';
import MjSelectGang from './mjSelectGang';

const { ccclass, property } = cc._decorator;

/**
 * 显示选项。
 */
export interface ShowOption {

  /**
   * 是否有碰。
   */
  peng: boolean;

  /**
   * 杠牌数组（因为杠可能出现多选）。
   */
  gang: {

    /**
     * 牌。
     */
    cardId: CardId;

    /**
     * 杠的类型。
     */
    type: GangType;
  }[];

  /**
   * 胡的类型。
   */
  huType: HuType;

  /**
   * 是否发送过（过有两种，一种是需要发往服务端的，另一种不需要）。
   */
  sendPass: boolean;
}

/**
 * 麻将碰杠胡过UI。
 */
@ccclass
export default class MjPengGangHuGuoUi extends cc.Component {

  /**
   * 碰按钮。
   */
  @property(cc.Button)
  pengBtn: cc.Button = null;

  /**
   * 杠按钮。
   */
  @property(cc.Button)
  gangBtn: cc.Button = null;

  /**
   * 胡按钮。
   */
  @property(cc.Button)
  huBtn: cc.Button = null;

  /**
   * 过按钮。
   */
  @property(cc.Button)
  guoBtn: cc.Button = null;

  /**
   * 杠选择UI。
   */
  @property(MjSelectGang)
  selectGangUi: MjSelectGang = null;

  /**
   * 选项。
   */
  private _option?: ShowOption;

  /**
   * 忙标记。
   */
  private _busy = false;

  /**
   * 显示的引用计数。
   */
  private _showRefCounter = 0;

  private _selectGangHander = this._onSelectGang.bind(this);

  /**
   * 界面隐藏。
   */
  hide() {
    if (this._showRefCounter > 0) {
      if (--this._showRefCounter === 0) {
        this.node.active = false;
        if (this.selectGangUi) {
          if (this.selectGangUi.visible()) {
            this.selectGangUi.node.off('selected', this._selectGangHander);
            this.selectGangUi.hide();
          }
        }
      }
    }
  }

  /**
   * 界面显示。
   * @param option 选项。
   */
  show(option: ShowOption) {
    this._option = option;
    this.node.active = true;
    if (this.selectGangUi && this.selectGangUi.visible()) {
      this.selectGangUi.node.off('selected', this._selectGangHander);
      this.selectGangUi.hide();
    }
    if (this.pengBtn) {
      this.pengBtn.node.active = option.peng;
    }
    if (this.gangBtn) {
      this.gangBtn.node.active = option.gang.length > 0;
    }
    if (this.huBtn) {
      this.huBtn.node.active = option.huType !== HuType.None;
    }
    this.guoBtn.node.active = true;
    this._busy = false;
    this._showRefCounter++;
  }

  /**
   * 点击碰的处理。
   * @param evn 事件。
   */
  onClickPeng(evn: cc.Event) {
    evn.stopPropagation();
    if (this._option && this._option.peng && !this._busy) {
      this._busy = true;
      cache.cmd.execCmd(`${cache.route}:game/peng`, {
        roomId: cache.roomId
      }).then((res) => {
        this.hide();
        if (res.err !== undefined) {
          cc.warn(`res.err is: ${res.err}`);
          if (res.err === 2 || res.err === 3) {
            uiTools.fireEvent(this.node, 'notFoundRoom', undefined, true);
          }
        }
      }).catch((err) => {
        cc.error(err);
      }).then(() => {
        this._busy = false;
      });
    }
  }

  /**
   * 处理杠。
   * @param cardId 牌。
   * @param type 杠的类型。
   */
  private async _handleGang(cardId: number, type: GangType) {
    this._busy = true;
    let cmd: string;
    if (type === GangType.Ming) {
      cmd = `${cache.route}:game/mingGang`;
    } else if (type === GangType.Bu) {
      cmd = `${cache.route}:game/buGang`;
    } else if (type === GangType.An) {
      cmd = `${cache.route}:game/anGang`;
    } else {
      throw new Error(`unknown gang type ${type}`);
    }
    try {
      var res = await cache.cmd.execCmd(cmd, {
        roomId: cache.roomId,
        cardId
      });
    } catch (err) {
      cc.error(err);
    } finally {
      this._busy = false;
      this.hide();
    }
    if (res.err !== undefined) {
      cc.warn(`res.err is: ${res.err}`);
      if (res.err === 2 || res.err === 3) {
        uiTools.fireEvent(this.node, 'notFoundRoom', undefined, true);
      }
    }
  }

  /**
   * 点击杠的处理。
   * @param evn 事件。
   */
  onClickGang(evn: cc.Event) {
    evn.stopPropagation();
    if (this._option && this._option.gang.length > 0) {

      // 超过一个杠则需要提示用户进行选择，否则直接发出请求。
      if (this._option.gang.length > 1) {
        if (this.selectGangUi) {
          if (this.selectGangUi.visible()) {
            this.selectGangUi.node.off('selected', this._selectGangHander);
            this.selectGangUi.hide();
          } else {
            let cardIds: CardId[] = [];
            for (let gang of this._option.gang) {
              cardIds.push(gang.cardId);
            }
            this.selectGangUi.setup(cardIds[0], cardIds[1], cardIds[2]);
            this.selectGangUi.show();
            this.selectGangUi.node.on('selected', this._selectGangHander);
          }
        }
      } else {
        if (!this._busy) {
          let gang = this._option.gang[0];
          this._handleGang(gang.cardId, gang.type);
        }
      }
    }
  }

  /**
   * 选择了杠的处理。
   * @param evn 事件。
   */
  private _onSelectGang(evn: cc.Event) {
    evn.stopPropagation();
    let cardId: CardId | undefined = uiTools.getEventUserData(evn);
    if (cardId !== undefined) {
      this.onSelectGang(cardId);
    }
  }

  /**
   * 选择了杠的处理。
   * @param cardId 牌。
   */
  onSelectGang(cardId: CardId) {
    if (this.selectGangUi) {
      if (this._option) {
        for (let gang of this._option.gang) {
          if (gang.cardId === cardId) {
            if (!this._busy) {
              this._handleGang(gang.cardId, gang.type);
            }
            break;
          }
        }
      }
    }
  }

  /**
   * 点击胡的处理。
   * @param evn 事件。
   */
  onClickHu(evn: cc.Event) {
    evn.stopPropagation();
    if (this._option && this._option.huType !== HuType.None && !this._busy) {
      this._busy = true;
      let cmd: string;
      if (this._option.huType === HuType.DianPao) {
        cmd = `${cache.route}:game/dianPaoHu`;
      } else if (this._option.huType === HuType.QiangGang) {
        cmd = `${cache.route}:game/qiangGangHu`;
      } else if (this._option.huType === HuType.ZiMo) {
        cmd = `${cache.route}:game/ziMoHu`;
      } else {
        throw new Error(`unknown hu type ${this._option.huType}`);
      }
      cache.cmd.execCmd(cmd, {
        roomId: cache.roomId
      }).then((res) => {
        this.hide();
        if (res.err !== undefined) {
          cc.warn(`res.err is: ${res.err}`);
          if (res.err === 2 || res.err === 3) {
            uiTools.fireEvent(this.node, 'notFoundRoom', undefined, true);
          }
        }
      }).catch((err) => {
        cc.error(err);
      }).then(() => {
        this._busy = false;
      });
    }
  }

  /**
   * 点击过的处理。
   * @param evn 事件。
   */
  onClickGuo(evn: cc.Event) {
    evn.stopPropagation();
    if (this._option && !this._busy) {
      if (this._option.sendPass) {
        this._busy = true;
        cache.cmd.execCmd(`${cache.route}:game/pass`, {
          roomId: cache.roomId
        }).then((res) => {
          this.hide();
          if (res.err !== undefined) {
            cc.warn(`res.err is: ${res.err}`);
            if (res.err === 2 || res.err === 3) {
              uiTools.fireEvent(this.node, 'notFoundRoom', undefined, true);
            }
          }
        }).catch((err) => {
          cc.error(err);
        }).then(() => {
          this._busy = false;
        });
      } else {
        uiTools.fireEvent(this.node, 'pass', undefined, false);
        this.hide();
      }
    }
  }
}