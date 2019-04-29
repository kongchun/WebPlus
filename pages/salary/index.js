// pages/salary/index.js
import F2 from '@antv/wx-f2';
const app = getApp();
const priceSort = { "面议": 0,  "<5K": 1, "5-8K": 2, "8-10K": 3, "10-15K": 4, "15-20K": 5, ">20K": 6};
const yearSort = { "3年以下": 1, "3-5年": 2, "5-10年": 3, "不限": 4 };
const eduSort = { "大专": 1, "本科": 2, "硕士": 3, "不限": 0 };
const districtSort = { "工业园区": 1, "姑苏区": 2, "高新区": 3, "吴中区": 4, "相城区": 5, "吴江区": 6, "苏州周边": 7 }

Page({

  /**
   * 页面的初始数据
   */
  data: {
    host: wx.host,
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
    wx.pro.getStorage('salaryData').then(salary=>{
        this.setData({ salary });
    })
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
    this.getDataStatistics();
  },
  getDataStatistics:function(){
    wx.api.get(wx.api.ADDR.DATA_STATISTICS).then(res => {
      if (!!res && 200 == res.statusCode && !!res.data) {
        let data = res.data;
        if (!!data) {
          var salayCard = "hidden";
          var jobCard = "hidden";
          if (data.companyRank != null && data.companyRank.length > 0) {
            salayCard=""
          }
          if (data.jobRank != null && data.jobRank.length > 0) {
            jobCard = ""
          }
          this.setData({ tableData: data, salayCard: salayCard, jobCard: jobCard});
        }
      }
    }).catch(e => {
      wx.hideNavigationBarLoading();
      console.log(e);
    });;
  },
  getNewAverageSalary : function(){
    wx.api.get(wx.api.ADDR.GET_NEW_AVG_SALARY).then(res => {
      if (!!res && 200 == res.statusCode && !!res.data) {
        let salaryData = res.data.salary;
        this.salaryChart(res.data.arr || []);
        if (!!salaryData){
          this.setData({ salary: salaryData });
        }
      }
    }).catch(e => {
      wx.hideNavigationBarLoading();
      console.log(e);
    });
  },
  getChartsSalaryInfo: function(){
    wx.api.get(wx.api.ADDR.GET_CHARTS_SALARY_INFO).then(res => {
      if (!!res && 200 == res.statusCode && !!res.data) {
        let data = res.data;
        console.log(data);
        this.salaryYearAveragChart(this.sortFilter(yearSort, data.yearRange));
        this.districtChart(this.sortFilter(districtSort,data.districtRange));
        this.radialChart(this.toPieChart(this.sortFilter(priceSort, data.salaryRange)));
        this.circleChart(this.toPieChart(this.sortFilter(yearSort, data.yearRange)));
        this.levelChart((this.sortFilter(eduSort,data.eduRange)));
        //this.charChart();
        // this.pieChart(this.toPieChart(this.sortFilter(priceSort, data.salaryRange)));
        wx.hideNavigationBarLoading();
      }
    }).catch(e=>{
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
  sortFilter:function (sortKey, data){
    return data.sort(function (a, b) {
      return sortKey[a.label] - sortKey[b.label];
    });
  },
  toPieChart:function (data) {
    let total = 0;
    let pieMap = {};
    let dealData = {};
    //根据count值计算百分比
    data.map(function (item, index, input) {
      total += item.count;
    })
    data.map(function (item, index, input) {
      item.count = parseFloat((parseFloat(item.count) / total).toFixed(2))
      item.a = '1';//增加a属性
      pieMap[item.label] = item.count;
    })
    dealData.data = data;
    dealData.pieMap = pieMap;
    return dealData;
  },

  charChart:function(){
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


    this.chartComponent = this.selectComponent('#charChart-dom');
    this.chartComponent.init((canvas, width, height) => {
      var dv = new DataSet.View().source(data);
      var range = dv.range('value');
      var min = range[0];
      var max = range[1];
      var MAX_FONTSIZE = 36; // 最大的字体
      var MIN_FONTSIZE = 12; // 最小的字体
      var canvasWidth = width; // 获取画布宽度
      var canvasHeight = height; // 获取画布高度
      // 生成词云的布局
      dv.transform({
        type: 'tag-cloud',
        fields: ['x', 'value'],
        size: [canvasWidth, canvasHeight], // 同 canvas 画布保持一致
        font: 'Verdana',
        padding: 0,
        timeInterval: 5000, // max execute time
        rotate: function rotate() {
          var random = ~~(Math.random() * 4) % 4;
          if (random == 2) {
            random = 0;
          }
          return random * 90; // 0, 90, 270
        },
        fontSize: function fontSize(d) {
          if (d.value) {
            return (d.value - min) / (max - min) * (MAX_FONTSIZE - MIN_FONTSIZE) + MIN_FONTSIZE;
          }
          return 0;
        }
      });

      var chart = new F2.Chart({
        id: canvas,
        padding: 0,
        pixelRatio: window.devicePixelRatio
      });
      chart.source(dv.rows, {
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
  }
})
