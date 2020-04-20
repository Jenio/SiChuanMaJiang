import Toast from '../../prefab/toast';

/**
 * UI工具。
 */
class UITools {
  /**
   * 打开由预制体定义展示的窗口。
   * @param prefabUrl 预制体资源地址。
   * @param beforeOnLoad 在onLoad之前被调用（可以不传）。
   */
  async openWindow(prefabUrl: string, beforeOnLoad?: (node: cc.Node) => void) {

    return new Promise<cc.Node>((res, rej) => {

      //TODO 更改为支持加载进度条。

      cc.loader.loadRes(prefabUrl, cc.Prefab, (err, prefab) => {
        if (err) {
          rej(err);
          return;
        }
        let node = cc.instantiate(prefab);
        if (beforeOnLoad) {
          beforeOnLoad(node);
        }
        cc.director.getScene().addChild(node);
        res(node);
      });
    });
  }

  /**
   * 关闭窗口。
   * @param node 窗口节点。
   */
  closeWindow(node: cc.Node) {
    node.removeFromParent(true);
    node.destroy();
  }

  /**
   * 发出事件。
   * @param name 事件名。
   * @param node 接收事件的节点。
   * @param data 事件附带的数据。
   * @param bubbles 事件是否逐级向上传递（直到接收者显式禁止）。
   */
  fireEvent(node: cc.Node, name: string, data: any, bubbles: boolean) {
    let evn: cc.Event;
    if (data !== undefined) {
      let cevn = new cc.Event.EventCustom(name, bubbles);
      cevn.setUserData(data);
      evn = cevn;
    } else {
      evn = new cc.Event(name, bubbles);
    }
    node.dispatchEvent(evn);
  }

  /**
   * 关闭（窗口）并发出closed事件。
   * @param node 接收事件的节点，也是要关闭的窗口的节点。
   * @param data 事件附带的数据。
   * @param bubbles 事件是否逐级向上传递（直到接收者显式禁止）。
   */
  closeWindowAndFireEvent(node: cc.Node, data: any, bubbles: boolean) {
    this.fireEvent(node, 'closed', data, bubbles);
    this.closeWindow(node);
  }

  /**
   * 获取事件内存储的用户数据。
   * @param evn 事件。
   */
  getEventUserData(evn: cc.Event): any {
    if (evn instanceof cc.Event.EventCustom) {
      return evn.getUserData();
    }
    return undefined;
  }

  /**
   * 在屏幕上方提示。
   * @param tip 提示的内容。
   */
  toast(tip: string) {
    this.openWindow('prefab/toast', (node) => {
      let c = node.getComponent(Toast);
      if (c) {
        c.tipLabel.string = tip;
      }
    });
  }
}

let uiTools = new UITools();
export default uiTools;