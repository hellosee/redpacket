//share.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    pid:'',       // id
    cid: '0',       // 页面入口标识
    ownerImg: '',           //  头像
    ownerName: '',       // 名字
    redtips: '发了一个拼图夺宝', 
    describe: '你拼出来算我输',
    xcxewm:'',
    opensrc:'',
    relay:'给你发了一个拼图夺宝，立刻去挑战吧 >>'            // 自定义转发标签
  },

  //拨打电话
  tel: function () {
    wx.makePhoneCall({
      phoneNumber: '020-22096568'
    })
  },
  //事件处理函数
  mytry: function () {
    var id = this.data.pid,
        cid = this.data.cid;
    if (cid == 0) {
      wx.navigateTo({
        url: '../recordDetails/recordDetails?pid=' + id
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },
  //转发
  onShareAppMessage: function (res) {
    wx.hideToast();
    var id = this.data.pid,
        title = this.data.ownerName + ' ' + this.data.relay;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res)
    }
    return {
      title: title,
      path: 'pages/recordDetails/recordDetails?pid='+id,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //生成朋友圈分享图
  sheng:function(){
    var cid = this.data.cid
    var redtips = this.data.redtips
    var xcxewm = this.data.xcxewm
    wx.setStorageSync('SRedtips', redtips)
    wx.setStorageSync('SXcxewm', xcxewm)
    if(cid == 0){
      wx.navigateTo({
        url: '../compose/compose'
      })
    }else{
      wx.redirectTo({
        url: '../compose/compose'
      })
    }
  },
  //获取登录信息
  onLoad: function (option) {
    this.loop(option)
  },
  loop: function (option){
    var info = app.globalData.userInfo,
      tok = app.globalData.token;
    var pid = wx.getStorageSync('SPid')
    var ownerImg = wx.getStorageSync('SOwnerImg')
    var ownerName = wx.getStorageSync('SOwnerName')
    var describe = wx.getStorageSync('SDescribe')
    this.setData({
      userInfo: info,
      token: tok,
      pid: pid,
      cid: option.cid,
      hasUserInfo: true,
      ownerName: ownerName,
      ownerImg: ownerImg,  //用户头像
      describe: describe
    })
    wx.showLoading({
      title: '二维码生成中',
      mask: true
    })

    //二维码
    var postUrl = app.setConfig.url + '/index.php?g=Api&m=ToCode&a=getQrcode',
      postData = {
        token: tok,
        tit: this.data.redtips,
        pid: pid,
        con: this.data.describe,
        page: 'pages/recordDetails/recordDetails'
      };
    app.postLogin(postUrl, postData, this.setCode);
  },
  setCode: function(res){
    if(res.data.code === 20000){
      this.setData({
        xcxewm: app.setConfig.url + '/' + res.data.data,
        opensrc:'/images/open.png'
      })
      wx.showToast({
        title: '生成成功',
        icon: 'success',
        mask: true,
        duration: 1000
      })
    }

  }
})
