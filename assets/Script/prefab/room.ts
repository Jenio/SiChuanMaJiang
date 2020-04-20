import uiTools from '../model/ui/tools';
import cache from '../model/cache';
import RoomHead from './room/roomHead';

const { ccclass, property } = cc._decorator;

/**
 * 游戏配置。
 */
export interface GameConfig {

  /**
   * 游戏ID。
   */
  gameId: string;

  /**
   * 玩家人数。
   */
  numPlayers: number;

  /**
   * 总局数。
   */
  innings: number;

  /**
   * 基础分。
   */
  baseScore: number;

  /**
   * 具体玩法配置。
   */
  config: {

    /**
     * 是否定缺。
     */
    skipOne: boolean;

    /**
     * 番数限制。
     */
    fanLimit: number;
  }
}

/**
 * 玩家信息。
 */
export interface PlayerInfo {

  /**
   * 用户ID。
   */
  uid: number;

  /**
   * 昵称。
   */
  name: string;

  /**
   * 头像。
   */
  icon: string;

  /**
   * 分数。
   */
  score: number;

  /**
   * 是否在线。
   */
  online: boolean;

  /**
   * 是否就绪。
   */
  ready: boolean;
}

/**
 * 房间信息。
 */
export interface RoomInfo {

  /**
   * 房间ID。
   */
  id: string;

  /**
   * 房主用户ID。
   */
  ownerUid: number;

  /**
   * 游戏配置。
   */
  config: GameConfig;

  /**
   * 玩家列表。
   */
  pis: PlayerInfo[];

  /**
   * 路由，非空串表示对局已开始，且表示进入游戏服务器的路由。
   */
  route: string;
}

/**
 * 房间。
 */
@ccclass
export default class Room extends cc.Component {

  /**
   * 房间ID文本框。
   */
  @property(cc.Label)
  roomIdLabel: cc.Label = null;

  /**
   * 就绪按钮文本图片精灵。
   */
  @property(cc.Sprite)
  readyTxtSprite: cc.Sprite = null;

  /**
   * 离开按钮文本图片精灵。
   */
  @property(cc.Sprite)
  leaveTxtSprite: cc.Sprite = null;

  /**
   * 就绪按钮图片帧。
   */
  @property(cc.SpriteFrame)
  readySpriteFrame: cc.SpriteFrame = null;

  /**
   * 取消就绪按钮图片帧。
   */
  @property(cc.SpriteFrame)
  cancelReadySpriteFrame: cc.SpriteFrame = null;

  /**
   * 离开按钮图片帧。
   */
  @property(cc.SpriteFrame)
  leaveSpriteFrame: cc.SpriteFrame = null;

  /**
   * 解散按钮图片帧。
   */
  @property(cc.SpriteFrame)
  destroySpriteFrame: cc.SpriteFrame = null;

  /**
   * 头像。
   */
  @property(RoomHead)
  roomHeads: RoomHead[] = [];

  /**
   * 房间信息。
   */
  private _ri?: RoomInfo;

  /**
   * onLoad方法是否已被调用。
   */
  private _onLoaded = false;

  private _joinNotifyHandler = this._onJoinNotify.bind(this);
  private _leaveNotifyHandler = this._onLeaveNotify.bind(this);
  private _kickedNotifyHandler = this._onKickedNotify.bind(this);
  private _destroyedByOwnerNotifyHandler = this._onDestroyedByOwnerNotify.bind(this);
  private _readyStateChangedNotifyHandler = this._onReadyStateChangedNotify.bind(this);

  /**
   * 是否房主只读属性。
   */
  get iAmOwner() {
    if (this._ri) {
      return cache.uid === this._ri.ownerUid;
    }
    return false;
  }

  /**
   * 更新房间信息。
   */
  private _updateRoomInfo() {
    if (this._ri) {
      if (this.roomIdLabel) {
        this.roomIdLabel.string = this._ri.id;
      }
      if (this.iAmOwner) {
        if (this.leaveTxtSprite && this.destroySpriteFrame) {
          this.leaveTxtSprite.spriteFrame = this.destroySpriteFrame;
        }
      } else {
        if (this.leaveTxtSprite && this.leaveSpriteFrame) {
          this.leaveTxtSprite.spriteFrame = this.leaveSpriteFrame;
        }
      }
      for (let roomHead of this.roomHeads) {
        roomHead.clearUser();
      }
      for (let n = 0; n < 4; ++n) {
        let ui = this._ri.pis[n];
        if (ui) {
          let roomHead = this.roomHeads[n];
          if (roomHead) {
            roomHead.setUser(ui.uid, ui.uid === this._ri.ownerUid, this.iAmOwner && ui.uid !== cache.uid, ui.ready, ui.name, ui.icon);
          }
        }
      }
    }
  }

