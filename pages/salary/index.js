// pages/salary/index.js
import F2 from '@antv/wx-f2';
const salaryService = require('../../service/salaryService.js');
const charts = require('../../utils/charts.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    host: wx.host,
    qcodes: [wx.host + '/images/wx/qrcode.jpg', wx.host +'/images/wx/qrcode2.jpg'],
    opts: {
      lazyLoad: true // 延迟加载组件
    },
    requestData: null, // 异步请求获取的数据
    system: { windowHeight: 603, windowWidth: 373 },
    salary: { month: '-', average: "--", read: 0 },
    tableData:{},
    salayCard:"hidden",
    jobCard:"hidden"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.pro.getSystemInfo().then(res => {
      this.setData({ system: res });
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initChart();
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
  // onPullDownRefresh: function () {
  
  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {
  
  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const salary = this.data.salary;
    return {
      title: salary.month + ' 月前端报告',
      desc: '基于前端大数据统计'
    };
  },

  initChart: function(){
    wx.showNavigationBarLoading();
    this.getNewAverageSalary();
    this.getChartsSalaryInfo();
    this.getTechCloudInfo();
    this.getDataStatistics();
  },
  getDataStatistics:function(){
    salaryService.getDataStatistics().then((data)=>{
        var salayCard = "hidden";
        var jobCard = "hidden";
        if (data.companyRank != null && data.companyRank.length > 0) {
          salayCard=""
        }
        if (data.jobRank != null && data.jobRank.length > 0) {
          jobCard = ""
        }
        this.setData({ tableData: data, salayCard: salayCard, jobCard: jobCard});
        this.getCompanyRankInfo(data);
        wx.hideNavigationBarLoading();
    }).catch(e => {
      wx.hideNavigationBarLoading();
      console.log(e);
    });;
  
  },
  getCompanyRankInfo:function(data){
    salaryService.getCompanyRankInfo(data).then((data)=>{
      this.setData({ tableData: data });
    });
     
  },
  getNewAverageSalary : function(){
      salaryService.getAverageSalary().then(({monthSalary, latestSalary})=>{
        this.salaryChart(monthSalary);
        this.setData({ salary: latestSalary });
      }).catch(e => {
        wx.hideNavigationBarLoading();
        console.log(e);
    });
  },

  getTechCloudInfo:function(){
    salaryService.getTechCloudInfo().then((data)=>{
      this.tagCloudChart(data);
      wx.hideNavigationBarLoading();
    }).catch(e => {
      wx.hideNavigationBarLoading();
      console.log(e);
    });

  },
  
  getChartsSalaryInfo: function(){
    salaryService.getChartsSalaryInfo().then(({ salaryYearAveragChartData, districtChartData, radialChartData, circleChartData, levelChartData })=>{
      this.salaryYearAveragChart(salaryYearAveragChartData);
      this.districtChart(districtChartData);
      this.radialChart(radialChartData);
      this.circleChart(circleChartData);
      this.levelChart(levelChartData);
      wx.hideNavigationBarLoading();
    }).catch(e => {
      wx.hideNavigationBarLoading();
      console.log(e);
    });
  },


  levelChart: function (data) {
    let chartComponent =  this.selectComponent('#levelChart-dom');
    charts.barChart(chartComponent, data);
  },
  circleChart:function(data){
    let chartComponent = this.selectComponent('#circleChart-dom');
    charts.circleChart(chartComponent,data);
  },
  radialChart:function(data){
    let chartComponent = this.selectComponent('#radialChart-dom');
    charts.radialChart(chartComponent,data);
  },

  salaryYearAveragChart: function (data) {
    let chartComponent = this.selectComponent('#salaryYearAverage-dom');
    charts.salaryYearAveragChart(chartComponent,data);
  },

  districtChart:function(data){
    let chartComponent = this.selectComponent('#districtChart-dom');
    charts.barChart(chartComponent, data);
  },


  salaryChart:function (data){
    let chartComponent = this.selectComponent('#salaryChart-dom');
    charts.salaryChart(chartComponent,data);
  },

  tagCloudChart:function(data){
    let chartComponent = this.selectComponent('#charChart-dom');
    charts.tagCloudChart(chartComponent,data);
  },

  toPage : function(){
    wx.navigateTo({
      url: '/pages/url/pubpage?url='+encodeURIComponent("https://mp.weixin.qq.com/mp/homepage?__biz=MzIyMjE2ODEzNg==&hid=12"),
    })
  },

  showCodeTap: function(event){
    let curr = event.currentTarget.dataset.code || this.data.qcodes[0];
    wx.previewImage({
      current: curr,
      urls: this.data.qcodes,
    })
  }
})

