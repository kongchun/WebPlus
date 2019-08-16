export default {
  viewCompanyDetail : function(e){
    let company = e.currentTarget.dataset.company;
    if (!!company && !!company['_id']){
      //console.log(company['_id'])
      wx.navigateTo({
        
        url: `/pages/company/detail/index?_id=${company['_id']}`,
      })
    }
  }
}