//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    system: { windowHeight: 603, windowWidth:373}
  },
  onLoad: function () {
    wx.pro.getSystemInfo().then(res=>{
      this.setData({ system: res });
    });
  }
})
