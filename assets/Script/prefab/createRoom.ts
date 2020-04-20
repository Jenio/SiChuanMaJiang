import uiTools from '../model/ui/tools';
import cache from '../model/cache';

const { ccclass, property } = cc._decorator;

/**
 * 创建房间。
 */
@ccclass
export default class CreateRoom extends cc.Component {

  /**
   * 16番文本框。
   */
  @property(cc.Label)
  fan16Label: cc.Label = null;

  /**
   * 64番文本框。
   */
  @property(cc.Label)
  fan64Label: cc.Label = null;

  /**
   * 256番文本框。
   */
  @property(cc.Label)
  fan256Label: cc.Label = null;

  /**
   * 不封顶文本框。
   */
  @property(cc.Label)
  fanNLabel: cc.Label = null;

  /**
   * 4局文本框。
   */
  @property(cc.Label)
  innings4Label: cc.Label = null;

  /**
   * 8局文本框。
   */
  @property(cc.Label)
  innings8Label: cc.Label = null;

  /**
   * 12局文本框。
   */
  @property(cc.Label)
  innings12Label: cc.Label = null;

  /**
   * 24局文本框。
   */
  @property(cc.Label)
  innings24Label: cc.Label = null;

  /**
   * 1分文本框。
   */
  @property(cc.Label)
  base1Label: cc.Label = null;

  /**
   * 2分文本框。
   */
  @property(cc.Label)
  base2Label: cc.Label = null;

  /**
   * 5分文本框。
   */
  @property(cc.Label)
  base5Label: cc.Label = null;

  /**
   * 10分文本框。
   */
  @property(cc.Label)
  base10Label: cc.Label = null;

  /**
   * 定缺文本框。
   */
  @property(cc.Label)
  dingQueLabel: cc.Label = null;

  /**
   * 消耗文本框。
   */
  @property(cc.Label)
  costLabel: cc.Label = null;

  /**
   * 16番Toggle。
   */
  @property(cc.Toggle)
  fan16Toggle: cc.Toggle = null;

  /**
   * 64番Toggle。
   */
  @property(cc.Toggle)
  fan64Toggle: cc.Toggle = null;

  /**
   * 256番Toggle。
   */
  @property(cc.Toggle)
  fan256Toggle: cc.Toggle = null;

  /**
   * 不封顶Toggle。
   */
  @property(cc.Toggle)
  fanNToggle: cc.Toggle = null;

  /**
   * 4局Toggle。
   */
  @property(cc.Toggle)
  innings4Toggle: cc.Toggle = null;

  /**
   * 8局Toggle。
   */
  @property(cc.Toggle)
  innings8Toggle: cc.Toggle = null;

  /**
   * 12局Toggle。
   */
  @property(cc.Toggle)
  innings12Toggle: cc.Toggle = null;

  /**
   * 24局Toggle。
   */
  @property(cc.Toggle)
  innings24Toggle: cc.Toggle = null;

  /**
   * 1分Toggle。
   */
  @property(cc.Toggle)
  base1Toggle: cc.Toggle = null;

  /**
   * 2分Toggle。
   */
  @property(cc.Toggle)
  base2Toggle: cc.Toggle = null;

  /**
   * 5分Toggle。
   */
  @property(cc.Toggle)
  base5Toggle: cc.Toggle = null;

  /**
   * 10分Toggle。
   */
  @property(cc.Toggle)
  base10Toggle: cc.Toggle = null;

  /**
   * 定缺Toggle。
   */
  @property(cc.Toggle)
  dingQueToggle: cc.Toggle = null;

