//index.js
//获取应用实例
import F2 from '../../f2-canvas/lib/f2';
let chart = null;
const app = getApp()
import NumberAnimate from "../../utils/NumberAnimate";

Page({
  data: {
    opts: {
      onInit: initChart
    },
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
        let salaryData = res.data;
        let salary = { month: salaryData.month, average: 0, read: salaryData.read };
        this.setData({ salary});
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
})


function initChart(canvas, width, height) {
  const data = [{ "year": 1997, "type": "薪资", "value": 4.8 }, { "year": 1998, "type": "薪资", "value": 4.3 }, { "year": 1999, "type": "薪资", "value": 3.9 }, { "year": 2000, "type": "薪资", "value": 3.7 }, { "year": 2001, "type": "薪资", "value": 4.7 }, { "year": 2002, "type": "薪资", "value": 5.6 }, { "year": 2003, "type": "薪资", "value": 5.2 }, { "year": 2004, "type": "薪资", "value": 4.6 }, { "year": 2005, "type": "薪资", "value": 3.7 }, { "year": 2006, "type": "薪资", "value": 3.2 }, { "year": 2007, "type": "薪资", "value": 4 }, { "year": 2008, "type": "薪资", "value": 6.3 }, { "year": 2009, "type": "薪资", "value": 10.4 }, { "year": 2010, "type": "薪资", "value": 11.1 }, { "year": 2011, "type": "薪资", "value": 10 }, { "year": 2012, "type": "薪资", "value": 8.5 }, { "year": 2013, "type": "薪资", "value": 7.2 }, { "year": 2014, "type": "薪资", "value": 6.3 }, { "year": 2015, "type": "薪资", "value": 5.4 }, { "year": 2016, "type": "薪资", "value": 4.9 }, { "year": 2017, "type": "薪资", "value": 4.3 }];

  chart = new F2.Chart({
    el: canvas,
    width,
    height
  });

  chart.source(data, {
    year: {
      range: [0, 1],
      ticks: [1997, 1999, 2001, 2003, 2005, 2007, 2009, 2011, 2013, 2015, 2017]
    },
    value: {
      tickCount: 4,
      formatter(val) {
        return val.toFixed(1)*1000 + '元';
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
  chart.line().position('year*value').color('type', val => {
    if (val === '薪资') {
      return '#32933D';
    }
  });
  chart.render();
  return chart;
}
