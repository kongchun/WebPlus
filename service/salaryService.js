import regeneratorRuntime from '../lib/regeneratorRuntime';
const cache = require('../utils/cache.js');
const EXP_TIME = 60 * 24;

class SalaryService{
  async getAverageSalary(){
    let averageSalary = cache.get("averageSalary",EXP_TIME);
    if (!averageSalary){
      averageSalary = await this.requestAverageSalary();
      console.log(averageSalary,111)
      cache.set("averageSalary", averageSalary);
    }
    var monthSalary = averageSalary.arr || [];
    var latestSalary = averageSalary.salary;
    return { monthSalary, latestSalary}
  }

  async requestAverageSalary() {
    return wx.api.get(wx.api.ADDR.GET_NEW_AVG_SALARY).then(res => {
      if (!!res && 200 == res.statusCode && !!res.data) {
       return res.data;
      }
    }).catch(e => {
      console.log(e);
    });
  }
}





module.exports = (function () {
  return new SalaryService();
})();