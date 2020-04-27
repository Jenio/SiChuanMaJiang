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

  /**
   * 设置。
   * @param res 最终对局结果。
   */
  setup(res: FinishAllInningsNotify) {
    this._res = res;

    let eastName = '';
    let eastIcon = '';
    let eastScore = 0;
    let northName = '';
    let northIcon = '';
    let northScore = 0;
    let westName = '';
    let westIcon = '';
    let westScore = 0;
    let southName = '';
    let southIcon = '';
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
        c.setup2(this._res);
      }
    }).catch((err) => {
    });
  }
}