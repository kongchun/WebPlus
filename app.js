//app.js
// wx.host = "https://technologycloud.cn";
wx.host = "https://salary.techwebplus.cn";
//wx.host = "http://salary.webstd.cn";
wx.host = "http://127.0.0.1:5000";
wx.api = require('utils/api.js');
wx.pro = require('utils/promisify.js');
wx.service = require('utils/service.js');
const cache = require('utils/cache.js');
//https://unpkg.com/@antv/f2@3.3.9/dist/
App({
  onLaunch: function () {
    // 展示本地存储能力
    // 登录
    var data = new Date();
    let month = (data.getFullYear()+""+data.getMonth());
    let lastMonth = cache.get("m");
    if(lastMonth != month){
      wx.clearStorageSync();
      cache.set("m", month);
    }
    
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          // wx.getUserInfo({
          //   success: res => {
          //     // 可以将 res 发送给后台解码出 unionId
          //     this.globalData.userInfo = res.userInfo

          //     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          //     // 所以此处加入 callback 以防止这种情况
          //     if (this.userInfoReadyCallback) {
          //       this.userInfoReadyCallback(res)
          //     }
          //   }
          // })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})