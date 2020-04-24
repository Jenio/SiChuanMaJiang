import ResListItem from './game/result/resListItem';
import ResUserInfo from './game/result/resUserInfo';
import { PlayerResultInfo } from '../model/game/other-structs';
import { ScreenDirection, toScreenDirNameOfMe } from '../model/game/concept';
import ResScore from './game/result/resScore';
import cache from '../model/cache';
import uiTools from '../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 对局结果。
 */
@ccclass
export default class InningResult extends cc.Component {

  /**
   * 继续按钮节点。
   */
  @property(cc.Node)
  nextBtnNode: cc.Node = null;

  /**
   * 继续按钮禁止状态节点。
   */
  @property(cc.Node)
  nextDisabledNode: cc.Node = null;

  /**
   * 结束按钮节点。
   */
  @property(cc.Node)
  endBtnNode: cc.Node = null;

  /**
   * 明细结果控件。
   */
  @property(cc.ScrollView)
  detailScrollView: cc.ScrollView = null;

  /**
   * 详情条目预制体。
   */
  @property(cc.Prefab)
  detailItemPrefab: cc.Prefab = null;

  /**
   * 左侧用户信息。
   */
  @property(ResUserInfo)
  userInfoLeft: ResUserInfo = null;

  /**
   * 上方用户信息。
   */
  @property(ResUserInfo)
  userInfoTop: ResUserInfo = null;

  /**
   * 右侧用户信息。
   */
  @property(ResUserInfo)
  userInfoRight: ResUserInfo = null;

  /**
   * 主用户昵称文本框。
   */
  @property(cc.Label)
  mainNameLabel: cc.Label = null;

  /**
   * 主用户相对方位文本框。
   */
  @property(cc.Label)
  mainDirLabel: cc.Label = null;

  /**
   * 主用户头像精灵。
   */
  @property(cc.Sprite)
  mainIconSprite: cc.Sprite = null;

  /**
   * 主用户分数。
   */
  @property(ResScore)
  mainScore: ResScore = null;

  /**
   * 胡精灵。
   */
  @property(cc.Sprite)
  huFormSprite: cc.Sprite = null;

  /**
   * 流局精灵帧。
   */
  @property(cc.SpriteFrame)
  liuJuSpriteFrame: cc.SpriteFrame = null;

  /**
   * 未胡但赢了精灵帧。
   */
  @property(cc.SpriteFrame)
  noHuWinSpriteFrame: cc.SpriteFrame = null;

  /**
   * 未胡但输了精灵帧。
   */
  @property(cc.SpriteFrame)
  noHuLoseSpriteFrame: cc.SpriteFrame = null;

  /**
   * 头像列表精灵帧数组。
   */
  @property(cc.SpriteFrame)
  iconSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 胡的牌型精灵帧数组。
   */
  @property(cc.SpriteFrame)
  huFormSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 四个玩家的对局结果信息。
   */
  private _pris?: PlayerResultInfo[];

  /**
   * 主方向。
   */
  private _sdirMain = ScreenDirection.Bottom;

