const { ccclass, property } = cc._decorator;

/**
 * 规则。
 */
@ccclass
export default class Rule extends cc.Component {

  /**
   * 规则按钮节点。
   */
  @property(cc.Node)
  ruleBtnNode: cc.Node = null;

  /**
   * 番型按钮节点。
   */
  @property(cc.Node)
  fanBtnNode: cc.Node = null;

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

  /**
   * 点击基本玩法按钮的处理。
   */
  onClickRuleButton() {
    if (this.ruleBtnNode && !this.ruleBtnNode.active) {
      this.ruleBtnNode.active = true;
    }
    if (this.fanBtnNode && this.fanBtnNode.active) {
      this.fanBtnNode.active = false;
    }
    if (this.ruleContentNode && !this.ruleContentNode.active) {
      this.ruleContentNode.active = true;
    }
    if (this.fanContentNode && this.fanContentNode.active) {
      this.fanContentNode.active = false;
    }
  }

  /**
   * 点击基本番型按钮的处理。
   */
  onClickFanButton() {
    if (this.ruleBtnNode && this.ruleBtnNode.active) {
      this.ruleBtnNode.active = false;
    }
    if (this.fanBtnNode && !this.fanBtnNode.active) {
      this.fanBtnNode.active = true;
    }
    if (this.ruleContentNode && this.ruleContentNode.active) {
      this.ruleContentNode.active = false;
    }
    if (this.fanContentNode && !this.fanContentNode.active) {
      this.fanContentNode.active = true;
    }
  }
}