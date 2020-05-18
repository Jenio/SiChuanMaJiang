import uiTools from './ui/tools';
import cache from './cache';
import { CmdClient } from './network/cmd';
import Room from '../prefab/room';
import { gacDetectAndPrepare } from './sdk/gac';

const { ccclass, property } = cc._decorator;

class TokenExpiredError extends Error {
}

@ccclass
export default class Main extends cc.Component {

  /**
   * 加载节点（当切入其他界面时隐藏）。
   */
  @property(cc.Node)
  loadingNode: cc.Node = null;

  /**
   * 进度条。
   */
  @property(cc.ProgressBar)
  progressBar: cc.ProgressBar = null;

  /**
   * 加载进入文本框。
   */
  @property(cc.Label)
  loadingProgressLabel: cc.Label = null;

  /**
   * 登入。
   * @param host 主机地址。
   * @param port 端口。
   * @param channel 渠道。
   * @param acc 账号。
   * @param token 令牌。
   * @param toast 是否在出错或成功时提示。
   */
  private async _login(host: string, port: number, channel: string, acc: string, token: string, toast: boolean): Promise<CmdClient | undefined> {
    let cmd = new CmdClient(host, port, false);

    // 登入。
    try {
      var res = await cmd.execCmd('route/bind', {
        channel,
        acc,
        token
      });
    } catch (err) {
      cmd.close();
      cmd = undefined;
      if (toast) {
        uiTools.toast('无法连接到服务器');
      }
      return undefined;
    }
    if (res.err !== undefined) {
      cmd.close();
      cmd = undefined;

      // 凭证已过期则抛特定的异常。
      if (res.err === 6) {
        throw new TokenExpiredError('凭证已过期');
      }

      if (toast) {
        let tips = {
          1: '参数错误',
          2: '指定的账号不存在',
          3: '不支持的渠道',
          4: '验证失败',
          5: '未知错误',
          7: 'DAPP已删除',
          8: '外部服务错误'
        };
        let tip = tips[res.err];
        if (tip === undefined) {
          tip = '未知错误';
        }
        uiTools.toast(tip);
      }
      return undefined;
    }
    if (toast) {
      uiTools.toast('登入成功');
    }
    return cmd;
  }

  /**
   * 青苹果方式登入。
   * @param token 临时登入凭证。
   */
  private async _loginGac(token: string) {

    // 记录token到缓存。
    cc.sys.localStorage.setItem('tk', token);

    // 登入。
    try {
      var cmd = await this._login(cache.testServerIp, cache.port, 'gac', '', token, true);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        cc.log('凭证已过期');
        cc.sys.localStorage.removeItem('tk');

        // 发出结束重连事件。
        this.scheduleOnce(() => {
          cache.otherEvent.emit('tokenExpiredAndLoginRetryStopped');
        });
      }
    }
    if (!cmd) {
      return;
    }

    // 记录连接。
    let initCache = (cmd: CmdClient) => {
      let retry = async () => {
        try {
          var cmd2 = await this._login(cache.testServerIp, cache.port, 'gac', '', token, false);
        } catch (err) {
          if (err instanceof TokenExpiredError) {
            cc.log('凭证已过期');
            cc.sys.localStorage.removeItem('tk');

            // 发出结束重连事件。
            cache.otherEvent.emit('tokenExpiredAndLoginRetryStopped');

            return;  // 这会终止重连循环。
          } else {
            cc.error(err);
          }
        }
        if (!cmd2) {
          cc.error('重连失败。');
          retry();
          return;
        }
        cc.log('重连完成。');
        uiTools.toast('重连完成');
        initCache(cmd2);
        cache.cmd = cmd2;
        cache.otherEvent.emit('newClient');
      };
      cmd.bindClosed(() => {
        cmd.unbindUnknown();
        retry();
      });
      cmd.bindUnknown((notify, data) => {
        cache.notifyEvent.emit(notify, data);
      });
    };
    initCache(cmd);
    cache.cmd = cmd;

    // 查询并更新设置。
    let res = await cache.cmd.execCmd('user/queryConfig', {});
    if (res.err === undefined) {
      cache.musicOn = res.musicOn;
      cache.soundOn = res.soundOn;
    }

