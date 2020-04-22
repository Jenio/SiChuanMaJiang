import uiTools from '../model/ui/tools';
import { CmdClient } from '../model/network/cmd';

const { ccclass, property } = cc._decorator;

/**
 * 游戏入口。
 */
@ccclass
export default class Register extends cc.Component {

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

  /**
   * 确认密码输入框。
   */
  @property(cc.EditBox)
  confirmEditBox: cc.EditBox = null;

  /**
   * 点击注册按钮。
   */
  async onClickRegister() {
    if (!this.accEditBox || !this.pwdEditBox || !this.confirmEditBox) {
      return;
    }

    // 获取主机、端口。
    let host: string | undefined = cc.sys.localStorage.getItem('host');
    if (!host) {
      //host = '127.0.0.1';
      host = '39.101.164.203'
      cc.sys.localStorage.setItem('host', host);
    }
    let port: string | undefined = cc.sys.localStorage.getItem('port');
    if (!port) {
      port = '10001';
      cc.sys.localStorage.setItem('port', port);
    }

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
    let confirm = this.confirmEditBox.string;
    if (pwd !== confirm) {
      uiTools.toast('两次输入的密码不一致');
      return;
    }

    // 获取或建立连接。
    let cmd = new CmdClient(host, +port, false);

    // 注册。
    try {
      var res = await cmd.execCmd('route/register', { acc, pwd });
    } catch (err) {
      uiTools.toast('无法连接到服务器');
      return;
    } finally {
      cmd.close();
    }
    if (res.err !== undefined) {
      let tips = {
        1: '参数错误',
        2: '账号已存在',
        3: '未知错误'
      };
      let tip = tips[res.err];
      if (tip === undefined) {
        tip = '未知错误';
      }
      uiTools.toast(tip);
      return;
    }
    uiTools.toast('注册成功');

    // 记录账号。
    cc.sys.localStorage.setItem('acc', acc);

    // 关闭窗口。
    uiTools.closeWindow(this.node);
  }
}