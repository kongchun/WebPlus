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
    scale: 16,
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
      console.log(location)
      let circles = [];
      let markers = [];
      circles.push({
        latitude: location.latitude,
        longitude: location.longitude,
        color: '#81A5FFAA',
        fillColor: '#CBDEF2AA',
        radius: 1500,
        strokeWidth: 2,
      });
      circles.push({
        latitude: location.latitude,
        longitude: location.longitude,
        color: '#81A5FFAA',
        fillColor: '#AACBFCAA',
        radius: 800,
        strokeWidth: 2,
      });

      markers.push({
        id: -1,
        name: '我的位置',
        latitude: location.latitude,
        longitude: location.longitude,
        rotate: 0,
        iconPath: '/images/mysite.png',
        width: 30,
        height: 30,
        alpha: 0.9
      });
      let i = 0;
      markers.push({
        id: ++i,
        name: '我的位置',
        latitude: location.latitude+0.005,
        longitude: location.longitude,
        rotate: 0,
        iconPath: '/images/min_site.png',
        width: 30,
        height: 30,
        alpha: 0.9,
        callout: {
          content: '6999.99元',
          color: '#ffffff',
          fontSize: 13,
          borderRadius: 10,
          padding: 5,
          bgColor: '#1296DB'
          ,display: 'ALWAYS'
        }
      });

      markers.push({
        id: ++i,
        name: '我的位置',
        latitude: location.latitude - 0.005,
        longitude: location.longitude,
        rotate: 0,
        iconPath: '/images/max_site.png',
        width: 30,
        height: 30,
        alpha: 0.9,
        callout: {
          content: '9999.99元',
          color: '#ffffff',
          fontSize: 13,
          borderRadius: 10,
          padding: 5,
          bgColor: '#1296DB'
          ,display: 'ALWAYS'
        }
      });

      this.setData({ circles: circles, latitude: location.latitude, longitude: location.longitude, markers: markers });
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