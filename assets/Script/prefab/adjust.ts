const { ccclass, property } = cc._decorator;

@ccclass
export default class Adjust extends cc.Component {

  @property(cc.Node)
  rootNode: cc.Node = null;

  onLoad() {
    if (this.rootNode) {
      let size = cc.view.getVisibleSize();
      cc.log(size);
      if (size.height < 1280) {
        if (size.height < 630) {
          this.rootNode.height = 630;
        } else {
          this.rootNode.height = size.height;
        }
      }
    }
  }
}