  onLoad() {

    // 点击玩家切换的处理。
    if (this.userInfoLeft) {
      this.userInfoLeft.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this._pris) {
          this._sdirMain = this._getLeftOf(this._sdirMain);
          this.setup(this._pris);
        }
      });
    }
    if (this.userInfoTop) {
      this.userInfoTop.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this._pris) {
          this._sdirMain = this._getTopOf(this._sdirMain);
          this.setup(this._pris);
        }
      });
    }
    if (this.userInfoRight) {
      this.userInfoRight.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this._pris) {
          this._sdirMain = this._getRightOf(this._sdirMain);
          this.setup(this._pris);
        }
      });
    }
  }

  /**
   * 获取指定方向的左方方向。
   * @param sdir 给定的方向。
   */
  private _getLeftOf(sdir: ScreenDirection): ScreenDirection {
    switch (sdir) {
      case ScreenDirection.Bottom:
        return ScreenDirection.Left;
      case ScreenDirection.Left:
        return ScreenDirection.Top;
      case ScreenDirection.Top:
        return ScreenDirection.Right;
      case ScreenDirection.Right:
        return ScreenDirection.Bottom;
      default:
        throw new Error(`unknown screen dir ${sdir}`);
    }
  }

  /**
   * 获取指定方向的右方向。
   * @param sdir 给定的方向。
   */
  private _getRightOf(sdir: ScreenDirection): ScreenDirection {
    switch (sdir) {
      case ScreenDirection.Bottom:
        return ScreenDirection.Right;
      case ScreenDirection.Right:
        return ScreenDirection.Top;
      case ScreenDirection.Top:
        return ScreenDirection.Left;
      case ScreenDirection.Left:
        return ScreenDirection.Bottom;
      default:
        throw new Error(`unknown screen dir ${sdir}`);
    }
  }

  /**
   * 获取指定方向的对方向。
   * @param sdir 给定的方向。
   */
  private _getTopOf(sdir: ScreenDirection): ScreenDirection {
    switch (sdir) {
      case ScreenDirection.Bottom:
        return ScreenDirection.Top;
      case ScreenDirection.Top:
        return ScreenDirection.Bottom;
      case ScreenDirection.Left:
        return ScreenDirection.Right;
      case ScreenDirection.Right:
        return ScreenDirection.Left;
      default:
        throw new Error(`unknown screen dir ${sdir}`);
    }
  }

  /**
   * 设置。
   * @param pris 四个玩家的对局结果信息。
   */
  setup(pris: PlayerResultInfo[]) {
    this._pris = pris;

    // 更新主方向玩家信息。
    for (let pri of pris) {
      if (pri.sdir === this._sdirMain) {
        if (this.mainNameLabel) {
          this.mainNameLabel.string = pri.name;
        }
        if (this.mainDirLabel) {
          this.mainDirLabel.string = toScreenDirNameOfMe(pri.sdir);
        }
        if (this.mainScore) {
          this.mainScore.setup(pri.score);
        }
        if (this.huFormSprite) {
          if (pri.huForm !== undefined) {
            this.huFormSprite.spriteFrame = this.huFormSpriteFrames[pri.huForm];
          } else {
            let liuJu = true;
            for (let pri2 of pris) {
              if (pri2.huForm !== undefined) {
                liuJu = false;
                break;
              }
            }
            if (liuJu) {
              if (this.liuJuSpriteFrame) {
                this.huFormSprite.spriteFrame = this.liuJuSpriteFrame;
              }
            } else {
              if (pri.score >= 0) {
                if (this.noHuWinSpriteFrame) {
                  this.huFormSprite.spriteFrame = this.noHuWinSpriteFrame;
                }
              } else {
                if (this.noHuLoseSpriteFrame) {
                  this.huFormSprite.spriteFrame = this.noHuLoseSpriteFrame;
                }
              }
            }
          }
        }
        if (this.mainIconSprite) {

          // 加载头像。
          // 1、头像来自外部url，那么加载并显示。
          // 2、头像不是外部url，那么直接显示。
          if (pri.icon.indexOf('/') > 0) {
            cc.loader.load(pri.icon, (err, texture) => {
              if (err) {
                //TODO 使用加载失败的头像。
                return;
              }
              this.mainIconSprite.spriteFrame = new cc.SpriteFrame(texture);
            });
          } else {
            if (this.iconSpriteFrames) {
              this.mainIconSprite.spriteFrame = this.iconSpriteFrames[+pri.icon % this.iconSpriteFrames.length];
            }
          }
        }

        break;
      }
    }

    // 更新详情列表信息。
    if (this.detailScrollView && this.detailScrollView.content && this.detailItemPrefab) {
      this.detailScrollView.content.removeAllChildren(true);
      for (let pri of pris) {
        if (pri.sdir === this._sdirMain) {
          for (let x of pri.detail) {
            let node = cc.instantiate(this.detailItemPrefab);
            let c = node.getComponent(ResListItem);
            if (c) {
              c.setup(x.dir, x.desc, x.fan, x.score);
            }
            this.detailScrollView.content.addChild(node);
          }
          break;
        }
      }
    }

    // 更新左侧用户信息。
    if (this.userInfoLeft) {
      let sdir = this._getLeftOf(this._sdirMain);
      for (let pri of pris) {
        if (pri.sdir === sdir) {
          this.userInfoLeft.setup(pri.name, pri.icon, toScreenDirNameOfMe(pri.sdir), pri.score);
          break;
        }
      }
    }

    // 更新上方用户信息。
    if (this.userInfoTop) {
      let sdir = this._getTopOf(this._sdirMain);
      for (let pri of pris) {
        if (pri.sdir === sdir) {
          this.userInfoTop.setup(pri.name, pri.icon, toScreenDirNameOfMe(pri.sdir), pri.score);
          break;
        }
      }
    }

    // 更新右侧用户信息。
    if (this.userInfoRight) {
      let sdir = this._getRightOf(this._sdirMain);
      for (let pri of pris) {
        if (pri.sdir === sdir) {
          this.userInfoRight.setup(pri.name, pri.icon, toScreenDirNameOfMe(pri.sdir), pri.score);
          break;
        }
      }
    }
  }

  /**
   * 显示继续按钮。
   */
  showContinueButton() {
    if (this.nextBtnNode) {
      this.nextBtnNode.active = true;
    }
    if (this.nextDisabledNode) {
      this.nextDisabledNode.active = false;
    }
    if (this.endBtnNode) {
      this.endBtnNode.active = false;
    }
  }

  /**
   * 显示灰掉的继续按钮。
   */
  showContinueDisabledButton() {
    if (this.nextBtnNode) {
      this.nextBtnNode.active = false;
    }
    if (this.nextDisabledNode) {
      this.nextDisabledNode.active = true;
    }
    if (this.endBtnNode) {
      this.endBtnNode.active = false;
    }
  }

  /**
   * 点击继续按钮的处理。
   * @param evn 事件。
   */
  onContinue(evn: cc.Event) {
    evn.stopPropagation();

    cache.cmd.execCmd(`${cache.route}:game/setReady`, {
      roomId: cache.roomId
    }).then((res) => {
      if (res.err !== undefined) {
        cc.warn(`res.err is: ${res.err}`);
        if (res.err === 2 || res.err === 3) {
          uiTools.toast('游戏已结束');
          //TODO 关闭并发出消息。
        }
      }

      // 将按钮置灰。
      this.showContinueDisabledButton();

    }).catch((err) => {
      cc.error(err);
    });
  }

  /**
   * 点击结束按钮的处理。
   * @param evn 事件。
   */
  onEnd(evn: cc.Event) {
    evn.stopPropagation();
  }
}