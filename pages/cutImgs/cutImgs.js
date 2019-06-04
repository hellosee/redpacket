// pages/cutImgs/cutImgs.js
const app = getApp();
Page({
  data: {
    src: '',
    width: 250,//宽度
    height: 250,//高度
  },
  onLoad: function (options) {
    console.log(options);
    this.cropper = this.selectComponent("#image-cropper");
    this.setData({
      src: options.tempPicUrl,
    });
    wx.showLoading({
      title: '加载中'
    })
  },
  cropperload:function(e) {
    
    console.log("cropper初始化完成");
  },
  loadimage:function(e) {
    console.log("图片加载完成", e.detail);
    wx.hideLoading();
    //重置图片角度、缩放、位置
    this.cropper.imgReset();
  },
  clickcut:function(e) {
    console.log(e.detail);
    //点击裁剪框阅览图片
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  getPicInfo:function(e){
    wx.showToast({
      title: '上传中',
      icon: 'loading',
      duration: 2000
    })
    this.cropper.getImg(function(e){
      //登录信息验证
      var tok = app.globalData.token;
      if (!tok) { return false; }
      var signData = app.getSign();
      var sign = signData.sign;
      var timestamp = signData.timestamp;
      wx.uploadFile({
        url: app.setConfig.url + '/index.php/Api/upload/plupload',
        filePath: e.url,
        name: 'file',
        formData: {
          'token': tok,
          'app':'Admin',
          'sign':sign,
          'timestamp' :timestamp
        },
        success: function (res) {
          var data = JSON.parse(res.data);
          if(data.code == 20000){
            wx.setStorageSync("src", data.data.imgurl);
            wx.navigateTo({
              url: '../redpacket/redpacket'
            });
          } else {
            wx.showToast({
              title: '上传失败',
              icon: 'loading',
              mask: true,
              duration: 1000
            });
          }
        }
      });
    });
  }

})