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
        this.charChart();
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
     console.log(width);
      console.log(height);
      var data = [{ "x": 243.5, "value": 1383220000, "category": "asia", "text": "China", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 36, "padding": 1, "y": 121, "width": 160, "height": 72, "xoff": 0, "yoff": 0, "x1": 80, "y1": 35, "x0": -80, "y0": -29, "hasText": true }, { "x": 276.5, "value": 1316000000, "category": "asia", "text": "India", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 34, "padding": 1, "width": 96, "height": 123, "xoff": 160, "yoff": 0, "x1": 48, "y1": 60, "x0": -48, "y0": -43, "hasText": true, "y": 55 }, { "x": 268.5, "value": 324982000, "category": "america", "text": "United States", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 17, "padding": 1, "width": 160, "height": 34, "xoff": 256, "yoff": 0, "x1": 80, "y1": 16, "x0": -80, "y0": -15, "hasText": true, "y": 141 }, { "x": 197.5, "value": 263510000, "category": "asia", "text": "Indonesia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 16, "padding": 1, "width": 32, "height": 99, "xoff": 416, "yoff": 0, "x1": 16, "y1": 48, "x0": -16, "y0": -42, "hasText": true, "y": 163 }, { "x": 134.5, "value": 207505000, "category": "america", "text": "Brazil", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 15, "padding": 1, "width": 64, "height": 30, "xoff": 448, "yoff": 0, "x1": 32, "y1": 14, "x0": -32, "y0": -14, "hasText": true, "y": 65 }, { "x": 212.5, "value": 196459000, "category": "asia", "text": "Pakistan", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 15, "padding": 1, "width": 96, "height": 30, "xoff": 512, "yoff": 0, "x1": 48, "y1": 14, "x0": -48, "y0": -14, "hasText": true, "y": 89 }, { "x": 281.5, "value": 191836000, "category": "africa", "text": "Nigeria", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 15, "padding": 1, "width": 32, "height": 72, "xoff": 608, "yoff": 0, "x1": 16, "y1": 35, "x0": -16, "y0": -28, "hasText": true, "y": 68 }, { "x": 277.5, "value": 162459000, "category": "asia", "text": "Bangladesh", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 14, "padding": 1, "width": 32, "height": 101, "xoff": 640, "yoff": 0, "x1": 16, "y1": 49, "x0": -16, "y0": -43, "hasText": true, "y": 187 }, { "x": 235.5, "value": 146804372, "category": "europe", "text": "Russia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 14, "padding": 1, "width": 32, "height": 63, "xoff": 672, "yoff": 0, "x1": 16, "y1": 30, "x0": -16, "y0": -24, "hasText": true, "y": 166 }, { "x": 135.5, "value": 126790000, "category": "asia", "text": "Japan", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 14, "padding": 1, "width": 32, "height": 58, "xoff": 704, "yoff": 0, "x1": 16, "y1": 28, "x0": -16, "y0": -22, "hasText": true, "y": 146 }, { "x": 221.5, "value": 123518000, "category": "america", "text": "Mexico", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 14, "padding": 1, "width": 32, "height": 66, "xoff": 736, "yoff": 0, "x1": 16, "y1": 32, "x0": -16, "y0": -26, "hasText": true, "y": 171 }, { "x": 298.5, "value": 104345000, "category": "africa", "text": "Ethiopia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 13, "padding": 1, "width": 32, "height": 70, "xoff": 768, "yoff": 0, "x1": 16, "y1": 34, "x0": -16, "y0": -28, "hasText": true, "y": 96 }, { "x": 174.5, "value": 104037000, "category": "asia", "text": "Philippines", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 13, "padding": 1, "width": 32, "height": 88, "xoff": 800, "yoff": 0, "x1": 16, "y1": 43, "x0": -16, "y0": -37, "hasText": true, "y": 131 }, { "x": 166.5, "value": 93013300, "category": "africa", "text": "Egypt", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 13, "padding": 1, "width": 32, "height": 53, "xoff": 832, "yoff": 0, "x1": 16, "y1": 25, "x0": -16, "y0": -21, "hasText": true, "y": 114 }, { "x": 127.5, "value": 92700000, "category": "asia", "text": "Vietnam", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 13, "padding": 1, "width": 96, "height": 26, "xoff": 864, "yoff": 0, "x1": 48, "y1": 12, "x0": -48, "y0": -12, "hasText": true, "y": 123 }, { "x": 150.5, "value": 82800000, "category": "europe", "text": "Germany", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 13, "padding": 1, "width": 96, "height": 26, "xoff": 960, "yoff": 0, "x1": 48, "y1": 12, "x0": -48, "y0": -12, "hasText": true, "y": 187 }, { "x": 149.5, "value": 82243000, "category": "africa", "text": "Democratic Republic of the Congo", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 13, "padding": 1, "width": 256, "height": 26, "xoff": 1056, "yoff": 0, "x1": 128, "y1": 12, "x0": -128, "y0": -12, "hasText": true, "y": 217 }, { "x": 127.5, "value": 80135400, "category": "asia", "text": "Iran", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 13, "padding": 1, "width": 64, "height": 26, "xoff": 1312, "yoff": 0, "x1": 32, "y1": 12, "x0": -32, "y0": -12, "hasText": true, "y": 79 }, { "x": 262.5, "value": 79814871, "category": "asia", "text": "Turkey", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 13, "padding": 1, "width": 32, "height": 60, "xoff": 1376, "yoff": 0, "x1": 16, "y1": 29, "x0": -16, "y0": -25, "hasText": true, "y": 181 }, { "x": 142.5, "value": 68298000, "category": "asia", "text": "Thailand", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 13, "padding": 1, "width": 96, "height": 26, "xoff": 1408, "yoff": 0, "x1": 48, "y1": 12, "x0": -48, "y0": -12, "hasText": true, "y": 203 }, { "x": 131.5, "value": 67013000, "category": "europe", "text": "France", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 13, "padding": 1, "width": 64, "height": 26, "xoff": 1504, "yoff": 0, "x1": 32, "y1": 12, "x0": -32, "y0": -12, "hasText": true, "y": 103 }, { "x": 207.5, "value": 65110000, "category": "europe", "text": "United Kingdom", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 128, "height": 24, "xoff": 1568, "yoff": 0, "x1": 64, "y1": 11, "x0": -64, "y0": -11, "hasText": true, "y": 230 }, { "x": 157.5, "value": 60599936, "category": "europe", "text": "Italy", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 42, "xoff": 1696, "yoff": 0, "x1": 16, "y1": 20, "x0": -16, "y0": -15, "hasText": true, "y": 76 }, { "x": 321.5, "value": 56878000, "category": "africa", "text": "Tanzania", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 1728, "yoff": 0, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 155 }, { "x": 210.5, "value": 55908000, "category": "africa", "text": "South Africa", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 1824, "yoff": 0, "x1": 48, "y1": 11, "x0": -48, "y0": -12, "hasText": true, "y": 72 }, { "x": 250.5, "value": 54836000, "category": "asia", "text": "Myanmar", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 73, "xoff": 1920, "yoff": 0, "x1": 16, "y1": 35, "x0": -16, "y0": -32, "hasText": true, "y": 176 }, { "x": 206.5, "value": 51446201, "category": "asia", "text": "South Korea", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 0, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 56 }, { "x": 132.5, "value": 49224700, "category": "america", "text": "Colombia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 96, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 49 }, { "x": 307.5, "value": 48467000, "category": "africa", "text": "Kenya", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 192, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 172 }, { "x": 183.5, "value": 46812000, "category": "europe", "text": "Spain", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 256, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 41 }, { "x": 104.5, "value": 43850000, "category": "america", "text": "Argentina", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 75, "xoff": 320, "yoff": 123, "x1": 16, "y1": 36, "x0": -16, "y0": -32, "hasText": true, "y": 173 }, { "x": 99.5, "value": 42541633, "category": "europe", "text": "Ukraine", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 352, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 136 }, { "x": 226.5, "value": 42176000, "category": "africa", "text": "Sudan", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 416, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 40 }, { "x": 143.5, "value": 41653000, "category": "africa", "text": "Uganda", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 62, "xoff": 480, "yoff": 123, "x1": 16, "y1": 30, "x0": -16, "y0": -25, "hasText": true, "y": 153 }, { "x": 91.5, "value": 41064000, "category": "africa", "text": "Algeria", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 57, "xoff": 512, "yoff": 123, "x1": 16, "y1": 27, "x0": -16, "y0": -23, "hasText": true, "y": 166 }, { "x": 226.5, "value": 38424000, "category": "europe", "text": "Poland", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 544, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 26 }, { "x": 155.5, "value": 37883543, "category": "asia", "text": "Iraq", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 39, "xoff": 608, "yoff": 123, "x1": 16, "y1": 18, "x0": -16, "y0": -14, "hasText": true, "y": 150 }, { "x": 69.5, "value": 36541000, "category": "america", "text": "Canada", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 61, "xoff": 640, "yoff": 123, "x1": 16, "y1": 29, "x0": -16, "y0": -25, "hasText": true, "y": 164 }, { "x": 320.5, "value": 34317500, "category": "africa", "text": "Morocco", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 672, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -12, "hasText": true, "y": 185 }, { "x": 65.5, "value": 33710021, "category": "asia", "text": "Saudi Arabia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 95, "xoff": 768, "yoff": 123, "x1": 16, "y1": 46, "x0": -16, "y0": -42, "hasText": true, "y": 142 }, { "x": 92.5, "value": 32121000, "category": "asia", "text": "Uzbekistan", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 84, "xoff": 800, "yoff": 123, "x1": 16, "y1": 41, "x0": -16, "y0": -36, "hasText": true, "y": 87 }, { "x": 323.5, "value": 32063200, "category": "asia", "text": "Malaysia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 68, "xoff": 832, "yoff": 123, "x1": 16, "y1": 33, "x0": -16, "y0": -28, "hasText": true, "y": 102 }, { "x": 109.5, "value": 31826018, "category": "america", "text": "Peru", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 864, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 90 }, { "x": 111.5, "value": 31431164, "category": "america", "text": "Venezuela", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 928, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 234 }, { "x": 294.5, "value": 28825709, "category": "asia", "text": "Nepal", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 49, "xoff": 1024, "yoff": 123, "x1": 16, "y1": 23, "x0": -16, "y0": -19, "hasText": true, "y": 216 }, { "x": 49.5, "value": 28359634, "category": "africa", "text": "Angola", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 57, "xoff": 1056, "yoff": 123, "x1": 16, "y1": 27, "x0": -16, "y0": -23, "hasText": true, "y": 139 }, { "x": 337.5, "value": 28308301, "category": "africa", "text": "Ghana", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 54, "xoff": 1088, "yoff": 123, "x1": 16, "y1": 26, "x0": -16, "y0": -21, "hasText": true, "y": 105 }, { "x": 79.5, "value": 28120000, "category": "asia", "text": "Yemen", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 56, "xoff": 1120, "yoff": 123, "x1": 16, "y1": 27, "x0": -16, "y0": -22, "hasText": true, "y": 59 }, { "x": 159.5, "value": 27657145, "category": "asia", "text": "Afghanistan", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 1152, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -12, "hasText": true, "y": 27 }, { "x": 24.5, "value": 27128530, "category": "africa", "text": "Mozambique", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 94, "xoff": 1248, "yoff": 123, "x1": 16, "y1": 46, "x0": -16, "y0": -41, "hasText": true, "y": 164 }, { "x": 64.5, "value": 24460900, "category": "australia", "text": "Australia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 69, "xoff": 1280, "yoff": 123, "x1": 16, "y1": 33, "x0": -16, "y0": -29, "hasText": true, "y": 48 }, { "x": 353.5, "value": 24213510, "category": "asia", "text": "North Korea", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 91, "xoff": 1312, "yoff": 123, "x1": 16, "y1": 44, "x0": -16, "y0": -39, "hasText": true, "y": 131 }, { "x": 321.5, "value": 23545680, "category": "asia", "text": "Taiwan", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 57, "xoff": 1344, "yoff": 123, "x1": 16, "y1": 27, "x0": -16, "y0": -22, "hasText": true, "y": 213 }, { "x": 42.5, "value": 23248044, "category": "africa", "text": "Cameroon", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 79, "xoff": 1376, "yoff": 123, "x1": 16, "y1": 38, "x0": -16, "y0": -34, "hasText": true, "y": 71 }, { "x": 64.5, "value": 22671331, "category": "africa", "text": "Ivory Coast", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 1408, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 16 }, { "x": 27.5, "value": 22434363, "category": "africa", "text": "Madagascar", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 90, "xoff": 1504, "yoff": 123, "x1": 16, "y1": 44, "x0": -16, "y0": -39, "hasText": true, "y": 81 }, { "x": 180.5, "value": 21564000, "category": "africa", "text": "Niger", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 1536, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -12, "hasText": true, "y": 244 }, { "x": 312.5, "value": 21203000, "category": "asia", "text": "Sri Lanka", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 73, "xoff": 1600, "yoff": 123, "x1": 16, "y1": 35, "x0": -16, "y0": -31, "hasText": true, "y": 32 }, { "x": 227.5, "value": 19760000, "category": "europe", "text": "Romania", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 1632, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 12 }, { "x": 154.5, "value": 19632147, "category": "africa", "text": "Burkina Faso", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 1728, "yoff": 123, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 12 }, { "x": 71.5, "value": 18907000, "category": "asia", "text": "Syria", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 1824, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 200 }, { "x": 79.5, "value": 18875000, "category": "africa", "text": "Mali", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 38, "xoff": 1888, "yoff": 123, "x1": 16, "y1": 18, "x0": -16, "y0": -13, "hasText": true, "y": 98 }, { "x": 337.5, "value": 18299000, "category": "africa", "text": "Malawi", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 1920, "yoff": 123, "x1": 32, "y1": 11, "x0": -32, "y0": -12, "hasText": true, "y": 68 }, { "x": 117.5, "value": 18191900, "category": "america", "text": "Chile", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 44, "xoff": 1984, "yoff": 123, "x1": 16, "y1": 21, "x0": -16, "y0": -17, "hasText": true, "y": 164 }, { "x": 355.5, "value": 17975800, "category": "asia", "text": "Kazakhstan", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 87, "xoff": 0, "yoff": 218, "x1": 16, "y1": 42, "x0": -16, "y0": -38, "hasText": true, "y": 213 }, { "x": 251.5, "value": 17121900, "category": "europe", "text": "Netherlands", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 32, "yoff": 218, "x1": 48, "y1": 11, "x0": -48, "y0": -12, "hasText": true, "y": 245 }, { "x": 21.5, "value": 16737700, "category": "america", "text": "Ecuador", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 65, "xoff": 128, "yoff": 218, "x1": 16, "y1": 31, "x0": -16, "y0": -28, "hasText": true, "y": 63 }, { "x": 329.5, "value": 15933883, "category": "africa", "text": "Zambia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 61, "xoff": 192, "yoff": 218, "x1": 16, "y1": 29, "x0": -16, "y0": -25, "hasText": true, "y": 30 }, { "x": 90.5, "value": 15626444, "category": "asia", "text": "Cambodia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 96, "height": 24, "xoff": 224, "yoff": 218, "x1": 48, "y1": 11, "x0": -48, "y0": -11, "hasText": true, "y": 247 }, { "x": 57.5, "value": 14965000, "category": "africa", "text": "Chad", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 384, "yoff": 218, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 232 }, { "x": 94.5, "value": 13291000, "category": "africa", "text": "Guinea", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 544, "yoff": 218, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 29 }, { "x": 332.5, "value": 11553188, "category": "africa", "text": "Rwanda", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 64, "xoff": 704, "yoff": 218, "x1": 16, "y1": 31, "x0": -16, "y0": -26, "hasText": true, "y": 220 }, { "x": 352.5, "value": 11356191, "category": "europe", "text": "Belgium", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 65, "xoff": 736, "yoff": 218, "x1": 16, "y1": 31, "x0": -16, "y0": -27, "hasText": true, "y": 27 }, { "x": 36.5, "value": 11239004, "category": "america", "text": "Cuba", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 0, "size": 12, "padding": 1, "width": 64, "height": 24, "xoff": 832, "yoff": 218, "x1": 32, "y1": 11, "x0": -32, "y0": -11, "hasText": true, "y": 31 }, { "x": 343.5, "value": 11079000, "category": "africa", "text": "Somalia", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 270, "size": 12, "padding": 1, "width": 32, "height": 64, "xoff": 928, "yoff": 218, "x1": 16, "y1": 31, "x0": -16, "y0": -26, "hasText": true, "y": 28 }, { "x": 37.5, "value": 11078033, "category": "america", "text": "Haiti", "font": "Verdana", "style": "normal", "weight": "normal", "rotate": 90, "size": 12, "padding": 1, "width": 32, "height": 42, "xoff": 960, "yoff": 218, "x1": 16, "y1": 20, "x0": -16, "y0": -15, "hasText": true, "y": 177 }, { "text": "", "value": 0, "x": 4, "y": 0, "opacity": 0 }, { "text": "", "value": 0, "x": 371, "y": 258, "opacity": 0 }]

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
  }
})
