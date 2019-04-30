class Cache{
  constructor(){
    this.pre = "global";
  }

  set(key,value){
    var curTime = new Date().getTime();
    wx.setStorageSync(this.pre + "_" + key,{ data: value, time: curTime });
  }
  get(key,exp){
    let expTime = 1000*60*exp;
    var data = wx.getStorageSync(this.pre + "_" +key);
    if(!data){
      return null;
    }
    if (exp && (new Date().getTime() - data.time > expTime)) {
      console.log('缓存已过期' + key);
      wx.removeStorageSync(key);
      return null;
    }
    return data.data;
  }

  //获取缓存的时刻
  getMoment(key) {
    var data = wx.getStorageSync(this.pre + "_" + key);
    if (!data) {
      return null;
    }
    return data.time;
  }
}
module.exports = (function(){
  return new Cache();
})();