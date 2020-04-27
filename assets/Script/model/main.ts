import uiTools from './ui/tools';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

  @property(cc.ProgressBar)
  progressBar: cc.ProgressBar;

  onLoad() {
    cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);

    if (this.progressBar) {
      this.progressBar.node.active = true;

      let oldProgress = 0;
      cc.loader.loadRes('prefab/all', cc.Prefab, (curr, total, item) => {
        cc.log(`progress: ${item.queueId}, ${curr}/${total}`);
        //cc.log(`progress: ${curr/total}`);
        //cc.log(item);
        let newProgress = curr / total;
        if (newProgress > oldProgress) {
          this.progressBar.progress = newProgress;
          oldProgress = newProgress;
        }
      }, (err, prefab) => {
        this.progressBar.node.active = false;
        if (err) {
          cc.log('err');
          return;
        }
        uiTools.openWindow('prefab/entrance').then((node: cc.Node) => {
        }).catch((err) => {
          cc.error(err);
        });
      });
    }

  }
}