  onLoad() {
    if (this.fan16Label) {
      this.fan16Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.fan16Toggle) {
          this.fan16Toggle.check();
        }
      });
    }
    if (this.fan64Label) {
      this.fan64Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.fan64Toggle) {
          this.fan64Toggle.check();
        }
      });
    }
    if (this.fan256Label) {
      this.fan256Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.fan256Toggle) {
          this.fan256Toggle.check();
        }
      });
    }
    if (this.fanNLabel) {
      this.fanNLabel.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.fanNToggle) {
          this.fanNToggle.check();
        }
      });
    }
    if (this.innings4Label) {
      this.innings4Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.innings4Toggle) {
          this.innings4Toggle.check();
        }
      });
    }
    if (this.innings8Label) {
      this.innings8Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.innings8Toggle) {
          this.innings8Toggle.check();
        }
      });
    }
    if (this.innings12Label) {
      this.innings12Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.innings12Toggle) {
          this.innings12Toggle.check();
        }
      });
    }
    if (this.innings24Label) {
      this.innings24Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.innings24Toggle) {
          this.innings24Toggle.check();
        }
      });
    }
    if (this.base1Label) {
      this.base1Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.base1Toggle) {
          this.base1Toggle.check();
        }
      });
    }
    if (this.base2Label) {
      this.base2Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.base2Toggle) {
          this.base2Toggle.check();
        }
      });
    }
    if (this.base5Label) {
      this.base5Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.base5Toggle) {
          this.base5Toggle.check();
        }
      });
    }
    if (this.base10Label) {
      this.base10Label.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.base10Toggle) {
          this.base10Toggle.check();
        }
      });
    }
    if (this.dingQueLabel) {
      this.dingQueLabel.node.on(cc.Node.EventType.TOUCH_END, (evn: cc.Event) => {
        evn.stopPropagation();
        if (this.dingQueToggle) {
          if (this.dingQueToggle.isChecked) {
            this.dingQueToggle.uncheck();
          } else {
            this.dingQueToggle.check();
          }
        }
      });
    }
  }

  /**
   * 选项框（除了定缺外的）选中。
   * @param toggle 选项框。
   */
  onToggle(toggle: cc.Toggle) {

    // 更换对应的文本的显示颜色。
    let label: cc.Label | null;
    let labelsToUncheck: cc.Label[] = [];
    if (toggle === this.fan16Toggle) {
      label = this.fan16Label;
      labelsToUncheck.push(this.fan64Label, this.fan256Label, this.fanNLabel);
    } else if (toggle === this.fan64Toggle) {
      label = this.fan64Label;
      labelsToUncheck.push(this.fan16Label, this.fan256Label, this.fanNLabel);
    } else if (toggle === this.fan256Toggle) {
      label = this.fan256Label;
      labelsToUncheck.push(this.fan16Label, this.fan64Label, this.fanNLabel);
    } else if (toggle === this.fanNToggle) {
      label = this.fanNLabel;
      labelsToUncheck.push(this.fan16Label, this.fan64Label, this.fan256Label);
    } else if (toggle === this.innings4Toggle) {
      if (this.costLabel) {
        this.costLabel.string = '4';
      }
      label = this.innings4Label;
      labelsToUncheck.push(this.innings8Label, this.innings12Label, this.innings24Label);
    } else if (toggle === this.innings8Toggle) {
      if (this.costLabel) {
        this.costLabel.string = '8';
      }
      label = this.innings8Label;
      labelsToUncheck.push(this.innings4Label, this.innings12Label, this.innings24Label);
    } else if (toggle === this.innings12Toggle) {
      if (this.costLabel) {
        this.costLabel.string = '12';
      }
      label = this.innings12Label;
      labelsToUncheck.push(this.innings4Label, this.innings8Label, this.innings24Label);
    } else if (toggle === this.innings24Toggle) {
      if (this.costLabel) {
        this.costLabel.string = '24';
      }
      label = this.innings24Label;
      labelsToUncheck.push(this.innings4Label, this.innings8Label, this.innings12Label);
    } else if (toggle === this.base1Toggle) {
      label = this.base1Label;
      labelsToUncheck.push(this.base2Label, this.base5Label, this.base10Label);
    } else if (toggle === this.base2Toggle) {
      label = this.base2Label;
      labelsToUncheck.push(this.base1Label, this.base5Label, this.base10Label);
    } else if (toggle === this.base5Toggle) {
      label = this.base5Label;
      labelsToUncheck.push(this.base1Label, this.base2Label, this.base10Label);
    } else if (toggle === this.base10Toggle) {
      label = this.base10Label;
      labelsToUncheck.push(this.base1Label, this.base2Label, this.base5Label);
    }
    if (label) {
      label.node.color = cc.color(39, 139, 26, 255);
    }
    for (let l of labelsToUncheck) {
      if (l) {
        l.node.color = cc.color(115, 43, 11, 255);
      }
    }
  }

  /**
   * 定缺选项框选中。
   * @param toggle 定缺选项框。
   */
  onDingQueToggle(toggle: cc.Toggle) {
    if (toggle === this.dingQueToggle) {
      if (toggle.isChecked) {
        this.dingQueLabel.node.color = cc.color(39, 139, 26, 255);
      } else {
        this.dingQueLabel.node.color = cc.color(115, 43, 11, 255);
      }
    }
  }

  /**
   * 点击创建房间按钮。
   */
  async onClickCreateRoom() {
    if (!this.innings4Toggle || !this.innings8Toggle || !this.innings12Toggle || !this.innings24Toggle) {
      return;
    }
    if (!this.base1Toggle || !this.base2Toggle || !this.base5Toggle || !this.base10Toggle) {
      return;
    }
    if (!this.fan16Toggle || !this.fan64Toggle || !this.fan256Toggle || !this.fanNToggle) {
      return;
    }
    if (!this.dingQueToggle) {
      return;
    }

    // 获取配置。
    let innings = 0;
    if (this.innings4Toggle.isChecked) {
      innings = 4;
    } else if (this.innings8Toggle.isChecked) {
      innings = 8;
    } else if (this.innings12Toggle.isChecked) {
      innings = 12;
    } else if (this.innings24Toggle.isChecked) {
      innings = 24;
    }
    let baseScore = 0;
    if (this.base1Toggle.isChecked) {
      baseScore = 1;
    } else if (this.base2Toggle.isChecked) {
      baseScore = 2;
    } else if (this.base5Toggle.isChecked) {
      baseScore = 5;
    } else if (this.base10Toggle.isChecked) {
      baseScore = 10;
    }
    let fanLimit = 0;
    if (this.fan16Toggle.isChecked) {
      fanLimit = 16;
    } else if (this.fan64Toggle.isChecked) {
      fanLimit = 64;
    } else if (this.fan256Toggle.isChecked) {
      fanLimit = 256;
    } else if (this.fanNToggle.isChecked) {
      fanLimit = 0;
    }
    let skipOne = false;
    if (this.dingQueToggle.isChecked) {
      skipOne = true;
    }

    // 请求创建房间。
    let cmd = cache.cmd;
    let res = await cmd.execCmd('room/create', {
      gameId: cache.gameId,
      numPlayers: 4,
      innings,
      baseScore,
      config: {
        skipOne,
        fanLimit
      }
    });
    if (res.err !== undefined) {
      let tips = {
        1: '参数错误',
        2: '玩家已在其他房间内',
        3: '豆不足',
        4: '内部错误'
      };
      let tip = tips[res.err];
      if (tip === undefined) {
        tip = '未知错误'
      }
      uiTools.toast(tip);
      return;
    }

    // 关闭窗口。
    uiTools.closeWindowAndFireEvent(this.node, res, false);
  }
}