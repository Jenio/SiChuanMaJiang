const { ccclass, property } = cc._decorator;

/**
 * 结果界面中的分数。
 */
@ccclass
export default class ResScore extends cc.Component {

  /**
   * 容器节点。
   */
  @property(cc.Node)
  containerNode: cc.Node = null;

  /**
   * 加号精灵帧。
   */
  @property(cc.SpriteFrame)
  plusSignSpriteFrame = null;

  /**
   * 减号精灵帧。
   */
  @property(cc.SpriteFrame)
  minusSignSpriteFrame = null;

  /**
   * 正数图片精灵帧。
   */
  @property(cc.SpriteFrame)
  positiveNumberSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 负数图片精灵帧。
   */
  @property(cc.SpriteFrame)
  negativeNumberSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 设置。
   * @param num 数字。
   */
  setup(num: number) {
    if (this.containerNode) {
      this.containerNode.removeAllChildren(true);

      let chars = num.toString();
      let sfs = chars[0] === '-' ? this.negativeNumberSpriteFrames : this.positiveNumberSpriteFrames;

      // 添加符号节点。
      if (sfs === this.positiveNumberSpriteFrames) {
        if (this.plusSignSpriteFrame) {
          let node = new cc.Node();
          let sprite = node.addComponent(cc.Sprite);
          sprite.spriteFrame = this.plusSignSpriteFrame;
          this.containerNode.addChild(node);
        }
      } else {
        if (this.minusSignSpriteFrame) {
          let node = new cc.Node();
          let sprite = node.addComponent(cc.Sprite);
          sprite.spriteFrame = this.minusSignSpriteFrame;
          this.containerNode.addChild(node);
        }
      }

      // 添加数字节点。
      for (let c of chars) {
        if (c !== '-') {
          let node = new cc.Node();
          let sprite = node.addComponent(cc.Sprite);
          sprite.spriteFrame = sfs[+c];
          this.containerNode.addChild(node);
        }
      }
    }
  }
}