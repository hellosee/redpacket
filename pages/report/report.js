//report.js
const app = getApp()

Page({
  data: {
    lists: [{
      id: 1,
      con:'1.欺诈'
    }, {
      id: 2,
      con: '2.色情'
    }, {
      id: 3,
      con: '3.政治谣言'
    }, {
      id: 4,
      con: '4.常识性谣言'
    }, {
      id: 5,
      con: '5.诱导分享'
    }, {
      id: 6,
      con: '6.恶意营销'
    }, {
      id: 7,
      con: '7.隐身信息收集'
    }, {
      id: 8,
      con: '8.其他侵权类（冒名、诽谤、抄袭）'
    }],
    control:-1,
    phone:'',
    wx:'',
    version:'1.5.0',
    btn:true
  },
  //选择原因
  onshow: function(e){
    if (this.data.control != e.target.dataset.id){
      this.setData({
        control: e.target.dataset.id
      })
    }
  },
  // 表单提交
  submit: function () {
    var that = this;
    if(this.data.control === -1){
      wx.showModal({
        title: '提示',
        content: '请选择举报原因！',
        showCancel: false,
        success: function (res) {
        }
      })
    }else{
      if (this.data.btn){
        wx.showToast({
          title: '举报成功',
          icon: 'success',
          duration: 1200
        })
        that.setData({
          control:-1,
          btn:false
        })
      }else{
        wx.showToast({
          title: '您已举报',
          icon: 'loading',
          duration: 1200
        })
      }
    }
  },
  onLoad: function () {
    var res = wx.getSystemInfoSync();
    this.setData({
      version: res.SDKVersion
    })
  }
})