  /**
   * 设置房间信息。
   * @param ri 房间信息。
   */
  setRoomInfo(ri: RoomInfo) {
    this._ri = ri;
    cache.roomId = ri.id;
    if (this._onLoaded) {
      this._updateRoomInfo();
    }
  }

  onLoad() {
    this._onLoaded = true;
    this._updateRoomInfo();
    cache.notifyEvent.on('room/joinNotify', this._joinNotifyHandler);
    cache.notifyEvent.on('room/leaveNotify', this._leaveNotifyHandler);
    cache.notifyEvent.on('room/kickedNotify', this._kickedNotifyHandler);
    cache.notifyEvent.on('room/destroyedByOwnerNotify', this._destroyedByOwnerNotifyHandler);
    cache.notifyEvent.on('room/readyStateChangedNotify', this._readyStateChangedNotifyHandler);
    this.node.on('kick', (evn: cc.Event) => {
      let uid = uiTools.getEventUserData(evn);
      this.onKick(uid);
    });
  }

  onDestroy() {
    cache.notifyEvent.off('room/joinNotify', this._joinNotifyHandler);
    cache.notifyEvent.off('room/leaveNotify', this._leaveNotifyHandler);
    cache.notifyEvent.off('room/kickedNotify', this._kickedNotifyHandler);
    cache.notifyEvent.off('room/destroyedByOwnerNotify', this._destroyedByOwnerNotifyHandler);
    cache.notifyEvent.off('room/readyStateChangedNotify', this._readyStateChangedNotifyHandler);
  }

  /**
   * 点击了踢出按钮。
   * @param uid 用户ID。
   */
  onKick(uid: number) {
    cache.cmd.execCmd('room/kick', {
      gameId: cache.gameId,
      targetUid: uid
    }).then((res) => {
      if (res.err !== undefined) {
        let tips = {
          1: '参数错误',
          2: '不能踢出自己',
          3: '玩家不在房间内',
          4: '目标玩家不在房间内',
          5: '没有权限',
          6: '游戏已经开始',
          7: '内部错误'
        };
        let tip = tips[res.err];
        if (tip === undefined) {
          tip = '未知错误';
        }
        uiTools.toast(tip);
        return;
      }
      for (let n = 0; n < this._ri.pis.length; ++n) {
        let ui = this._ri.pis[n];
        if (ui.uid === uid) {
          this._ri.pis.splice(n, 1);
          this._updateRoomInfo();
          break;
        }
      }
    }).catch((err) => {
      cc.error(err);
    });
  }

  /**
   * 点击了离开或解散按钮。
   */
  onLeaveOrDestroy() {
    if (this.iAmOwner) {
      cache.cmd.execCmd('room/destroy', {
        gameId: cache.gameId
      }).then((res) => {
        if (res.err !== undefined) {
          let tips = {
            1: '参数错误',
            2: '玩家不在房间内',
            3: '没有权限',
            4: '游戏已开始，不允许销毁',
            5: '内部错误',
          };
          let tip = tips[res.err];
          if (tip === undefined) {
            tip = '未知错误';
          }
          uiTools.toast(tip);
          return;
        }

        // 打开大厅。
        uiTools.openWindow('prefab/hall').catch((err) => {
          cc.error(err);
        });

        // 关闭窗口。
        uiTools.closeWindow(this.node);

      }).catch((err) => {
        cc.error(err);
      });

    } else {
      cache.cmd.execCmd('room/leave', {
        gameId: cache.gameId
      }).then((res) => {
        if (res.err !== undefined) {
          let tips = {
            1: '参数错误',
            2: '玩家不在房间内',
            3: '没有权限',
            4: '游戏已开始，不允许离开',
            5: '内部错误'
          };
          let tip = tips[res.err];
          if (tip === undefined) {
            tip = '未知错误';
          }
          uiTools.toast(tip);
          return;
        }

        // 打开大厅。
        uiTools.openWindow('prefab/hall').catch((err) => {
          cc.error(err);
        });

        // 关闭窗口。
        uiTools.closeWindow(this.node);

      }).catch((err) => {
        cc.error(err);
      });
    }
  }

