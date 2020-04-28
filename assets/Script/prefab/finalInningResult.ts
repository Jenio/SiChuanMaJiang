import FResUserInfo from './game/fresult/fresUserInfo';
import uiTools from '../model/ui/tools';
import InningScore from './inningScore';
import { FinishAllInningsNotify } from '../model/game/msgs/common';
import { fromDirChar, Direction } from '../model/game/concept';

const { ccclass, property } = cc._decorator;

/**
 * 最终对局结果。
 */
@ccclass
export default class FinalInningResult extends cc.Component {

  /**
   * 东方用户信息。
   */
  @property(FResUserInfo)
  eastUserInfo: FResUserInfo = null;

  /**
   * 北方用户信息。
   */
  @property(FResUserInfo)
  northUserInfo: FResUserInfo = null;

  /**
   * 西方用户信息。
   */
  @property(FResUserInfo)
  westUserInfo: FResUserInfo = null;

  /**
   * 南方用户信息。
   */
  @property(FResUserInfo)
  southUserInfo: FResUserInfo = null;

  private _res?: FinishAllInningsNotify;

  private _eastName?: string;
  private _eastIcon?: string;
  private _northName?: string;
  private _northIcon?: string;
  private _westName?: string;
  private _westIcon?: string;
  private _southName?: string;
  private _southIcon?: string;

  /**
   * 设置。
   * @param eastName 东方玩家昵称。
   * @param eastIcon 东方玩家头像。
   * @param northName 北方玩家昵称。
   * @param northIcon 北方玩家头像。
   * @param westName 西方玩家昵称。
   * @param westIcon 西方玩家头像。
   * @param southName 南方玩家昵称。
   * @param southIcon 南方玩家头像。
   * @param res 总结算数据，不传时会向服务端发起查询。
   */
  setup(eastName: string, eastIcon: string, northName: string, northIcon: string, westName: string, westIcon: string, southName: string, southIcon: string, res?: FinishAllInningsNotify) {
    this._eastName = eastName;
    this._eastIcon = eastIcon;
    this._northName = northName;
    this._northIcon = northIcon;
    this._westName = westName;
    this._westIcon = westIcon;
    this._southName = southName;
    this._southIcon = southIcon;
    this._res = res;

    let eastScore = 0;
    let northScore = 0;
    let westScore = 0;
    let southScore = 0;
    for (let inning of res.innings) {
      for (let player of inning.players) {
        let dir = fromDirChar(player.dir);
        if (dir === Direction.East) {
          if (eastName === '') {
            eastName = player.name;
          }
          if (eastIcon === '') {
            eastIcon = player.icon;
          }
          eastScore += player.score;
        } else if (dir === Direction.North) {
          if (northName === '') {
            northName = player.name;
          }
          if (northIcon === '') {
            northIcon = player.icon;
          }
          northScore += player.score;
        } else if (dir === Direction.West) {
          if (westName === '') {
            westName = player.name;
          }
          if (westIcon === '') {
            westIcon = player.icon;
          }
          westScore += player.score;
        } else if (dir === Direction.South) {
          if (southName === '') {
            southName = player.name;
          }
          if (southIcon === '') {
            southIcon = player.icon;
          }
          southScore += player.score;
        }
      }
    }

    if (this.eastUserInfo) {
      this.eastUserInfo.setup(eastName, eastIcon, Direction.East, eastScore);
    }
    if (this.northUserInfo) {
      this.northUserInfo.setup(northName, northIcon, Direction.North, northScore);
    }
    if (this.westUserInfo) {
      this.westUserInfo.setup(westName, westIcon, Direction.West, westScore);
    }
    if (this.southUserInfo) {
      this.southUserInfo.setup(southName, southIcon, Direction.South, southScore);
    }
  }

  /**
   * 点击对局流水按钮的处理。
   * @param evn 事件。
   */
  onClickInningScore(evn: cc.Event) {
    evn.stopPropagation();

    uiTools.openWindow('prefab/inningScore').then((node) => {
      let c = node.getComponent(InningScore);
      if (c) {
        c.setup(this._eastName, this._eastIcon, this._northName, this._northIcon, this._westName, this._westIcon, this._southName, this._southIcon, this._res);
      }
    }).catch((err) => {
    });
  }
}