import uiTools from '../model/ui/tools';
import { CmdClient } from '../model/network/cmd';
import cache from '../model/cache';

const { ccclass, property } = cc._decorator;

/**
 * 登入。
 */
@ccclass
export default class Login extends cc.Component {

  /**
   * 账号输入框。
   */
  @property(cc.EditBox)
  accEditBox: cc.EditBox = null;

  /**
   * 密码输入框。
   */
  @property(cc.EditBox)
  pwdEditBox: cc.EditBox = null;

  onLoad() {
    if (this.accEditBox) {
      let acc: string | undefined = cc.sys.localStorage.getItem('acc');
      if (acc) {
        this.accEditBox.string = acc;
      }
    }
    if (this.pwdEditBox) {
      let pwd: string | undefined = cc.sys.localStorage.getItem('pwd');
      if (pwd) {
        this.pwdEditBox.string = pwd;
      }
    }
  }

  /**
   * 登入。
   * @param host 主机地址。
   * @param port 端口。
   * @param acc 账号。
   * @param token 令牌。
   * @param toast 是否在出错或成功时提示。
   */
  private async _login(host: string, port: number, acc: string, token: string, toast: boolean): Promise<CmdClient | undefined> {
    let cmd = new CmdClient(host, +port, false);

    // 登入。
    try {
      var res = await cmd.execCmd('route/bind', {
        channel: 'default',
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
      if (toast) {
        let tips = {
          1: '参数错误',
          2: '指定的账号不存在',
          3: '不支持的渠道',
          4: '验证失败',
          5: '未知错误'
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
   * 点击登入按钮。
   */
  async onClickLogin() {
    if (!this.accEditBox || !this.pwdEditBox) {
      return;
    }

    // 获取主机、端口。
    let host: string | undefined = cc.sys.localStorage.getItem('host');
    if (!host) {
      //host = '10.30.1.254';
      host = cache.testServerIp;
      cc.sys.localStorage.setItem('host', host);
    }
    let port: string | undefined = cc.sys.localStorage.getItem('port');
    if (!port) {
      port = cache.port.toString();
      cc.sys.localStorage.setItem('port', port);
    }

    //TODO 请删除以下这行代码。
    //host = cache.localServerIp;

    // 获取界面中输入的信息。
    let acc = this.accEditBox.string;
    if (acc === '') {
      uiTools.toast('必须输入账号');
      return;
    }
    let pwd = this.pwdEditBox.string;
    if (pwd === '') {
      uiTools.toast('必须输入密码');
      return;
    }

    // 关闭旧的连接。
    if (cache.cmd) {
      cache.cmd.unbindClosed();
      cache.cmd.close();
      cache.cmd = undefined;
    }

    // 登入。
    let cmd = await this._login(host, +port, acc, pwd, true);
    if (!cmd) {
      return;
    }

    // 记录连接。
    let initCache = (cmd: CmdClient) => {
      let retry = async () => {
        try {
          var cmd2 = await this._login(host, +port, acc, pwd, false);
        } catch (err) {
          cc.error(err);
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

    // 记录账号。
    cc.sys.localStorage.setItem('acc', acc);
    cc.sys.localStorage.setItem('pwd', pwd);

    // 关闭窗口。
    uiTools.closeWindowAndFireEvent(this.node, true, false);
  }
}