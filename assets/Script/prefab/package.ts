const { ccclass, property } = cc._decorator;

@ccclass
export default class Package extends cc.Component {

  @property(cc.Prefab)
  prefabs: cc.Prefab[] = [];
}