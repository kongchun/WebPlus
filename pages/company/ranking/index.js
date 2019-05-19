// pages/company/ranking/index.js

Page({
  data: {
    host: wx.host,
    rankList: [],
    copy: "前端Plus"
  },
  onLoad() {
    this.getData();
  },
  onPullDownRefresh() {
    this.getData();
  },
  getData() {
    wx.showNavigationBarLoading();
    this.getRankList(rankList => {
      console.log(rankList)
      this.setData({
        rankList
      });
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    });
  },
  onShareAppMessage() {
    return {
      title: "互联网公司排名TOP50",
      path: "/page/company/ranking/index"
    };
  },
  getRankList(callback) {
    const retry = () => setTimeout(() => this.getRankList(callback), 3000);
    wx.request({
      url: "https://salary.techwebplus.cn/manage/listcompany?page=1&limit=50&positionConfirm=99",
      header: {
        "accept-language": "zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4",
        "content-type": "text/html; charset=utf-8"
      },
      success: ({
        data
      }) => {
        try {
          let arr = [];
          if (!!data.data && data.data.length > 0) {
            for (let i = 0; i < data.data.length; i++) {
              let company = data.data[i];
              arr.push({
                icon: 'https://salary.techwebplus.cn/images/0.jpg',
                name: company.company,
                detail: company.addr + ' ' + company.company,
                score: 88
              });
            }
          }
          callback(arr);
        } catch (e) {
          retry();
        }
      },
      fail: retry
    });
  }
});