  /**
   * 设置或取消就绪。
   */
  onSetOrCancelReady() {

    // 计算新状态。
    let ready: boolean;
    for (let pi of this._ri.pis) {
      if (pi.uid === cache.uid) {
        ready = !pi.ready;
        break;
      }
    }
    if (ready === undefined) {
      return;
    }

    // 变更状态。
    if (ready) {

      // 请求设置就绪。
      cache.cmd.execCmd('room/setReady', {
        gameId: cache.gameId
      }).then((res) => {
        if (res.err !== undefined) {
          let tips = {
            1: '参数错误',
            2: '您不在房间中',
            3: '没有可用的游戏服务器',
            4: '进入游戏失败',
            5: '内部错误'
          };
          let tip = tips[res.err];
          if (tip === undefined) {
            tip = '未知错误';
          }
          uiTools.toast(tip);
          return;
        }

        // 更新数据。
        for (let pi of this._ri.pis) {
          if (pi.uid === cache.uid) {
            pi.ready = ready;
            break;
          }
        }

        // 更新界面。
        if (this.readyTxtSprite && this.cancelReadySpriteFrame) {
          this.readyTxtSprite.spriteFrame = this.cancelReadySpriteFrame;
        }
        for (let roomHead of this.roomHeads) {
          if (!roomHead.empty) {
            if (roomHead.uid === cache.uid) {
              roomHead.setReady();
              break;
            }
          }
        }

        // 如果所有人都就绪了，那么切入游戏。
        if (res.route !== '') {
          cache.route = res.route;

          //TODO 资源加载进度条。
          // 打开游戏窗口。
          uiTools.openWindow('prefab/game').then((node) => {
          }).catch((err) => {
            cc.error(err);
            uiTools.toast('打开游戏界面失败');
          });

          // 关闭本窗口。
          uiTools.closeWindow(this.node);
        }
      }).catch((err) => {
        cc.error(err);
      });
    } else {

      // 请求取消就绪。
      cache.cmd.execCmd('room/cancelReady', {
        gameId: cache.gameId
      }).then((res) => {
        if (res.err !== undefined && res.err !== 3) {  // 3是之前就是未就绪的状态。
          let tips = {
            1: '参数错误',
            2: '您不在房间中',
            4: '游戏已开始',
            5: '内部错误'
          };
          let tip = tips[res.err];
          if (tip === undefined) {
            tip = '未知错误';
          }
          uiTools.toast(tip);
          return;
        }

        // 更新数据。
        for (let pi of this._ri.pis) {
          if (pi.uid === cache.uid) {
            pi.ready = ready;
            break;
          }
        }

        // 更新界面。
        if (this.readyTxtSprite && this.readySpriteFrame) {
          this.readyTxtSprite.spriteFrame = this.readySpriteFrame;
        }
        for (let roomHead of this.roomHeads) {
          if (!roomHead.empty) {
            if (roomHead.uid === cache.uid) {
              roomHead.clearReady();
              break;
            }
          }
        }

      }).catch((err) => {
        cc.error(err);
      });
    }
  }

  private _onJoinNotify(ri: RoomInfo) {
    this.setRoomInfo(ri);
  }

  private _onLeaveNotify(who: {
    roomId: string;
    uid: number;
  }) {
    for (let n = 0; n < this._ri.pis.length; ++n) {
      let pi = this._ri.pis[n];
      if (pi.uid === who.uid) {
        this._ri.pis.splice(n, 1);
        this._updateRoomInfo();
        uiTools.toast(`${pi.name}离开房间`);
        return;
      }
    }
  }

  private _onKickedNotify(who: {
    roomId: string;
    uid: number;
  }) {
    for (let n = 0; n < this._ri.pis.length; ++n) {
      let pi = this._ri.pis[n];
      if (pi.uid === who.uid) {
        this._ri.pis.splice(n, 1);
        this._updateRoomInfo();
        if (pi.uid !== cache.uid) {
          uiTools.toast(`${pi.name}被踢出房间`);
        }

        // 如果是自己被踢出，那么回到大厅界面。
        if (pi.uid === cache.uid) {

          // 打开大厅。
          uiTools.openWindow('prefab/hall').catch((err) => {
            cc.error(err);
          });

          // 关闭窗口。
          uiTools.closeWindow(this.node);

          uiTools.toast('您被房主踢出了房间');
        }

        return;
      }
    }
  }

  private _onDestroyedByOwnerNotify(which: {
    roomId: string;
  }) {

    // 打开大厅。
    uiTools.openWindow('prefab/hall').catch((err) => {
      cc.error(err);
    });

    // 关闭窗口。
    uiTools.closeWindow(this.node);

    uiTools.toast('房主销毁了房间');
  }

  private _onReadyStateChangedNotify(state: {
    roomId: string;
    uid: number;
    ready: boolean;
    route: string;
  }) {
    for (let n = 0; n < this._ri.pis.length; ++n) {
      let pi = this._ri.pis[n];
      if (pi.uid === state.uid) {
        pi.ready = state.ready;

        // 更新界面。
        for (let roomHead of this.roomHeads) {
          if (!roomHead.empty) {
            if (roomHead.uid === pi.uid) {
              if (state.ready) {
                roomHead.setReady();
              } else {
                roomHead.clearReady();
              }
              break;
            }
          }
        }

        // 如果所有人都就绪了，那么切换到牌桌。
        if (state.route !== '') {
          cache.route = state.route;

          //TODO 资源加载进度条。
          // 打开游戏窗口。
          uiTools.openWindow('prefab/game').then((node) => {
          }).catch((err) => {
            cc.error(err);
            uiTools.toast('打开游戏界面失败');
          });

          // 关闭本窗口。
          uiTools.closeWindow(this.node);
        }

        return;
      }
    }
  }
}