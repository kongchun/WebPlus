// pages/pubpage/pubpage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!!options && !!options.url){
      this.setData({ url: options.url});
    }else{
      wx.navigateBack({
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})

//   ,
//   "tabBar": {
//   "color": "#A2A2A2",
//     "selectedColor": "#5B8AF6",
//       "backgroundColor": "#FFFFFF",
//         "borderStyle": "white",
//           "position": "bottom",
//             "list": [
//               {
//                 "pagePath": "pages/index/index",
//                 "iconPath": "images/bar_home_black.png",
//                 "selectedIconPath": "images/bar_home_black.png",
//                 "selectedText": "薪资报告",
//                 "text": "薪资报告"
//               },
//               {
//                 "pagePath": "pages/public/aboutus",
//                 "iconPath": "images/bar_mine_black.png",
//                 "selectedIconPath": "images/bar_mine_black.png",
//                 "selectedText": "关于我们",
//                 "text": "关于我们"
//               }
//             ]
// }