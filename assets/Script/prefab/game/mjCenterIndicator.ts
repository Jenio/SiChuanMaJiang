import { Direction } from '../../model/game/concept';
import uiTools from '../../model/ui/tools';

const { ccclass, property } = cc._decorator;

/**
 * 麻将桌中心指示器。
 */
@ccclass
export default class MjCenterIndicator extends cc.Component {

  /**
   * 旋转节点。
   */
  @property(cc.Node)
  rotateNode: cc.Node = null;

  /**
   * 东方光照节点。
   */
  @property(cc.Node)
  eastLightNode: cc.Node = null;

  /**
   * 北方光照节点。
   */
  @property(cc.Node)
  northLightNode: cc.Node = null;

  /**
   * 西方光照节点。
   */
  @property(cc.Node)
  westLightNode: cc.Node = null;

  /**
   * 南方光照节点。
   */
  @property(cc.Node)
  southLightNode: cc.Node = null;

  /**
   * 左侧数字精灵。
   */
  @property(cc.Sprite)
  leftDigitSprite: cc.Sprite = null;

  /**
   * 右侧数字精灵。
   */
  @property(cc.Sprite)
  rightDigitSprite: cc.Sprite = null;

  /**
   * 数字精灵动画帧数组（数组的下标由按序的数字0到9组成）。
   */
  @property(cc.SpriteFrame)
  digitSpritFrames: cc.SpriteFrame[] = [];

  /**
   * 是否显示倒计时。
   */
  private _showCountDown = false;

  /**
   * 倒计时秒数。
   */
  private _countDown = 0;

  /**
   * 倒计时剩余秒数。
   */
  private _countDownLeft = 0;

  /**
   * 倒计时开始时间戳。
   */
  private _countDownStartTs = Date.now();

  /**
   * 是否显示骰子。
   */
  private _showDice = false;

  //TODO 加入骰子相关。

  /**
   * 是否显示光照。
   */
  private _showLight = false;

  /**
   * 光照方位。
   */
  private _lightDir = Direction.East;

  /**
   * 刷新倒计时的显示。
   */
  private _refreshCountDown() {
    if (this._showCountDown) {
      let left = ~~(this._countDownLeft / 10);
      let right = this._countDownLeft % 10;
      if (this.leftDigitSprite) {
        this.leftDigitSprite.node.active = true;
        this.leftDigitSprite.spriteFrame = this.digitSpritFrames[left];
      }
      if (this.rightDigitSprite) {
        this.rightDigitSprite.node.active = true;
        this.rightDigitSprite.spriteFrame = this.digitSpritFrames[right];
      }
    } else {
      if (this.leftDigitSprite) {
        this.leftDigitSprite.node.active = false;
      }
      if (this.rightDigitSprite) {
        this.rightDigitSprite.node.active = false;
      }
    }
  }

  /**
   * 刷新光照的显示。
   */
  private _refreshLight() {
    if (this.eastLightNode) {
      this.eastLightNode.stopAllActions();
      this.eastLightNode.opacity = 255;
      this.eastLightNode.active = false;
    }
    if (this.northLightNode) {
      this.northLightNode.stopAllActions();
      this.northLightNode.opacity = 255;
      this.northLightNode.active = false;
    }
    if (this.westLightNode) {
      this.westLightNode.stopAllActions();
      this.westLightNode.opacity = 255;
      this.westLightNode.active = false;
    }
    if (this.southLightNode) {
      this.southLightNode.stopAllActions();
      this.southLightNode.opacity = 255;
      this.southLightNode.active = false;
    }
    if (this._showLight) {
      let action = cc.sequence(cc.fadeOut(0.5).easing(cc.easeSineOut()), cc.fadeIn(1).easing(cc.easeSineIn()));
      if (this._lightDir === Direction.East) {
        if (this.eastLightNode) {
          this.eastLightNode.active = true;
          this.eastLightNode.runAction(cc.repeatForever(action));
        }
      } else if (this._lightDir === Direction.North) {
        if (this.northLightNode) {
          this.northLightNode.active = true;
          this.northLightNode.runAction(cc.repeatForever(action));
        }
      } else if (this._lightDir === Direction.West) {
        if (this.westLightNode) {
          this.westLightNode.active = true;
          this.westLightNode.runAction(cc.repeatForever(action));
        }
      } else if (this._lightDir === Direction.South) {
        if (this.southLightNode) {
          this.southLightNode.active = true;
          this.southLightNode.runAction(cc.repeatForever(action));
        }
      }
    }
  }

  /**
   * 刷新界面显示。
   */
  private _refresh() {
    this._refreshCountDown();
    this._refreshLight();
  }

  /**
   * 重置为初始状态。
   */
  reset() {
    if (this.eastLightNode) {
      this.eastLightNode.stopAllActions();
      this.eastLightNode.opacity = 255;
      this.eastLightNode.active = false;
    }
    if (this.northLightNode) {
      this.northLightNode.stopAllActions();
      this.northLightNode.opacity = 255;
      this.northLightNode.active = false;
    }
    if (this.westLightNode) {
      this.westLightNode.stopAllActions();
      this.westLightNode.opacity = 255;
      this.westLightNode.active = false;
    }
    if (this.southLightNode) {
      this.southLightNode.stopAllActions();
      this.southLightNode.opacity = 255;
      this.southLightNode.active = false;
    }

    this._showCountDown = false;
    this._countDown = 0;
    this._countDownLeft = 0;
    this._countDownStartTs = Date.now();

    this._showDice = false;

    this._showLight = false;
  }

  /**
   * 设置我处在的方位（我处在的方位永远需要放在屏幕的下方，从而东南西北需要旋转）
   * @param dir 方位。
   */
  setMyDir(dir: Direction) {
    if (this.rotateNode) {
      if (dir === Direction.East) {
        this.rotateNode.rotation = 90;
      } else if (dir === Direction.North) {
        this.rotateNode.rotation = 180;
      } else if (dir === Direction.West) {
        this.rotateNode.rotation = 270;
      } else if (dir === Direction.South) {
        this.rotateNode.rotation = 0;
      }
    }
  }

  /**
   * 设置当前的方位。
   * @param dir 方位。
   * @param showLight 是否显示方位光照。
   */
  setCurrDir(dir: Direction, showLight: boolean) {
    this._lightDir = dir;
    this._showLight = showLight;
    this._refreshLight();
  }

  /**
   * 开始倒计时。
   * @param seconds 倒计时秒数（必须是两位数）。
   */
  beginCountDown(seconds: number) {
    if (seconds > 99) {
      seconds = 99;
    }
    this._countDown = seconds;
    this._countDownLeft = seconds;
    this._countDownStartTs = Date.now();
    this._showCountDown = true;
    this._refreshCountDown();
  }

  /**
   * 计算倒计时剩余的秒数。
   */
  private _calcCountDown() {
    let pass = Math.floor((Date.now() - this._countDownStartTs) / 1000);
    let left = this._countDown - pass;
    if (left < 0) {
      left = 0;
    }
    return left;
  }

  update() {

    // 倒计时刷新。
    if (this._showCountDown && this._countDownLeft > 0) {
      let left = this._calcCountDown();
      if (left !== this._countDownLeft) {
        this._countDownLeft = left;
        this._refreshCountDown();
      }
      if (left === 0) {
        uiTools.fireEvent(this.node, 'countDownFin', undefined, true);
      }
    }
  }
}