import cache from '../model/cache';
import uiTools from '../model/ui/tools';
import HisRecord from './game/his/hisRecord';

const { ccclass, property } = cc._decorator;

/**
 * 对局历史（战绩）界面。
 */
@ccclass
export default class InningHis extends cc.Component {

  /**
   * 滚动窗口。
   */
  @property(cc.ScrollView)
  scrollView: cc.ScrollView = null;

  /**
   * 记录预制体。
   */
  @property(cc.Prefab)
  recordPrefab: cc.Prefab = null;

  /**
   * 分割线预制体。
   */
  @property(cc.Prefab)
  separatorPrefab: cc.Prefab = null;

  /**
   * 下一个查询位置。
   */
  private _next?: number;

  private _querying = false;
  private _destroyed = false;

  onDestroy() {
    this._destroyed = true;
  }

  start() {
    this._querying = true;
    this._queryNextPage().catch((err) => {
      cc.error(err);
    }).then(() => {
      this._querying = false;
    });
  }

  /**
   * 查询下一页。
   */
  private async _queryNextPage() {
    let res = await cache.cmd.execCmd('user/queryGameRecord', {
      gameId: cache.gameId,
      from: this._next
    });
    if (this._destroyed) {
      return;
    }
    if (res.err !== undefined) {
      uiTools.toast('查询错误');
      return;
    }
    this._next = res.next;
    if (this.scrollView && this.scrollView.content && this.recordPrefab) {
      for (let r of res.list) {
        if (this.scrollView.content.childrenCount > 0) {
          if (this.separatorPrefab) {
            let node = cc.instantiate(this.separatorPrefab);
            this.scrollView.content.addChild(node);
          }
        }
        let node = cc.instantiate(this.recordPrefab);
        let c = node.getComponent(HisRecord);
        if (c) {
          await c.setup(r);
          if (this._destroyed) {
            break;
          }
        }
        this.scrollView.content.addChild(node);
      }
    }
  }

  /**
   * 滚动事件处理。
   */
  onScrollEvent(control: cc.ScrollView, evnType: cc.ScrollView.EventType) {
    if (evnType !== cc.ScrollView.EventType.BOUNCE_BOTTOM) {
      return;
    }
    cc.log('onScrollEvent: BOUNCE_BOTTOM');
    if (this._querying) {
      return;
    }
    this._querying = true;
    this._queryNextPage().catch((err) => {
      cc.error(err);
    }).then(() => {
      this._querying = false;
    });
  }
}