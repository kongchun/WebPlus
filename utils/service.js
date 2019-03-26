wx.api = require('api.js');
wx.pro = require('promisify.js');
import regeneratorRuntime from 'async';
module.exports = {
  async getSurroundingSalary(latitude, longitude, distance) {
    let uri = '/api/getSurroundingSalary?';
    uri += 'latitude=' + latitude;
    uri += '&longitude=' + longitude;
    uri += '&distance=' + distance;
    try{
      let res = await wx.api.get(wx.host + uri);
      if (!!res.data) {
        return res.data;
      } else {
        throw '系统繁忙，请稍后再试！';
      }
    }catch(e){
      throw e || '系统繁忙，请稍后再试！';
    }
  },
  async makeSurroundingSalaryData(latitude, longitude) {
    try {
      let circles = [];
      let markers = [];
      let outCircleRadius = 10000;
      let insideCircleRadius = 5000;
      let markerIndex = 9000;
      let outData = await this.getSurroundingSalary(latitude, longitude, outCircleRadius)||{};
      outData.distance = outCircleRadius;
      if (!!outData && !!outData.jobs && outData.jobs>0){
        circles.push({
          latitude: latitude,
          longitude: longitude,
          color: '#81A5FFAA',
          fillColor: '#CBDEF2AA',
          radius: outCircleRadius,
          strokeWidth: 2,
        });
        if (!!outData && !!outData.minSalary && !!(outData.minSalary.position)){
          markers.push({
            id: ++markerIndex,
            name: '最低平均薪资',
            latitude: outData.minSalary.position.lat,
            longitude: outData.minSalary.position.lng,
            rotate: 0,
            iconPath: '/images/min_site.png',
            width: 30,
            height: 30,
            alpha: 0.9,
            callout: {
              content: outData.minSalary.average+'元',
              color: '#ffffff',
              fontSize: 13,
              borderRadius: 10,
              padding: 5,
              bgColor: '#1296DB'
              , display: 'ALWAYS'
            }
          });
        }

        if (!!outData && !!outData.maxSalary && !!(outData.maxSalary.position)) {
          markers.push({
            id: ++markerIndex,
            name: '最高平均薪资',
            latitude: outData.maxSalary.position.lat,
            longitude: outData.maxSalary.position.lng,
            rotate: 0,
            iconPath: '/images/max_site.png',
            width: 30,
            height: 30,
            alpha: 0.9,
            callout: {
              content: outData.maxSalary.average + '元',
              color: '#ffffff',
              fontSize: 13,
              borderRadius: 10,
              padding: 5,
              bgColor: '#1296DB'
              , display: 'ALWAYS'
            }
          });
        }
      }

      let insideData = await this.getSurroundingSalary(latitude, longitude, insideCircleRadius) || {};
      insideData.distance = insideCircleRadius;
      if (!!insideData && !!insideData.jobs && insideData.jobs > 0) {
        circles.push({
          latitude: latitude,
          longitude: longitude,
          color: '#81A5FFAA',
          fillColor: '#AACBFCAA',
          radius: insideCircleRadius,
          strokeWidth: 2,
        });
        if (!!insideData && !!insideData.minSalary && !!(insideData.minSalary.position)) {
          markers.push({
            id: ++markerIndex,
            name: '最低平均薪资',
            latitude: insideData.minSalary.position.lat,
            longitude: insideData.minSalary.position.lng,
            rotate: 0,
            iconPath: '/images/min_site.png',
            width: 30,
            height: 30,
            alpha: 0.9,
            callout: {
              content: insideData.minSalary.average + '元',
              color: '#ffffff',
              fontSize: 13,
              borderRadius: 10,
              padding: 5,
              bgColor: '#1296DB'
              , display: 'ALWAYS'
            }
          });
        }

        if (!!insideData && !!insideData.maxSalary && !!(insideData.maxSalary.position)) {
          markers.push({
            id: ++markerIndex,
            name: '最高平均薪资',
            latitude: insideData.maxSalary.position.lat,
            longitude: insideData.maxSalary.position.lng,
            rotate: 0,
            iconPath: '/images/max_site.png',
            width: 30,
            height: 30,
            alpha: 0.9,
            callout: {
              content: insideData.maxSalary.average + '元',
              color: '#ffffff',
              fontSize: 13,
              borderRadius: 10,
              padding: 5,
              bgColor: '#1296DB'
              , display: 'ALWAYS'
            }
          });
        }
      }
      return { markers, circles, outData, insideData};
    } catch (e) {
      throw e || '系统繁忙，请稍后再试！';
    }
  },
}; 