import uiTools from '../model/ui/tools';
import cache from '../model/cache';
import { CmdClient } from '../model/network/cmd';
import Room from './room';

const { ccclass, property } = cc._decorator;

/**
 * 游戏入口。
 */
@ccclass
export default class Entrance extends cc.Component {

  /**
   * 注册按钮。
   */
  @property(cc.Node)
  registerNode: cc.Node = null;

  /**
   * 登入按钮。
   */
  @property(cc.Node)
  loginNode: cc.Node = null;

  onLoad() {
    if (this.registerNode) {
      let busy = false;
      this.registerNode.on(cc.Node.EventType.TOUCH_END, (evn) => {
        if (!busy) {
          busy = true;
          try {
            evn.stopPropagation();
            this.onClickRegister();
          } catch (err) {
            cc.error(err);
          } finally {
            busy = false;
          }
        }
      });
    }
    if (this.loginNode) {
      let busy = false;
      this.loginNode.on(cc.Node.EventType.TOUCH_END, (evn) => {
        if (!busy) {
          busy = true;
          try {
            evn.stopPropagation();
            this.onClickLogin();
          } catch (err) {
            cc.error(err);
          } finally {
            busy = false;
          }
        }
      });
    }
  }

  /**
   * 点击注册按钮。
   */
  onClickRegister() {
    uiTools.openWindow('prefab/register').then((node: cc.Node) => {
    }).catch((err) => {
      cc.error(err);
    });
  }

  /**
   * 点击登入按钮。
   */
  onClickLogin() {
    uiTools.openWindow('prefab/login').then((node: cc.Node) => {
      node.once('closed', (evn: cc.Event) => {
        if (uiTools.getEventUserData(evn)) {
          this._loadUserInfo();
        }
      });
    }).catch((err) => {
      cc.error(err);
    });
  }

  private async _loadUserInfo() {
    let res = await cache.cmd.execCmd('user/queryState', {
      gameId: cache.gameId
    });
    if (res.err !== undefined) {
      if (res.err === 1) {
        uiTools.toast('内部错误');
      } else {
        uiTools.toast('未知错误');
      }
      return;
    }
    let state = res.state;
    let uid = res.uid;
    cache.uid = uid;
    if (state === 1) {  // 还未创建账号。

      // 创角。
      let name = `游客${uid}`;
      let icon = '0';  //TODO 随机选择一个头像。
      let res2 = await cache.cmd.execCmd('user/create', { name, icon });
      if (res2.err !== undefined) {
        uiTools.toast('未知错误');
        return;
      }

      // 进入大厅。
      try {
        await uiTools.openWindow('prefab/hall');
      } catch (err) {
        cc.error(err);
      }

    } else if (state === 2) {  // 空闲。

      // 进入大厅。
      try {
        await uiTools.openWindow('prefab/hall');
      } catch (err) {
        cc.error(err);
      }

    } else if (state === 3) {  // 在某个房间内。

      // 查询我所在的房间信息。
      let res2 = await cache.cmd.execCmd('room/queryMine', {
        gameId: cache.gameId
      });
      if (res2.err !== undefined) {
        uiTools.toast('未知错误');
        return;
      }
      cache.roomId = res2.id;
      cache.route = res2.route;

      // 不存在游戏路由则进入房间，否则进入游戏。
      if (cache.route === '') {
        try {
          var node = await uiTools.openWindow('prefab/room');
        } catch (err) {
          cc.error(err);
          return;
        }
        let c = node.getComponent(Room);
        if (c) {
          c.setRoomInfo(res2);
        }
      } else {
        try {
          await uiTools.openWindow('prefab/game');
        } catch (err) {
          cc.error(err);
          return;
        }
      }
    }
  }
}