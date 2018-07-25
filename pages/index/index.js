//index.js
//获取应用实例
import F2 from '../../f2-canvas/lib/f2';
const app = getApp();
import NumberAnimate from "../../utils/NumberAnimate";
Page({
  data: {
    opts: {
      lazyLoad: true // 延迟加载组件
    },
    requestData: null, // 异步请求获取的数据
    system: { windowHeight: 603, windowWidth:373},
    salary: { month: '--', average: 8000, read:0}
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
      url: '/pages/salary/index?data='+JSON.stringify(this.data.salary)
    })
  },
  getNewAverageSalary: function () {
    wx.api.get(wx.api.ADDR.GET_NEW_AVG_SALARY).then(res=>{
      if (!!res && 200 == res.statusCode && !!res.data){
        let salaryData = res.data.salary;
        this.loadChart(res.data.arr||[]);
        if (!!!salaryData) return;
        let salary = { month: salaryData.month, average: 0, read: salaryData.read, compare: salaryData.compare, per: salaryData.per };
        this.setData({ salary: salary});
        wx.pro.setStorage('salaryData', salaryData);
        let average = salaryData.average;
        let n1 = new NumberAnimate({
          from: average,//开始时的数字
          speed: 1000,// 总时间
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
        const key = salaryData.year + '.' + salaryData.month;
        wx.pro.getStorage(key).then(db=>{
        }).catch(e=>{
          wx.api.post(wx.api.ADDR.ADD_AVG_SALARY_HITS, { year: res.data.salary.year, month: res.data.salary.month }).then(res => {
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
    data = data.map((t)=>{
      t.type = "趋势报告";
      return t;
    })
    
    if(!!!data || data.length<=0) return;
    this.chartComponent = this.selectComponent('#line-dom');
    this.chartComponent.init((canvas, width, height) => {
     
      const chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
  
      chart.source(data, {
        key: {
          formatter(val) {
            return val+"月";
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
            text : (text/1000).toFixed(1) + 'K'
          };
          return cfg;
        }
      })

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

      
    //  data.map((i)=>{
    //    var tags =  [i.key,i.value]
    //         console.log(tags)
    //         chart.guide().tag({
    //           position: tags,
    //           content: i.value,
    //           width:"200rpx",
    //           direct: 'tc',
    //           offsetY: -5,
    //           background: {
    //             padding: [4, 6],
    //             fill: '#32933D'
    //           },
    //           pointStyle: {
    //             fill: '#32933D'
    //           }
    //         });
    //   });
     
     
      chart.line().position('key*value').color('type', val => {
        if (val === '趋势报告') {
          return '#32933D';
        }
      });
 
      //chart.line().position('key*value').color("#32933D");
      chart.point().position('key*value').style({
        stroke: '#fff',
        lineWidth: 1
      }).color("#32933D");
     chart.area().position('key*value').color("#32933D");
      chart.render();
      this.chart = chart;
      return chart;
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    const salary = this.data.salary;
    return {
      title: salary.month + ' 月前端报告',
      desc: '基于前端大数据统计'
    };
  },
})
