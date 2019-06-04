  //index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},   // 用户信息
    hasUserInfo: false,  // 用户授权
    canIUse: wx.canIUse('button.open-type.getUserInfo'),   //  检测小程序版本兼容 
    token: '',
    hidden:true,
    indexHots:[
      {
        'slide_pic': app.setConfig.url + '/data/upload/default/20190304/5c7c917ac49c4.png'
      },
      {
        'slide_pic': app.setConfig.url + '/data/upload/admin/20180301/5a97bfbd94703.jpg'
      },
      {
        'slide_pic': app.setConfig.url + '/data/upload/admin/20180228/5a96b75a07405.jpg'
      },
      {
        'slide_pic': app.setConfig.url + '/data/upload/admin/20180301/5a97c08c1d8ca.jpg'
      },
      {
        'slide_pic': app.setConfig.url + '/data/upload/admin/20180301/5a97c18567c58.jpg'//变态难度
      }
    ]
  },
  selected:function(e){
    var src = e.currentTarget.dataset.src;
    wx.setStorageSync("src", src);
    wx.navigateTo({
      url: '../redpacket/redpacket'
    })
  },


  addimg: function (e) {
    let that = this;
    wx.showActionSheet({
      itemList: ['从手机相册选择', '摄影师作品'],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success(res) {
              const tempFilePaths = res.tempFilePaths[0];
              console.log(tempFilePaths);
              wx.navigateTo({
                url: '../cutImgs/cutImgs?tempPicUrl=' + tempFilePaths
              })
              //that.pushImg(tempFilePaths);
            }
          });
          
        } else {
          wx.navigateTo({
            url: '../select/select?cid=0'
          });
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    });
    
    
  },
  
  //底部导航跳转
  bindtaprecord: function() {
    wx.navigateTo({
      url: '../record/record'
    })
  },
  bindtapbalance: function () {
    wx.navigateTo({
      url: '../balance/balance'
    })
  },
  bindtaphelp: function () {
    wx.navigateTo({
      url: '../help/help'
    })
  },
  // 转发
  onShareAppMessage: function (res) {
    var title = '新奇的拼图大考验，快来挑战吧 >>';
    return {
      title: title,
      path: '/pages/index/index',
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
  chooseSpliceLongImg: function () {
    wx.navigateTo({
      url: '../longPhoto/index'
    })
  },
  chooseSplicephotoFrame: function () {
    wx.navigateTo({
      url: '../photoFrame/index'
    });
  },
  chooseSpliceNinePics: function () {
    wx.navigateTo({
      url: '../ninePics/index'
    });
  },
  chooseHeartPhotoFrame: function () {
    wx.navigateTo({
      url: '../heartPics/index'
    });
  },
  chooseWaterPics: function () {
    wx.navigateTo({
      url: '../waterMarkSet/waterMarkSet'
    });
  },
  
  onLoad:function(){
      var that = this;
      if (!app.globalData.token) {
        var that = this;
        wx.showLoading({
          title: '加载中•••',
          mask: true
        })
      }
      this.loop();
      app.globalData.timer = setTimeout(function(){
        wx.hideLoading();
        that.setData({
          hidden:false
        })
      },5000);
  },
  loop: function () {
    var info = app.globalData.userInfo,
        tok = app.globalData.token;
    if (info && !this.data.hasUserInfo){
      wx.hideLoading();
      this.setData({
        userInfo: info,
        hasUserInfo: true
      });
      if (app.globalData.timer) { clearTimeout(app.globalData.timer); }
    }else{
      var that = this;
      setTimeout(function () { that.loop(); }, 200)
    }
  },
  getUserInfo:function(e){
    var that = this;
    console.log(e);
    var userInfo = e.detail.userInfo
    if (userInfo){
      app.globalData.userInfo = userInfo
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
  },

  bindViewTel: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.Tel,
    })
  },
})
