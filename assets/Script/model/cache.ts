import { CmdClient } from './network/cmd';

namespace cache {
  /**
   * 游戏ID。
   */
  export let gameId = 'mj1';

  /**
   * 当前已建立的连接（如果没有已建立的连接，那么此值为undefined。
   */
  export let cmd: CmdClient | undefined;

  /**
   * 网络通知事件。
   */
  export let notifyEvent = new cc.EventTarget();

  /**
   * 其他事件。
   */
  export let otherEvent = new cc.EventTarget();

  /**
   * 所在的房间（每当进入房间时设置，或上线后发现在房间内则设置，离开房间或销毁房间时并不重置为空串）。
   */
  export let roomId = '';

  /**
   * 牌局的路由（非空串表示自己在牌局中）。
   */
  export let route = '';

  /**
   * 用户ID（如果还未登入，此值为undefined）。
   */
  export let uid: number | undefined;

  /**
   * 昵称。
   */
  export let name: string | undefined;

  /**
   * 头像。
   */
  export let icon: string | undefined;

  /**
   * 豆。
   */
  export let bean: number | undefined;
}

export default cache;