//compose.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    pid:'',      // 拼图
    bgsrc: [
      '/images/codebg0.png'
    ],      //分享图背景
    ownerImg: '',           // 发起人头像
    redtips: '', 
    colors: ['#f3e5b4'],
    redimgs:[
      '/images/redtips.png'
    ],                        // icon图片
    describe: '',
    xcxewm:'',
    opensrc:'',
    stIndex:0,
    stencil:[],       // 模版图片
    stSwitch:false,
    relay:'发起了一个拼图夺宝游戏 >>'            // 自定义转发标签
  },

  toStencil:function(){
    this.setData({
      stSwitch: true
    })
    if (this.data.stencil.length == 0){
      wx.showToast({
        title: '模版加载中',
        icon: 'loading',
        duration: 15000
      })
    }
  },
  //事件处理函数
  choose: function (e) {
    var index = e.currentTarget.dataset.index,
        stIndex = this.data.stIndex;
    
    if (index == stIndex) {
      this.setData({
        stIndex:0
      })
    } else {
      this.setData({
        stIndex: index,
        stSwitch: false
      })
    }
  },
  
  //生成朋友圈分享图
  sheng:function(){
    wx.showLoading({
      title: '分享图生成中',
      mask: true
    })
    var postUrl = app.setConfig.url + '/index.php?g=Api&m=ToCode&a=get_code',
      postData = {
        token: app.globalData.token,
        pid: this.data.pid,
        back: this.data.stIndex,
        tit: this.data.redtips,
        con: this.data.describe,
        page: 'pages/recordDetails/recordDetails'
      };

    app.postLogin(postUrl, postData, function(res){
      if (res.data.code === 20000) {
        wx.showToast({
          title: '生成成功',
          icon: 'success',
          duration: 1000
        })
        var fximg = app.setConfig.url + '/' +res.data.data;
        wx.previewImage({
          current: '', // 当前显示图片的http链接
          urls: [fximg] // 需要预览的图片http链接列表
        })
      }
    });

  },
  //获取登录信息
  onLoad: function () {
    this.loop()
  },
  loop: function (){
    var info = app.globalData.userInfo,
        tok = app.globalData.token;
    var pid = wx.getStorageSync('SPid')
    var ownerImg = wx.getStorageSync('SOwnerImg')
    var redtips = wx.getStorageSync('SRedtips')
    var describe = wx.getStorageSync('SDescribe')
    var xcxewm = wx.getStorageSync('SXcxewm')
    this.setData({
      userInfo: info,
      token: tok,
      pid: pid,
      ownerImg: ownerImg,
      redtips: redtips,
      describe: describe,
      xcxewm: xcxewm,
      opensrc: '/images/open.png',
      hasUserInfo: true,
    }) 
    var postUrl = app.setConfig.url + '/index.php?g=Api&m=ToCode&a=getSharePageInfo',
      postData = {
        token: tok
      };
    app.postLogin(postUrl, postData, this.initial); 
  },
  initial:function(res){
    if (res.data.code == 20000){
      var data = res.data.data;
      var tpl_imgs = data.tpl_imgs,
          back_imgs = data.back_imgs,
          redtips_imgs = data.redtips_imgs,
          font_colors = data.font_colors,
          stencil = [],
          bgsrc = ['/images/codebg0.png'],
          redimgs = ['/images/redtips.png'],
          colors = ['#f3e5b4'];
      var path = app.setConfig.url+'/';
      for (var i = 0; i < tpl_imgs.length; i++){
        var stc = path + tpl_imgs[i],
            bgc = path + back_imgs[i],
            red = path + redtips_imgs[i],
            clr = font_colors[i];
        stencil.push(stc);
        bgsrc.push(bgc);
        redimgs.push(red);
        colors.push(clr);
      }
      this.setData({
        stencil,
        bgsrc,
        redimgs,
        colors
      })
      wx.hideToast();
    }
  }
})