    // 切换界面。
    let res2 = await cache.cmd.execCmd('user/queryState', {
      gameId: cache.gameId
    });
    if (res2.err !== undefined) {
      if (res2.err === 1) {
        uiTools.toast('内部错误');
      } else {
        uiTools.toast('未知错误');
      }
      return;
    }
    let state = res2.state;
    let uid = res2.uid;
    cache.uid = uid;
    if (state === 2) {  // 空闲。

      // 进入大厅。
      try {
        await uiTools.openWindow('prefab/hall');
      } catch (err) {
        cc.error(err);
      }
      if (this.loadingNode) {
        this.loadingNode.active = false;
      }

    } else if (state === 3) {  // 在某个房间内。

      // 查询我所在的房间信息。
      let res3 = await cache.cmd.execCmd('room/queryMine', {
        gameId: cache.gameId
      });
      if (res3.err !== undefined) {
        uiTools.toast('未知错误');
        return;
      }
      cache.roomId = res3.id;
      cache.route = res3.route;

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
          c.setRoomInfo(res3);
        }
        if (this.loadingNode) {
          this.loadingNode.active = false;
        }
      } else {
        try {
          await uiTools.openWindow('prefab/game');
        } catch (err) {
          cc.error(err);
          return;
        }
        if (this.loadingNode) {
          this.loadingNode.active = false;
        }
      }
    }
  }

  onLoad() {
    cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);

    if (this.progressBar) {
      this.progressBar.node.active = true;

      let oldProgress = 0;
      cc.loader.loadRes('prefab/all', cc.Prefab, (curr, total, item) => {
        cc.log(`progress: ${item.queueId}, ${curr}/${total}`);
        let newProgress = curr / total;
        if (newProgress > oldProgress) {
          this.progressBar.progress = newProgress;
          oldProgress = newProgress;
          if (this.loadingProgressLabel) {
            this.loadingProgressLabel.string = Math.round(newProgress * 100).toString();
          }
        }
      }, (err, prefab) => {
        this.progressBar.node.active = false;
        if (err) {
          cc.log(err);
          return;
        }

        // 尝试使用青苹果钱包。
        cache.gacSdk = gacDetectAndPrepare();
        if (cache.gacSdk) {
          cache.sdkEvent.once('gacLogin', (token: string) => {
            this._loginGac(token).then(() => {

              // 登入成功后的额外处理。
              if (cache.cmd) {

                (async () => {

                  // 跟踪遗留的订单。
                  let str = cc.sys.localStorage.getItem('payingOrders2');
                  if (str) {
                    let orders: string[] | undefined;
                    try {
                      orders = JSON.parse(str);
                    } catch (err) {
                    }
                    if (orders instanceof Array) {
                      try {
                        for (let orderId of orders) {
                          let res = await cache.cmd.execCmd('gacPay/traceOrder', { orderId });

                          // 如果已成功跟踪则从缓存中删除。
                          if (res.err === undefined) {
                            let str2 = cc.sys.localStorage.getItem('payingOrders2');
                            if (str2) {
                              let orders2: string[] | undefined;
                              try {
                                orders2 = JSON.parse(str2);
                              } catch (err) {
                              }
                              if (orders2 instanceof Array) {
                                let idx = orders2.indexOf(orderId);
                                if (idx >= 0) {
                                  orders2.splice(idx, 1);
                                  if (orders2.length > 0) {
                                    cc.sys.localStorage.setItem('payingOrders2', JSON.stringify(orders2));
                                  } else {
                                    cc.sys.localStorage.removeItem('payingOrders2');
                                  }
                                }
                              }
                            }
                          }
                        }
                      } catch (err) {
                        cc.error(err);
                      }
                    }
                  }

                  // 尝试接收已完成的订单的商品（类似于收邮件一次）。
                  try {
                    await cache.cmd.execCmd('gacPay/receive', {});
                  } catch (err) {
                    cc.error(err);
                  }

                })();

              }

            });
          });
          cache.otherEvent.on('tokenExpiredAndLoginRetryStopped', () => {
            cache.gacSdk.getTemporaryCode(cache.appId);
          });
          let token = cc.sys.localStorage.getItem('tk');
          if (token) {
            cache.sdkEvent.emit('gacLogin', token);
          } else {
            cache.gacSdk.getTemporaryCode(cache.appId);
          }
          return;
        }

        // 不存在SDK的情况，使用自有系统入口。
        uiTools.openWindow('prefab/entrance').then((node: cc.Node) => {
          if (this.loadingNode) {
            this.loadingNode.active = false;
          }
        }).catch((err) => {
          cc.error(err);
        });
      });
    }

  }
}