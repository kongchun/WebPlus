// pages/company/detail/index.js
const salaryService = require('../../../service/salaryService.js');
import {
  html2json
} from '../../../lib/html2json';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    map:{
      speed: 0,//速度 
      accuracy: 16,//位置精准度 
      markers: [],
      circles: {},
      controls: [],
      radius: 3000,
      scale: 16,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _id = options['_id'];
    if (!!!_id) {
      wx.navigateBack({});
      return;
    }
    console.log(_id);
    this._id = _id;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.loadCompany();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
   
  },

  loadCompany:function(){
    salaryService.getCompanyInfoById(this._id).then(company => {
      let salaryLabel = company.salary;
      if (salaryLabel <= 0) {
        salaryLabel = 0;
      } else if (salaryLabel >= 1000) {
        salaryLabel = salaryLabel / 1000 + 'K';
      }
      company.salaryLabel = salaryLabel;
      let description = company.description.replace(/(^\s*)|(\s*$)/g, "");
      if (description!=""){
        if (description.indexOf("\\n") > -1) {
          description = description.replace(/\\n/ig, "<br>");
        } else {
          description = description.replace(/。\s/ig, "。<br>");
        }
      }

      //console.log(description)
      company.description2 = html2json(description);
      if (company.description2.length > 0) {
        company.description = [company.description2[0]];
      }
      if (company.description2.length > 1) {
        company.description.push(company.description2[1]);
      }
      if (company.description2.length > 2) {
        company.description.push(company.description2[2]);
      }
      company.bref = false;
      if (company.description2.length <= 1) {
        company.bref = true;
      }


      company.position = this.Convert_BD09_To_GCJ02(company.position.lat, company.position.lng);

      this.setData({
        company
      });
      this.formatMapData();
    })
  },

  formatMapData: function () {
    var markers = [];
    var data = this.data.company;
      markers.push({
        latitude: data.position.lat,
        longitude: data.position.lng,
        rotate: 0,
        //iconPath: '../../../images/icon/mark.png',
        //width: 20,
        //height: 20,
        alpha: 0.9
      });
    
    this.setData({
      map: {
        markers: markers
      }
    })
  },

  showBrefAll: function() {
    this.setData({
      'company.bref': true,
      'company.description': this.data.company.description2
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let company = this.data.company;
    const path = `pages/company/detail/index?_id=${company._id}`;
    return {
      title: `${company.alias}（${company.score||2.5}）`,
      path,
      imageUrl: `${company.logo ||'../../../images/logo_def.jpg'}`
    };
  },

  getCompanyMap: function() {
    let company = this.data.company;
    let position = company.position;
    wx.openLocation({
      latitude: position.lat,
      longitude: position.lng,
      name: company.alias,
      address: company.addr,
      scale: 15
    });
  },

  Convert_BD09_To_GCJ02: function($lat, $lng) {
    let $x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    let $x = $lng - 0.0065;
    let $y = $lat - 0.006;
    let $z = Math.sqrt($x * $x + $y * $y) - 0.00002 * Math.sin($y * $x_pi);
    let $theta = Math.atan2($y, $x) - 0.000003 * Math.cos($x * $x_pi);
    $lng = $z * Math.cos($theta);
    $lat = $z * Math.sin($theta);
    return {
      lng: $lng,
      lat: $lat
    };
  }
})