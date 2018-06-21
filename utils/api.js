'use strict';

var host = 'https://technologycloud.cn';
//host = 'http://127.0.0.1:5000';
const addr = {
  GET_NEW_AVG_SALARY: host + '/api/getNewAverageSalary', 
  ADD_AVG_SALARY_HITS: host + '/api/readAverageSalary'
};
var serverHost = host+'/client';
var fileHost = host+'/upload';
module.exports = {
  HOST: host,
  ADDR: addr,
  LIST_DEVICE: serverHost + '/device',
  
  get (url) {
    return new Promise((resolve, reject) => {
      //console.log(url)
      wx.request({
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  },

  post (url, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        data: data,
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  },

  json2Form(json) {
    var str = []
    for(var p in json){
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]))
    }
    return str.join("&")
  }

};
