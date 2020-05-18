import uiTools from '../model/ui/tools';
import cache from '../model/cache';

const { ccclass, property } = cc._decorator;

/**
 * 充值界面。
 */
@ccclass
export default class Recharge extends cc.Component {

  private _onGacPayStartedHandler = this._onGacPayStarted.bind(this);
  private _onGacPayCanceledHandler = this._onGacPayCanceled.bind(this);
  private _onGacPayFailedHandler = this._onGacPayFailed.bind(this);
  private _onGacPaySuccessHandler = this._onGacPaySuccess.bind(this);

  private _payingOrderId = '';
  private _payingGacOrderId = '';
  private _paying = false;

  onLoad() {
    cache.sdkEvent.on('gacPayStarted', this._onGacPayStartedHandler);
    cache.sdkEvent.on('gacPayCanceled', this._onGacPayCanceledHandler);
    cache.sdkEvent.on('gacPayFailed', this._onGacPayFailedHandler);
    cache.sdkEvent.on('gacPaySuccess', this._onGacPaySuccessHandler);
  }

  onDestroy() {
    cache.sdkEvent.off('gacPayStarted', this._onGacPayStartedHandler);
    cache.sdkEvent.off('gacPayCanceled', this._onGacPayCanceledHandler);
    cache.sdkEvent.off('gacPayFailed', this._onGacPayFailedHandler);
    cache.sdkEvent.off('gacPaySuccess', this._onGacPaySuccessHandler);
  }

  private _sync() {
    cache.cmd.execCmd('gacPay/sync', {
      orderId: this._payingOrderId
    }).then((res) => {
      if (res.err !== undefined) {
        uiTools.toast('同步订单失败');
        return;
      }

      // 清缓存。
      let str = cc.sys.localStorage.getItem('payingOrders2');
      let orders: string[] | undefined;
      try {
        orders = JSON.parse(str);
      } catch (err) {
      }
      if (orders instanceof Array) {
        let idx = orders.indexOf(this._payingOrderId);
        if (idx >= 0) {
          orders.splice(idx, 1);
          if (orders.length > 0) {
            cc.sys.localStorage.setItem('payingOrders2', JSON.stringify(orders));
          } else {
            cc.sys.localStorage.removeItem('payingOrders2');
          }
        }
      }

    }).catch((err) => {
      cc.error(err);
    }).then(() => {
      this._paying = false;
    });
  }

  private _onGacPayCanceled() {
    cc.log('gac pay canceled');
    this._sync();
  }

  private _onGacPayFailed() {
    cc.log('gac pay failed');
    this._sync();
  }

  private _onGacPaySuccess() {
    cc.log('gac pay success');
    this._sync();
  }

  private _onGacPayStarted() {
    cc.log('gac pay started');
    cache.cmd.execCmd('gacPay/enterPaying', {
      orderId: this._payingOrderId
    }).catch((err) => {
      cc.error(err);
    });
  }

  /**
   * 使用青苹果支付来购买豆子。
   * @param bean 豆子数。
   */
  private async _buyBeanUseGac(bean: number) {
    this._paying = true;

    // 创建预订单。
    try {
      var res = await cache.cmd.execCmd('gacPay/preOrder', {
        tradeName: `bean${bean}`,
        q: 1
      });
    } catch (err) {
      cc.error(err);
      uiTools.toast('创建订单失败');
      return;
    }
    if (res.err !== undefined) {
      cc.log(res);
      uiTools.toast('创建订单失败');
      return;
    }
    this._payingOrderId = res.orderId;
    this._payingGacOrderId = res.gacOrderId;

    // 开始支付。
    let orders: string[] | undefined;
    let str = cc.sys.localStorage.getItem('payingOrders2');
    if (str) {
      try {
        orders = JSON.parse(str);
      } catch (err) {
      }
      if (orders instanceof Array) {
        orders.push(this._payingOrderId);
      } else {
        orders = [this._payingOrderId];
      }
    } else {
      orders = [this._payingOrderId];
    }
    cc.sys.localStorage.setItem('payingOrders2', JSON.stringify(orders));
    cache.gacSdk.takePreOrderNum(this._payingGacOrderId);
  }

  /**
   * 购买豆子。
   * @param bean 豆子数。
   */
  private async _buyBean(bean: number) {

    if (this._paying) {
      uiTools.toast('上一笔支付还未完成');
      return;
    }

    // 尝试青苹果支付。
    if (cache.gacSdk) {
      return this._buyBeanUseGac(bean);
    } else {
      uiTools.toast('没有支付途径');
    }
  }

  onClickBean10() {
    this._buyBean(10);
  }

  onClickBean20() {
    this._buyBean(20);
  }

  onClickBean50() {
    this._buyBean(50);
  }

  onClickBean100() {
    this._buyBean(100);
  }

  onClickBean200() {
    this._buyBean(200);
  }

  onClickBean300() {
    this._buyBean(300);
  }

  onClickBean500() {
    this._buyBean(500);
  }

  onClickBean1000() {
    this._buyBean(1000);
  }
}