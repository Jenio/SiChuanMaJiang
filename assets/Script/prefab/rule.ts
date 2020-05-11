const { ccclass, property } = cc._decorator;

/**
 * 规则。
 */
@ccclass
export default class Rule extends cc.Component {

  /**
   * 规则展开按钮节点。
   */
  @property(cc.Node)
  ruleExpandBtnNode: cc.Node = null;

  /**
   * 番型展开按钮节点。
   */
  @property(cc.Node)
  fanExpandBtnNode: cc.Node = null;

  /**
   * 规则内容节点。
   */
  @property(cc.Node)
  ruleContentNode: cc.Node = null;

  /**
   * 番型内容节点。
   */
  @property(cc.Node)
  fanContentNode: cc.Node = null;

  onClickExpand() {
    if (this.ruleExpandBtnNode) {
      if (this.ruleExpandBtnNode.angle === 0) {
        this.ruleExpandBtnNode.angle = 180;
      } else {
        this.ruleExpandBtnNode.angle = 0;
      }
    }
    if (this.fanExpandBtnNode) {
      if (this.fanExpandBtnNode.angle === 0) {
        this.fanExpandBtnNode.angle = 180;
      } else {
        this.fanExpandBtnNode.angle = 0;
      }
    }
    if (this.ruleContentNode) {
      this.ruleContentNode.active = !this.ruleContentNode.active;
    }
    if (this.fanContentNode) {
      this.fanContentNode.active = !this.fanContentNode.active;
    }
  }
}