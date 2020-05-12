import cache from '../cache';
import uiTools from '../ui/tools';

export interface GacSdk {
  getTemporaryCode: (appId: string) => void;
  takePreOrderNum: (orderId: string) => void;
}

function _onGetTemporaryCodeCallback(res: string) {
  let obj = JSON.parse(res);
  if (obj.code !== 200) {
    uiTools.toast(`获取凭证失败，错误码：${obj.code}`);
  } else {
    cache.sdkEvent.emit('gacLogin', obj.data.temporaryCode);
  }
}

function _onPayoffInfoCallback(res: number) {
  cc.log('_onPayoffInfoCallback');
  cc.log(res);
  let code = +res;
  if (code === 0) {
    cache.sdkEvent.emit('gacPayFailed');
  } else if (code === 1) {
    cache.sdkEvent.emit('gacPaySuccess');
  } else if (code === 2) {
    cache.sdkEvent.emit('gacPayCanceled');
  } else if (code === 3) {
    cache.sdkEvent.emit('gacPayStarted');
  }
}

/**
 * 检测并准备青苹果钱包的sdk。
 */
export function gacDetectAndPrepare(): GacSdk | undefined {
  let sdk: GacSdk | undefined;
  let androidSdk = (<any>window).native;  // 安卓平台接入的函数的位置在window.native下。
  cc.log(`androidSdk is:`);
  cc.log(androidSdk);
  let iosSdk = (<any>window).webkit;  // IOS平台在window.webkit下。
  if (androidSdk !== undefined) {  // 是安卓平台。
    if (androidSdk.getTemporaryCode) {  // window.native.getTemporaryCode函数存在。
      cc.log(`androidSdk.getTemporaryCode is:`);
      cc.log(androidSdk.getTemporaryCode);
      cache.channel = 'gac';  // 记录当前的登入渠道是青苹果钱包。
      sdk = {  // sdk由两个函数组成。
        getTemporaryCode: function (appId: string) {
          androidSdk.getTemporaryCode(appId);
        },  // 用于登入的函数。
        takePreOrderNum: function (orderId: string) {
          androidSdk.takePreOrderNum(orderId);
        }
      };
      var devieceUtil = (<any>window).devieceUtil || {};  // 在安卓下，window.devieceUtil里面用来存放登入和支付的回调函数，我不确定这个对象是否存在，因此不存在我就创建之。
      (<any>window).devieceUtil = devieceUtil;
    }
  } else if (iosSdk !== undefined) {  // 是IOS平台。
    if (iosSdk.messageHandlers && iosSdk.messageHandlers.getTemporaryCode && iosSdk.messageHandlers.getTemporaryCode.postMessage) {
      cache.channel = 'gac';  // 记录当前的登入渠道是青苹果钱包。
      sdk = {  // sdk由两个函数组成。
        getTemporaryCode: function (appId: string) {
          iosSdk.messageHandlers.getTemporaryCode.postMessage(appId);
        },
        takePreOrderNum: function (orderId: string) {
          iosSdk.messageHandlers.takePreOrderNum.postMessage(orderId);
        }
      };
      var devieceUtil = (<any>window).devieceUtil || {};  // 在IOS下，window.devieceUtil里面用来存放登入和支付的回调函数，我不确定这个对象是否存在，因此不存在我就创建之。
      (<any>window).devieceUtil = devieceUtil;
    }
  }
  if (sdk) {  // 安卓平台和IOS平台下sdk !== undefined。
    cc.log('devieceUtil is:');
    cc.log(devieceUtil);
    devieceUtil.onGetTemporaryCodeCallback = _onGetTemporaryCodeCallback;  // 设置登入的回调函数。
    devieceUtil.getPaymentBackInfo = _onPayoffInfoCallback;  // 设置支付的回调函数。
    //devieceUtil.onPayoffInfoCallback = _onPayoffInfoCallback;  // 设置支付的回调函数。
  }
  cc.log('sdk is:');
  cc.log(sdk);
  return sdk;
}