import cache from '../model/cache';

const { ccclass, property } = cc._decorator;

/**
 * 设置界面。
 */
@ccclass
export default class Setup extends cc.Component {

  /**
   * 音乐开启节点。
   */
  @property(cc.Node)
  musicOpenNode: cc.Node = null;

  /**
   * 音乐关闭节点。
   */
  @property(cc.Node)
  musicCloseNode: cc.Node = null;

  /**
   * 音效开启节点。
   */
  @property(cc.Node)
  soundOpenNode: cc.Node = null;

  /**
   * 音效关闭节点。
   */
  @property(cc.Node)
  soundCloseNode: cc.Node = null;

  /**
   * 刷新。
   */
  private _refresh() {
    if (this.musicOpenNode && this.musicOpenNode.active !== cache.musicOn) {
      this.musicOpenNode.active = cache.musicOn;
    }
    if (this.musicCloseNode && this.musicCloseNode.active === cache.musicOn) {
      this.musicCloseNode.active = !cache.musicOn;
    }
    if (this.soundOpenNode && this.soundOpenNode.active !== cache.soundOn) {
      this.soundOpenNode.active = cache.soundOn;
    }
    if (this.soundCloseNode && this.soundCloseNode.active === cache.soundOn) {
      this.soundCloseNode.active = !cache.soundOn;
    }
  }

  onLoad() {
    this._refresh();
  }

  /**
   * 点击了音乐开关。
   */
  onClickMusic() {
    cache.musicOn = !cache.musicOn;
    this._refresh();
    cache.otherEvent.emit('musicSwitchChanged');
  }

  /**
   * 点击了音效开关。
   */
  onClickSound() {
    cache.soundOn = !cache.soundOn;
    this._refresh();
  }
}