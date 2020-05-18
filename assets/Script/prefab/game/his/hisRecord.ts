import { GameRecord } from '../../../model/game/other-structs';
import HisPlayerInfo from './hisPlayerInfo';
import cache from '../../../model/cache';

const { ccclass, property } = cc._decorator;

/**
 * 对局历史记录项。
 */
@ccclass
export default class HisRecord extends cc.Component {

  /**
   * 用户信息映射。
   */
  private _nameIconMap: {
    [uid: number]: {
      name: string;
      icon: string;
    }
  } = {};

  /**
   * 房号文本框。
   */
  @property(cc.Label)
  roomLabel: cc.Label = null;

  /**
   * 日期时间文本框。
   */
  @property(cc.Label)
  dateTimeLabel: cc.Label = null;

  /**
   * 用户信息。
   */
  @property(HisPlayerInfo)
  playerInfos: HisPlayerInfo[] = [];

  private _destroyed = false;

  onDestroy() {
    this._destroyed = true;
  }

  /**
   * 获取指定用户的昵称和头像。
   * @param uid 用户ID。
   */
  private async _getNameIcon(uid: number): Promise<{
    name: string;
    icon: string;
  } | undefined> {
    let item = this._nameIconMap[uid];
    if (item === undefined) {
      try {
        var res = await cache.cmd.execCmd('user/queryOtherUser', { uid });
      } catch (err) {
        cc.error(err);
      }
      if (res !== undefined && res.err === undefined) {
        item = this._nameIconMap[uid] = {
          name: res.name,
          icon: res.icon
        };
      }
    }
    return item;
  }

  /**
   * 设置。
   * @param record 游戏记录。
   */
  async setup(record: GameRecord) {
    if (this.roomLabel) {
      this.roomLabel.string = record.roomId;
    }
    if (this.dateTimeLabel) {
      let dt = new Date(record.ts);
      let month: string | number = dt.getMonth() + 1;
      if (month < 10) {
        month = `0${month}`;
      }
      let day: string | number = dt.getDate();
      if (day < 10) {
        day = `0${day}`;
      }
      let hour: string | number = dt.getHours();
      if (hour < 10) {
        hour = `0${hour}`;
      }
      let minute: string | number = dt.getMinutes();
      if (minute < 10) {
        minute = `0${minute}`;
      }
      let second: string | number = dt.getSeconds();
      if (second < 10) {
        second = `0${second}`;
      }
      this.dateTimeLabel.string = `${dt.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
    }
    for (let n = 0; n < record.record.length; ++n) {
      let p = record.record[n];
      let pi = this.playerInfos[n];
      if (pi) {
        let res = await this._getNameIcon(p.uid);
        if (this._destroyed) {
          break;
        }
        if (res !== undefined) {
          pi.setup(res.name, res.icon, p.score, p.banker);
        } else {
          pi.setup('<未知>', undefined, p.score, p.banker);
        }
      }
    }
  }
}