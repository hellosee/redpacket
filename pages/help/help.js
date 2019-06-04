//help.js
const app = getApp()

Page({
  data: {
    lists: [],
    control:-1,
    version:'1.0',
    show:false
  },
  onshow: function(e){
    if (this.data.control === e.target.dataset.id){
      this.setData({
        control: -1
      })
    }else{
      this.setData({
        control: e.target.dataset.id
      })
    }
  },
  //拨打电话
  tel: function () {
    wx.makePhoneCall({
      phoneNumber: '13242857521'
    })
  },
  onLoad: function () {
    if (!app.globalData.token) {
      wx.showLoading({
        title: '加载中•••',
        mask: true
      })
    }
    this.loop()
  },
  loop: function () {
    if (!app.globalData.token) {
      var that = this
      setTimeout(function () { that.loop(); }, 100)
    } else {
      wx.hideLoading()
      var tok = app.globalData.token;
      var postUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=getFAQ',
        postData = {
          token: tok
        };
      app.postLogin(postUrl, postData, this.initial);
    }
  },
  initial:function(res){
    if(res.data.code == 20000){
      this.setData({
        lists: res.data.faqList,
        show: true
      })
    }
  }
})
