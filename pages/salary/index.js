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
        wx.hideNavigationBarLoading();
    }).catch(e => {
      wx.hideNavigationBarLoading();
      console.log(e);
    });;
  
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
    var data =[];
    this.charChart(data);
    wx.hideNavigationBarLoading();
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

  pieChart: function (data) {
    this.chartComponent = this.selectComponent('#pieChart-dom');
    this.chartComponent.init((canvas, width, height) => {
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      // Step 2: 载入数据源,设置百分比
      var pieData = data.data;
      chart.source(pieData, {
        count: {
          formatter: function formatter(val) {
            return val * 100 + '%';
          }
        }
      });
      //配置图例
      chart.legend({
        position: 'right',//可取‘right/left’
        itemFormatter: function itemFormatter(val) {
          return val + "  " + parseInt(data.pieMap[val] * 100) + " %";//设置文字旁边的百分比
        }
      });
      //设置圆环半径
      chart.tooltip(false);
      chart.coord('polar', {
        transposed: true,
        radius: 0.8
      });
      // Step 3：创建图形语法，绘制饼型图，由 a 和 percent 两个属性决定扇形面积，color设置不同name使用的颜色，
      //duration设置图形动画加载的时间长度，easing设置动画的缓动函数（linear quadraticIn quadraticOut 
      //quadraticInOut cubicIn cubicOut cubicInOut elasticIn elasticOut elasticInOut backIn backOut backInOut bounceIn bounceOut bounceInOut）
      chart.axis(false);
      chart.interval().position('a*count').color('label')
        .adjust('stack').style({
          lineWidth: 1,
          stroke: '#fff',
          lineJoin: 'round',
          lineCap: 'round'
        }).animate({
          appear: {
            duration: 1200,
            easing: 'bounceOut'
          }
        });
      // Step 4: 渲染图表
      chart.render();
    });
  },
  levelChart: function (data) {
    this.chartComponent = this.selectComponent('#levelChart-dom');
    this.chartComponent.init((canvas, width, height) => {
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      // Step 2: 载入数据源
      chart.source(data);
      chart.legend(false);
      // Step 3：创建图形语法，绘制柱状图，由 genre 和 sold 两个属性决定图形位置，genre 映射至 x 轴，sold 映射至 y 轴
      chart.interval().position('label*count').color('label');
      // Step 4: 渲染图表
      chart.render();
    });
  },
  circleChart:function(data){
    this.chartComponent = this.selectComponent('#circleChart-dom');
    this.chartComponent.init((canvas, width, height) => {
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      // Step 2: 载入数据源,设置百分比
      var pieData = data.data;
      chart.source(pieData, {
        count: {
          formatter: function formatter(val) {
            return val * 100 + '%';
          }
        }
      });
      //配置图例
      chart.legend({
        position: 'right',//可取‘right/left’
        itemFormatter: function itemFormatter(val) {
          return val + "  " + parseInt(data.pieMap[val] * 100) + " %";//设置文字旁边的百分比
        }
      });
      //设置圆环半径
      chart.tooltip(false);
      chart.coord('polar', {
        transposed: true,
        radius: 0.8,
        innerRadius: 0.618
      });
      // Step 3：创建图形语法，绘制饼型图，由 a 和 percent 两个属性决定扇形面积，color设置不同name使用的颜色，
      //duration设置图形动画加载的时间长度，easing设置动画的缓动函数（linear quadraticIn quadraticOut 
      chart.axis(false);
      chart.interval().position('a*count').color('label')
        .adjust('stack').style({
          lineWidth: 1,
          stroke: '#fff',
          lineJoin: 'round',
          lineCap: 'round'
        });
      // Step 4: 渲染图表
      chart.render();
    });
  },
  radialChart:function(data){
    this.chartComponent = this.selectComponent('#radialChart-dom');
    this.chartComponent.init((canvas, width, height) => {
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      chart.coord('polar', {
        transposed: true,
        endAngle: Math.PI
      });
      chart.source(data.data, {
        count: {
          formatter: function formatter(val) {
            return val * 100 + '%';
          }
        }
      });
      chart.axis('label', {
        grid: null,
        line: null
      });
      chart.axis('count', false);
      chart.legend({
        position: 'right',
        itemFormatter: function itemFormatter(val) {
          return val + "  " + parseInt(data.pieMap[val] * 100) + " %";//设置文字旁边的百分比
        }
      });
      chart.interval().position('label*count').color('label');
      chart.render();
    });
  },

  salaryYearAveragChart: function (data) {
    this.chartComponent = this.selectComponent('#salaryYearAverage-dom');
    this.chartComponent.init((canvas, width, height) => {
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      // Step 2: 载入数据源
      //console.log(data)
      chart.source(data);
      chart.legend(false);
      chart.axis("average",{
        label: function label(text, index, total) {
          return {text:(text/1000)+"K"};
        }
      });

      // Step 3：创建图形语法，绘制柱状图，由 genre 和 sold 两个属性决定图形位置，genre 映射至 x 轴，sold 映射至 y 轴
      chart.interval().position('label*average').color('label');

      data.map(function (obj) {
        chart.guide().text({
          position: [obj.label, obj.average],
          content: obj.average+"元",
          style: {
            fontSize: 11,
            textAlign: 'center'
          },
          offsetY: -12
        });
      });

      // Step 4: 渲染图表
      chart.render();


    });
  },

  districtChart:function(data){
    this.chartComponent = this.selectComponent('#districtChart-dom');
    this.chartComponent.init((canvas, width, height) => {
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      // Step 2: 载入数据源
      chart.source(data);
      chart.legend(false);

      // Step 3：创建图形语法，绘制柱状图，由 genre 和 sold 两个属性决定图形位置，genre 映射至 x 轴，sold 映射至 y 轴
      chart.interval().position('label*count').color('label');

      // Step 4: 渲染图表
      chart.render();


    });
  },
  salaryChart:function (data){
    this.chartComponent = this.selectComponent('#salaryChart-dom');
    this.chartComponent.init((canvas, width, height) => {

      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });

      chart.source(data, {
        key: {
          formatter(val) {
            return val + "月";
          },
          range: [0, 1]
        },
        value: {
          tickCount: 4
        }
      });

      chart.axis('value', {
        label: (text, index, total) => {
          const cfg = {
            text: (text / 1000).toFixed(1) + 'K'
          };
          return cfg;
        }
      })

      chart.tooltip({
        custom: true, // 自定义 tooltip 内容框
        onChange(obj) {
          // const legend = chart.get('legendController').legends.top[0];
          // const tooltipItems = obj.items;
          // const legendItems = legend.items;
          // const map = {};
          // legendItems.map(item => {
          //   map[item.name] = Object.assign({}, item);
          // });
          // tooltipItems.map(item => {
          //   const { name, value } = item;
          //   if (map[name]) {
          //     map[name].value = value + "元";
          //   }
          // });
          // legend.setItems(Object.values(map));
        },
      
        onHide() {
          // const legend = chart.get('legendController').legends.top[0];
          // legend.setItems(chart.getLegendItems().country);
        }
      });
      chart.legend(false);

      // chart.line().position('key*value').color('type', val => {
      //   // if (val === '薪资') {
      //   //   return '#32933D';
      //   // }
      // });

      //chart.line().position('key*value').color("#32933D");
      chart.point().position('key*value').style({
        stroke: '#fff',
        lineWidth: 1
      })//.color("#32933D");

      chart.area().position('key*value').shape('smooth');//.color("#32933D");
      chart.line().position('key*value').shape('smooth');
      chart.render();
    });
  },

  charChart:function(data){

    this.chartComponent = this.selectComponent('#charChart-dom');
    this.chartComponent.init((canvas, width, height) => {
    

      data = data.map((t)=>{
        t.x = t.x/375*width;
        t.y = t.y/260*height;
        t.size = t.size? parseInt(t.size*.75):0;
        console.log(t.size);
        return t;
      })

      var chart = new F2.Chart({
        id: canvas,
        width,
        height,
        pixelRatio: this.data.system.pixelRatio
      });
      chart.source(data, {
        x: {
          nice: false
        },
        y: {
          nice: false
        }
      });
      chart.legend(false);
      chart.axis(false);
      chart.tooltip(false);

      chart.point().position('x*y').color('category').shape('cloud');
      chart.render();
    });


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

var Util = F2.Util;
// 获取 text 文本的图形属性
function getTextAttrs(cfg) {
  return Util.mix({}, {
    fillOpacity: cfg.opacity,
    fontSize: cfg.origin._origin.size,
    rotate: cfg.origin._origin.rotate * Math.PI / 180,
    text: cfg.origin._origin.text,
    textAlign: 'center',
    fontFamily: cfg.origin._origin.font,
    fill: cfg.color,
    textBaseline: 'Alphabetic'
  }, cfg.style);
}

// 给point注册一个词云的shape
F2.Shape.registerShape('point', 'cloud', {
  draw: function draw(cfg, container) {
    var attrs = getTextAttrs(cfg);
    var x = cfg.x;
    var y = this._coord.y.start - cfg.y;
    return container.addShape('text', {
      attrs: Util.mix(attrs, {
        x: x,
        y: y
      })
    });
  }
});