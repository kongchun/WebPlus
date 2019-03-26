// pages/index/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    system: { windowHeight: 603, windowWidth: 373 },
    latitude: 0,//纬度 
    longitude: 0,//经度 
    speed: 0,//速度 
    markers: [],
    covers: [],
    circles: {},
    controls: [],
    scale: 14,
    outData:{},
    insideData:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.pro.getSystemInfo().then(res => {
      this.setData({ system: res });
    });
    // wx.pro.getLocation({ type: 'gcj02'}).then(location=>{
    //   console.log(location)
    //   this.setData({ latitude: location.latitude, longitude: location.longitude });
    // });
    wx.pro.getLocation({ type: 'gcj02', altitude: true }).then(location => {
      let circles = [];
      let markers = [];
      let outData = {};
      let insideData = {};
      let latitude = location.latitude;
      let longitude = location.longitude;
      let my = {
        id: -1,
        name: '我的位置',
        latitude: latitude,
        longitude: longitude,
        rotate: 0,
        iconPath: '/images/mysite.png',
        width: 30,
        height: 30,
        alpha: 0.9
      };
      wx.service.makeSurroundingSalaryData(latitude, longitude).then(d=>{
        console.log(d)
        circles = d.circles;
        markers = d.markers;
        outData = d.outData;
        insideData = d.insideData;
        markers.push(my);
        this.setData({ circles, latitude: latitude, longitude: longitude, markers, outData, insideData });
      }).catch(e=>{
        markers.push(my);
        this.setData({ circles, latitude: latitude, longitude: longitude, markers, outData, insideData });
      });
    });
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