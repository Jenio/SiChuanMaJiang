import { Map } from '../map';
import encoding from './encoding';

export class CmdClient {

  private _offlineQueue: Map<number, (cancel: boolean, sn: number) => void>;
  private _pendingCmd: Map<number, (data: any | string) => void>;
  private _notifyCallbacks: Map<string, (data: any) => void>;
  private _unknownNotifyCallback?: (notify: string, data: any) => void;
  private _closedCallback?: () => void;
  private _nextSn: number;
  private _ws: WebSocket;
  private _ssl: boolean;
  private _disableReconnect = false;

  constructor(private _host: string, private _port: number, private _reconnect: boolean, ssl?: boolean) {
    this._offlineQueue = new Map();
    this._pendingCmd = new Map();
    this._notifyCallbacks = new Map();
    this._nextSn = 0;
    this._ws = null;
    this._ssl = !!ssl;
  }

  private _allocSn(): number {
    let sn = this._nextSn;
    this._nextSn += 1;
    return sn;
  }

  private _clear() {
    this._pendingCmd.forEach((handler: (data: string | any) => void) => {
      handler(undefined);
    });
    this._pendingCmd.clear();
    this._offlineQueue.forEach((handler: (cancel: boolean, sn: number) => void, sn: number) => {
      handler(true, sn);
    });
    this._offlineQueue.clear();
  }

  private _prepareConnection() {
    if (!this._ws) {
      if (this._ssl) {
        this._ws = new WebSocket(`wss://${this._host}:${this._port}`);
      } else {
        this._ws = new WebSocket(`ws://${this._host}:${this._port}`);
      }

      let closedCallbackCalled = false;
      this._ws.binaryType = 'arraybuffer';
      this._ws.onopen = () => {
        this._offlineQueue.forEach((handler: (cancel: boolean, sn: number) => void, sn: number) => {
          handler(false, sn);
        });
        this._offlineQueue.clear();
      };

      this._ws.onerror = (err) => {
        cc.error('onerror', err);
        this._clear();
      };

      this._ws.onclose = () => {
        cc.log('Connection closed.');
        this._clear();
        if (this._ws) {
          this._ws.close();
        }
        this._ws = null;
        if (this._closedCallback && !closedCallbackCalled) {
          closedCallbackCalled = true;
          this._closedCallback();
        }
        if (this._reconnect && !this._disableReconnect) {
          setTimeout(() => {
            this._prepareConnection();
          });
        }
      };

      this._ws.onmessage = (ev) => {
        cc.log('message come:',ev)

        let data = ev.data;
        if (data instanceof ArrayBuffer) {
          let view = new DataView(data);
          let type = view.getUint8(0);
          if (type === 0 || type === 1) {
            let sn = view.getUint32(1, false);
            let callback = this._pendingCmd.get(sn);
            if (callback) {
              this._pendingCmd.delete(sn);
              try {
                if (type === 1) {
                  callback(encoding.utf8ToStr(view, 5));
                } else {
                  callback(JSON.parse(encoding.utf8ToStr(view, 5)));
                }
              } catch (e) {
                callback(e.toString());
              }
            } else {
              cc.warn('Callback not found');
            }
          } else if (type === 2) {
            let cmdSize = view.getUint32(1, false);
            let cmd = encoding.utf8ToStr(view, 5, cmdSize);
            let callback = this._notifyCallbacks.get(cmd)
            if (callback) {
              try {
                callback(JSON.parse(encoding.utf8ToStr(view, 5 + cmdSize)));
              } catch (e) {
                cc.warn(e);
              }
            } else if (this._unknownNotifyCallback) {
              try {
                this._unknownNotifyCallback(cmd, JSON.parse(encoding.utf8ToStr(view, 5 + cmdSize)));
              } catch (e) {
                cc.warn(e);
              }
            }
          } else {
            cc.warn(`Unknown type: ${type}`);
          }
        } else {
          cc.error('Data is not instance of ArrayBuffer, this is a fatal error');
        }
      };
    }
  }

  bind(notify: string, cb: (data: any) => void) {
    this._notifyCallbacks.set(notify, cb);
  }

  unbind(notify: string) {
    this._notifyCallbacks.delete(notify);
  }

  exists(notify: string) {
    return this._notifyCallbacks.has(notify);
  }

  bindUnknown(cb: (notify: string, data: any) => void) {
    this._unknownNotifyCallback = cb;
  }

  unbindUnknown() {
    this._unknownNotifyCallback = undefined;
  }

  bindClosed(cb: () => void) {
    this._closedCallback = cb;
  }

  unbindClosed() {
    this._closedCallback = undefined;
  }

  async execCmd(cmd: string, params: any): Promise<any> {
    //logger.info(`execCmd(${cmd}, ${JSON.stringify(params)})`);
    if (this._ws && this._ws.readyState === this._ws.OPEN) {
      //logger.info(`web socket ready.`);
      return new Promise((res, rej) => {
        let sn = this._allocSn();
        this._pendingCmd.set(sn, (data: any) => {
          /*
          if (data === undefined) {
            // close的时候会触发这里的undefined。
            rej(data);
            return;
          }
          */

          cc.log(`this._pendingCmd.set(sn, (${JSON.stringify(data)}: any) => {,`)
          let t = typeof data;
          if (t === 'object') {
            res(data);
          } else if (t === 'string') {
            rej(data);
          } else {
            rej('Network error');
          }
        });
        this._sendCmd(sn, cmd, params);
      });
    } else {
      //logger.info(`web socket not ready.`);
      this._prepareConnection();
      return new Promise((res, rej) => {
        this._offlineQueue.set(this._allocSn(), (cancel: boolean, sn: number) => {
          if (cancel) {
            rej('Network error');
          } else {
            res(new Promise((res2, rej2) => {
              this._pendingCmd.set(sn, (data: any) => {
                let t = typeof data;
                if (t === 'object') {
                  res2(data);
                } else if (t === 'string') {
                  rej2(data);
                } else {
                  rej2('Network error');
                }
              });
              this._sendCmd(sn, cmd, params);
            }));
          }
        });
      });
    }
  }

  private _sendCmd(sn: number, cmd: string, params: any) {
    //logger.info(`_sendCmd(${sn}, ${cmd}, ${JSON.stringify(params)})`);
    //TODO 如果命令长度超过255则需要错误处理。
    let cmdData = encoding.strToUtf8(cmd);
    let cmdByteLength = cmdData.length;
    let paramData = encoding.strToUtf8(JSON.stringify(params));
    let paramsByteLength = paramData.length;
    let buff = new ArrayBuffer(5 + cmdByteLength + paramsByteLength);
    let view = new DataView(buff);
    view.setUint32(0, sn, false);
    view.setUint8(4, cmdByteLength);
    let offset = 5;
    for (let v of cmdData) {
      view.setUint8(offset++, v);
    }
    for (let v of paramData) {
      view.setUint8(offset++, v);
    }
    if (this._ws) {
      this._ws.send(buff);
    }
  }

  close() {
    if (this._ws !== null) {
      this._disableReconnect = true;
      this._ws.close();
    }
  }
}