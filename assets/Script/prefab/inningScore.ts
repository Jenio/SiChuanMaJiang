import cache from '../model/cache';
import { fromDirChar, Direction } from '../model/game/concept';
import ScoreListItem from './game/score/scoreListItem';
import ScoreUserInfo from './game/score/scoreUserInfo';
import { FinishAllInningsNotify } from '../model/game/msgs/common';

const { ccclass, property } = cc._decorator;

/**
 * 对局流水界面。
 */
@ccclass
export default class InningScore extends cc.Component {

  /**
   * 容器节点。
   */
  @property(cc.Node)
  containerNode: cc.Node = null;

  /**
   * 东方用户信息。
   */
  @property(ScoreUserInfo)
  eastUserInfo: ScoreUserInfo = null;

  /**
   * 北方用户信息。
   */
  @property(ScoreUserInfo)
  northUserInfo: ScoreUserInfo = null;

  /**
   * 西方用户信息。
   */
  @property(ScoreUserInfo)
  westUserInfo: ScoreUserInfo = null;

  /**
   * 南方用户信息。
   */
  @property(ScoreUserInfo)
  southUserInfo: ScoreUserInfo = null;

  /**
   * 列表项预制体。
   */
  @property(cc.Prefab)
  listItemPrefab: cc.Prefab = null;

  /**
   * 列表项分割线预制体。
   */
  @property(cc.Prefab)
  listItemSepLinePrefab: cc.Prefab = null;

  private _destroyed = false;

  onDestroy() {
    this._destroyed = true;
  }

  /**
   * 更新界面。
   * @param res 结果信息。
   * @param includeUserInfo 是否更新用户信息的显示。
   */
  private _update(res: FinishAllInningsNotify, includeUserInfo: boolean) {
    if (includeUserInfo) {
      for (let inning of res.innings) {
        for (let p of inning.players) {
          let dir = fromDirChar(p.dir);
          if (dir === Direction.East) {
            if (this.eastUserInfo) {
              this.eastUserInfo.setup(Direction.East, p.name, p.icon);
            }
          } else if (dir === Direction.North) {
            if (this.northUserInfo) {
              this.northUserInfo.setup(Direction.East, p.name, p.icon);
            }
          } else if (dir === Direction.West) {
            if (this.westUserInfo) {
              this.westUserInfo.setup(Direction.East, p.name, p.icon);
            }
          } else if (dir === Direction.South) {
            if (this.southUserInfo) {
              this.southUserInfo.setup(Direction.East, p.name, p.icon);
            }
          }
        }
      }
    }
    if (this.listItemPrefab) {
      let eastSum = 0;
      let northSum = 0;
      let westSum = 0;
      let southSum = 0;
      let sumNode = cc.instantiate(this.listItemPrefab);
      this.containerNode.addChild(sumNode);
      for (let n = 0; n < res.innings.length; ++n) {

        // 添加分割线。
        if (this.listItemSepLinePrefab) {
          let node = cc.instantiate(this.listItemSepLinePrefab);
          this.containerNode.addChild(node);
        }

        let inning = res.innings[n];
        let eastScore = 0;
        let northScore = 0;
        let westScore = 0;
        let southScore = 0;
        for (let p of inning.players) {
          let dir = fromDirChar(p.dir);
          let score: number = p.score;
          if (dir === Direction.East) {
            eastScore = score;
          } else if (dir === Direction.North) {
            northScore = score;
          } else if (dir === Direction.West) {
            westScore = score;
          } else if (dir === Direction.South) {
            southScore = score;
          }
        }
        eastSum += eastScore;
        northSum += northScore;
        westSum += westScore;
        southSum += southScore;
        let node = cc.instantiate(this.listItemPrefab);
        this.containerNode.addChild(node);
        let c = node.getComponent(ScoreListItem);
        if (c) {
          c.setup(n, eastScore, northScore, westScore, southScore);
        }
      }
      let c = sumNode.getComponent(ScoreListItem);
      if (c) {
        c.setup(-1, eastSum, northSum, westSum, southSum);
      }
    }
  }

  private _query() {
    if (this.containerNode) {
      cache.cmd.execCmd(`${cache.route}:game/queryScore`, {
        roomId: cache.roomId
      }).then((res) => {
        if (this._destroyed) {
          return;
        }
        if (res.err !== undefined) {
          cc.warn(`res.err is: ${res.err}`);
          return;
        }
        this._update(res, false);
      }).catch((err) => {
        cc.error(err);
      });
    }
  }

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
   */
  setup(eastName: string, eastIcon: string, northName: string, northIcon: string, westName: string, westIcon: string, southName: string, southIcon: string) {
    if (this.eastUserInfo) {
      this.eastUserInfo.setup(Direction.East, eastName, eastIcon);
    }
    if (this.northUserInfo) {
      this.northUserInfo.setup(Direction.North, northName, northIcon);
    }
    if (this.westUserInfo) {
      this.westUserInfo.setup(Direction.West, westName, westIcon);
    }
    if (this.southUserInfo) {
      this.southUserInfo.setup(Direction.South, southName, southIcon);
    }
    this._query();
  }

  /**
   * 设置。
   * @param res 对局详情。
   */
  setup2(res: FinishAllInningsNotify) {
    this._update(res, true);
  }
}