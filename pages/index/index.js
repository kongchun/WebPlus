//index.js
//获取应用实例
import F2 from '../../f2-canvas/lib/f2';
const app = getApp()
import NumberAnimate from "../../utils/NumberAnimate";
Page({
  data: {
    opts: {
      lazyLoad: true // 延迟加载组件
    },
    requestData: null, // 异步请求获取的数据
    system: { windowHeight: 603, windowWidth:373},
    salary: { month: '--', average: 0, read:0}
  },
  onLoad: function () {
    wx.pro.getSystemInfo().then(res=>{
      this.setData({ system: res });
    });
    wx.pro.getStorage('salaryData').then(db => {
      this.setData({ salary: db });
    }).catch(e => {
    });
  },
  onReady: function () {
    this.getNewAverageSalary();
  },
  topagedetail: function(options){
    wx.navigateTo({
      url: '../public/index?query=new'
    })
  },
  getNewAverageSalary: function () {
    wx.api.get(wx.api.ADDR.GET_NEW_AVG_SALARY).then(res=>{
      if (!!res && 200 == res.statusCode && !!res.data){
        let salaryData = res.data.salary;
        this.loadChart(res.data.arr||[]);
        if (!!!salaryData) return;
        let salary = { month: salaryData.month, average: 0, read: salaryData.read, compare: salaryData.compare };
        this.setData({ salary: salary});
        wx.pro.setStorage('salaryData', salaryData);
        let average = salaryData.average;
        let n1 = new NumberAnimate({
          from: average,//开始时的数字
          speed: 1800,// 总时间
          refreshTime: 100,//  刷新一次的时间
          decimals: 2,//小数点后的位数
          onUpdate: () => {//更新回调函数
            salary.average = n1.tempValue;
            this.setData({
              salary: salary
            });
          },
          onComplete: () => {//完成回调函数
          }
        });
        const key = res.data.year+'.'+res.data.month;
        wx.pro.getStorage(key).then(db=>{
        }).catch(e=>{
          wx.api.post(wx.api.ADDR.ADD_AVG_SALARY_HITS, { year: res.data.year, month: res.data.month }).then(res => {
            if (!!res && 200 == res.statusCode && !!res.data) {
              if ((!!res.data.result && !!res.data.result.n && res.data.result.n > 0) || (!!res.data.n && res.data.n > 0)) {
                wx.pro.setStorage(key,true);
              }
            }
          });
        });
      }
    })
  },
  loadChart:function(data){
    if(!!!data || data.length<=0) return;
    this.chartComponent = this.selectComponent('#line-dom');
    this.chartComponent.init((canvas, width, height) => {
      var ticks = [];
      data.forEach(function (obj) {
        ticks.push(obj.key);
      });
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });

      chart.source(data, {
        year: {
          range: [0, 1],
          ticks: ticks
        },
        value: {
          tickCount: 4,
          formatter(val) {
            return val.toFixed(1) + '元';
          }
        }
      });

      chart.tooltip({
        custom: true, // 自定义 tooltip 内容框
        onChange(obj) {
          const legend = chart.get('legendController').legends.top[0];
          const tooltipItems = obj.items;
          const legendItems = legend.items;
          const map = {};
          legendItems.map(item => {
            map[item.name] = Object.assign({}, item);
          });
          tooltipItems.map(item => {
            const { name, value } = item;
            if (map[name]) {
              map[name].value = value;
            }
          });
          legend.setItems(Object.values(map));
        },
        onHide() {
          const legend = chart.get('legendController').legends.top[0];
          legend.setItems(chart.getLegendItems().country);
        }
      });
      chart.line().position('key*value').color('type', val => {
        if (val === '薪资') {
          return '#32933D';
        }
      });
      chart.render();
      this.chart = chart;
      return chart;
    });
  }
})
