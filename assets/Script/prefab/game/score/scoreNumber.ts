const { ccclass, property } = cc._decorator;

/**
 * 对局流水界面中的分数。
 */
@ccclass
export default class ScoreNumber extends cc.Component {

  /**
   * 容器节点。
   */
  @property(cc.Node)
  containerNode: cc.Node = null;

  /**
   * 正数的颜色。
   */
  @property(cc.Color)
  positiveColor: cc.Color = cc.color(230, 149, 75, 255);

  /**
   * 负数的颜色。
   */
  @property(cc.Color)
  negativeColor: cc.Color = cc.color(102, 89, 84, 255);

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
   * 数字图片精灵帧。
   */
  @property(cc.SpriteFrame)
  numberSpriteFrames: cc.SpriteFrame[] = [];

  /**
   * 设置。
   * @param num 数字。
   */
  setup(num: number) {
    if (this.containerNode) {
      this.containerNode.removeAllChildren(true);

      let chars = num.toString();
      if (chars[0] === '-') {
        if (this.minusSignSpriteFrame) {
          let node = new cc.Node();
          node.color = this.negativeColor;
          let sprite = node.addComponent(cc.Sprite);
          sprite.spriteFrame = this.minusSignSpriteFrame;
          this.containerNode.addChild(node);
        }
      } else {
        if (this.plusSignSpriteFrame) {
          let node = new cc.Node();
          node.color = this.positiveColor;
          let sprite = node.addComponent(cc.Sprite);
          sprite.spriteFrame = this.plusSignSpriteFrame;
          this.containerNode.addChild(node);
        }
      }

      // 添加数字节点。
      for (let c of chars) {
        if (c !== '-') {
          let node = new cc.Node();
          if (chars[0] === '-') {
            node.color = this.negativeColor;
          } else {
            node.color = this.positiveColor;
          }
          let sprite = node.addComponent(cc.Sprite);
          sprite.spriteFrame = this.numberSpriteFrames[+c];
          this.containerNode.addChild(node);
        }
      }
    }
  }
}