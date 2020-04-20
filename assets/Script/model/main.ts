import uiTools from './ui/tools';
import { CmdClient } from './network/cmd';
import cache from './cache';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

  onLoad() {
    cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);

    uiTools.openWindow('prefab/entrance').then((node: cc.Node) => {
    }).catch((err) => {
      cc.error(err);
    });
  }
}