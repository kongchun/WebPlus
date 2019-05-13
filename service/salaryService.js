import regeneratorRuntime from '../lib/regeneratorRuntime';
const cache = require('../utils/cache.js');
const EXP_TIME = 60*30;

const priceSort = {
  "面议": 0,
  "<5K": 1,
  "5-8K": 2,
  "8-10K": 3,
  "10-15K": 4,
  "15-20K": 5,
  ">20K": 6
};
const yearSort = {
  "3年以下": 1,
  "3-5年": 2,
  "5-10年": 3,
  "不限": 4
};
const eduSort = {
  "大专": 1,
  "本科": 2,
  "硕士": 3,
  "不限": 0
};
const districtSort = {
  "工业园区": 1,
  "姑苏区": 2,
  "高新区": 3,
  "吴中区": 4,
  "相城区": 5,
  "吴江区": 6,
  "苏州周边": 7
}

class SalaryService {

  async getAverageSalary() {
    let averageSalary = cache.get("averageSalary", EXP_TIME);
    if (!averageSalary) {
      averageSalary = await this.requestDataByURL(wx.api.ADDR.GET_NEW_AVG_SALARY);
      cache.set("averageSalary", averageSalary);
    }
    var monthSalary = averageSalary.arr || [];
    var latestSalary = averageSalary.salary;
    return {
      monthSalary,
      latestSalary
    }
  }

  async getChartsSalaryInfo() {
    let chartsSalaryInfo = cache.get("chartsSalaryInfo", EXP_TIME);
    if (!chartsSalaryInfo) {
      let data = await this.requestDataByURL(wx.api.ADDR.GET_CHARTS_SALARY_INFO);
      let salaryYearAveragChartData = this.sortFilter(yearSort, data.yearRange);
      let districtChartData = this.sortFilter(districtSort, data.districtRange);
      let radialChartData = this.toPieChart(this.sortFilter(priceSort, data.salaryRange));
      let circleChartData = this.toPieChart(this.sortFilter(yearSort, data.yearRange));
      let levelChartData = this.sortFilter(eduSort, data.eduRange);

      chartsSalaryInfo = {
        salaryYearAveragChartData,
        districtChartData,
        radialChartData,
        circleChartData,
        levelChartData
      }
      cache.set("chartsSalaryInfo", chartsSalaryInfo);
      
    }

    return chartsSalaryInfo;
  }


  async getDataStatistics() {
    let dataStatistics = cache.get("dataStatistics", EXP_TIME);
    if (!dataStatistics) {
      dataStatistics = await this.requestDataByURL(wx.api.ADDR.DATA_STATISTICS);
      cache.set("dataStatistics", dataStatistics);
    }
    return dataStatistics;
  }

  async getTechCloudInfo(){
    let techCloudTag = cache.get("techCloudTag", EXP_TIME);
    if (!techCloudTag) {
      techCloudTag = await this.requestDataByURL(wx.api.ADDR.GET_TAG_CLOUD);
      cache.set("techCloudTag", techCloudTag);
    }
    return techCloudTag;
  }


  sortFilter(sortKey, data) {
    return data.sort(function(a, b) {
      return sortKey[a.label] - sortKey[b.label];
    })
  }

  toPieChart(data) {
    let total = 0;
    let pieMap = {};
    let dealData = {};
    //根据count值计算百分比
    data.map(function(item, index, input) {
      total += item.count;
    })
    data.map(function(item, index, input) {
      item.count = parseFloat((parseFloat(item.count) / total).toFixed(2))
      item.a = '1'; //增加a属性
      pieMap[item.label] = item.count;
    })
    dealData.data = data;
    dealData.pieMap = pieMap;
    return dealData;
  }


 





  async getTopTech() {
    return wx.api.get(wx.api.ADDR.GET_TOP_TECH).then(res => {
      if (!!res && 200 == res.statusCode && !!res.data) {
        console.log(res.data);
        return res.data;
      }
    }).catch(e => {
      console.log(e);
    });
  }

  async requestDataByURL(url) {
    return wx.api.get(url).then(res => {
      if (!!res && 200 == res.statusCode && !!res.data) {
        return res.data;
      }
    }).catch(e => {
      console.log(e);
    });
  }


}





module.exports = (function() {
  return new SalaryService();
})();