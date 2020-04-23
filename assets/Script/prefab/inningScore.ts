import cache from '../model/cache';
import { fromDirChar, Direction } from '../model/game/concept';
import ScoreListItem from './game/score/scoreListItem';

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
   * 列表项预制体。
   */
  @property(cc.Prefab)
  listItemPrefab: cc.Prefab = null;

  private _destroyed = false;

  onLoad() {

    // 查询。
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
        if (this.listItemPrefab) {
          let eastSum = 0;
          let northSum = 0;
          let westSum = 0;
          let southSum = 0;
          let sumNode = cc.instantiate(this.listItemPrefab);
          this.containerNode.addChild(sumNode);
          for (let n = 0; n < res.innings.length; ++n) {
            //TODO 添加分割线。
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
      }).catch((err) => {
        cc.error(err);
      });
    }
  }

  onDestroy() {
    this._destroyed = true;
  }
}