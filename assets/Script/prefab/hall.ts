import uiTools from '../model/ui/tools';
import cache from '../model/cache';
import Room from './room';

const { ccclass, property } = cc._decorator;

/**
 * 大厅。
 */
@ccclass
export default class Hall extends cc.Component {

  /**
   * 昵称文本框。
   */
  @property(cc.Label)
  nameLabel: cc.Label = null;

  /**
   * 豆子文本框。
   */
  @property(cc.Label)
  beanLabel: cc.Label = null;

  /**
   * 头像精灵。
   */
  @property(cc.Sprite)
  iconSprite: cc.Sprite = null;

  /**
   * 创建房间节点。
   */
  @property(cc.Node)
  createNode: cc.Node = null;

  /**
   * 加入房间节点。
   */
  @property(cc.Node)
  joinNode: cc.Node = null;

  /**
   * 活动节点。
   */
  @property(cc.Node)
  activityNode: cc.Node = null;

  /**
   * 规则节点。
   */
  @property(cc.Node)
  ruleNode: cc.Node = null;

  /**
   * 战绩节点。
   */
  @property(cc.Node)
  recordNode: cc.Node = null;

  /**
   * 声明节点。
   */
  @property(cc.Node)
  announceNode: cc.Node = null;

  /**
   * 设置节点。
   */
  @property(cc.Node)
  setupNode: cc.Node = null;

  /**
   * 头像列表。
   */
  @property(cc.SpriteFrame)
  iconSpriteFrames: cc.SpriteFrame[] = [];

  private _onGainBeanNotifyHandler = this._onGainBeanNotify.bind(this);

  private _onGainBeanNotify(notify: {
    gain: number;
    bean: number;
  }) {
    cc.log('gainBeanNotify');
    cc.log(notify);
    uiTools.toast(`获得了${notify.gain}豆`);
    if (this.beanLabel) {
      this.beanLabel.string = notify.bean.toString();
    }
  }

  onDestroy() {
    cache.notifyEvent.off('gacPay/gainBeanNotify', this._onGainBeanNotifyHandler);
  }

  onLoad() {
    cache.notifyEvent.on('gacPay/gainBeanNotify', this._onGainBeanNotifyHandler);

    if (this.createNode) {
      let busy = false;
      this.createNode.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (busy) {
          return;
        }
        busy = true;
        this.onClickCreateRoom().catch((err) => {
          cc.error(err);
        }).then(() => {
          busy = false;
        });
      });
    }

    if (this.joinNode) {
      let busy = false;
      this.joinNode.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (busy) {
          return;
        }
        busy = true;
        this.onClickJoinRoom().catch((err) => {
          cc.error(err);
        }).then(() => {
          busy = false;
        });
      });
    }

    // 加载用户数据。
    this.loadUserInfo().catch((err) => {
      cc.error(err);
      uiTools.toast('加载用户数据失败');
    });
  }

  /**
   * 加载用户信息。
   */
  async loadUserInfo() {
    let res = await cache.cmd.execCmd('user/query', {
      gameId: cache.gameId
    });
    if (res.err !== undefined) {
      let tips = {
        1: '用户数据不存在',
        2: '内部错误'
      };
      let tip = tips[res.err];
      if (tip === undefined) {
        tip = '未知错误';
      }
      uiTools.toast(tip);
      return;
    }
    cache.uid = res.uid;
    cache.name = res.name;
    cache.icon = res.icon;
    cache.bean = res.bean;
    if (this.nameLabel) {
      this.nameLabel.string = cache.name;
    }
    if (this.beanLabel) {
      this.beanLabel.string = cache.bean.toString();
    }
    if (this.iconSprite) {

      // 加载头像。
      // 1、头像来自外部url，那么加载并显示。
      // 2、头像不是外部url，那么直接显示。
      if (cache.icon.indexOf('/') > 0) {
        cc.loader.load(cache.icon, (err, texture) => {
          if (err) {
            //TODO 使用加载失败的头像。
            return;
          }
          this.iconSprite.spriteFrame = new cc.SpriteFrame(texture);
        });
      } else {
        if (this.iconSpriteFrames) {
          this.iconSprite.spriteFrame = this.iconSpriteFrames[+cache.icon % this.iconSpriteFrames.length];
        }
      }
    }
  }

  /**
   * 点击创建房间按钮。
   */
  async onClickCreateRoom() {
    if (this.createNode) {
      let c = this.createNode.getComponent(cc.AudioSource);
      if (c) {
        c.play();
      }
    }
    let node = await uiTools.openWindow('prefab/createRoom');
    node.once('closed', (evn: cc.Event) => {
      let res = uiTools.getEventUserData(evn);
      if (res) {
        uiTools.openWindow('prefab/room', (node) => {
          let c = node.getComponent(Room);
          if (c) {
            c.setRoomInfo(res.ri);
          }
        }).catch((err) => {
          cc.error(err);
        }).then(() => {
          uiTools.closeWindow(this.node);
        });
      }
    });
  }

  /**
   * 点击加入房间按钮。
   */
  async onClickJoinRoom() {
    if (this.joinNode) {
      let c = this.joinNode.getComponent(cc.AudioSource);
      if (c) {
        c.play();
      }
    }
    let node = await uiTools.openWindow('prefab/joinRoom');
    node.once('closed', (evn: cc.Event) => {
      let needClose = uiTools.getEventUserData(evn);
      if (needClose) {
        uiTools.closeWindow(this.node);
      }
    });
  }

  /**
   * 点击充值按钮。
   */
  onClickRecharge() {
    if (cache.channel !== 'default') {
      uiTools.openWindow('prefab/recharge').catch((err) => {
        cc.error(err);
        uiTools.toast('打开充值界面失败');
      });
    } else {
      uiTools.toast('请使用钱包方式登入游戏');
    }
  }

  /**
   * 点击活动按钮。
   */
  onClickActivity() {
  }

  /**
   * 点击规则按钮。
   */
  onClickRule() {
  }

  /**
   * 点击战绩按钮。
   */
  onClickRecord() {
  }

  /**
   * 点击设置按钮。
   */
  onClickSetup() {
  }
}