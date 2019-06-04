// pages/select/select.js
const app = getApp()
var shearIn = 0

Page({
  /**
   * 页面的初始数据
   */
  data: {
    team: [],      // 图片类目
    select: '',        // 图片库详情
    selectKey: 0       // 当前类目
  },
  // 选择
  select: function (e) {
    var key = e.currentTarget.dataset.key;
    if (key == this.data.selectKey){return false}
    this.setData({
      selectKey: key
    })
    if (this.data.select[key].length>0){return false}
    this.loaddata()
  },
  // 图片
  selected: function (e) {
    var src = e.currentTarget.dataset.src;
    wx.setStorageSync("src", src);
    if (shearIn == 0) {
      wx.navigateTo({
        url: '../redpacket/redpacket'
      })
    } else if (shearIn == 1) {
      wx.navigateBack({
        delta: 1
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    shearIn = options.cid;
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
      var that = this
      var tok = app.globalData.token;
      var postUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=getPicCats',
        postData = {
          token: tok,
          picCatId: 0
        };
      app.postLogin(postUrl, postData, function(res){
        if (res.data.code == 20000) {
          let datas = res.data
          let team = []
          let select = [];
          let selectKey = that.data.selectKey
          for (let i = 0; i < datas.picCats.length; i++) {
            team[i] = datas.picCats[i].cat_name;
            select[i] = [];
          }
          select = !that.data.select ? select : that.data.select;
          select[selectKey] = select[selectKey].concat(datas.fistCatPics);
          that.setData({
            team,
            select
          })
        }
      });
    }
  },
  loaddata:function(){
    var tok = app.globalData.token;
    var id = this.data.selectKey*1+1;
    var postUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=getPics',
      postData = {
        token: tok,
        picCatId: id
      };
    app.postLogin(postUrl, postData, this.initial);
  },
  initial: function (res) {
    console.log(res)
    if (res.data.code == 20000) {
      let data = res.data.data
      let selectKey = this.data.selectKey
      let select = this.data.select;
      select[selectKey] = select[selectKey].concat(data);
      this.setData({
        select
      })
    }
  },

})