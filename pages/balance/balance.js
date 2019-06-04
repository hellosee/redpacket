//balance.js
//获取应用实例
const app = getApp()
var minsum = 1       //最小提现金额
var maxsum = 5000           //单笔最大提现金额
var maxnum = 3          // 最大提现次数
var num = 1             // 可以提现次数

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    token: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    amount: '0.00',   // 账户余额
    sum: '',    // 提现金额
    rate: "",      //提现手续费%
    rsum: '0.00'  //手续费
  },

  //事件处理函数
  bindtapdetial: function () {
    wx: wx.navigateTo({
      url: '../blanceRecord/blanceRecord',
    })
  },
  bindtaphelp: function () {
    wx.navigateTo({
      url: '../help/help'
    })
  },
  bindtapreport: function () {
    wx.navigateTo({
      url: '../report/report'
    })
  },
  //全部提现
  entirely: function (e) {
    var amount = parseFloat(this.data.amount),
      rate = parseFloat(this.data.rate),
      max = Math.floor(amount * 100 / (1 + rate)) / 100;
    var rsum = Math.ceil(max * 100 * (1 + rate)) / 100 - parseFloat(max);
    rsum = rsum > parseFloat(this.data.amount) - parseFloat(max) ? parseFloat(this.data.amount) - parseFloat(max) : rsum;
    rsum = rsum > 0 ? rsum.toFixed(2) : '0.00';
    if (amount == 0) {
      wx.showToast({
        title: '没有余额',
        icon: 'loading',
        duration: 1000
      })
    } else {
      this.setData({
        sum: max.toFixed(2),
        rsum: rsum
      })
    }
  },
  // 提现输入框金额判断
  bindKeyInput: function (e) {
    var inp = !e ? this.data.sum * 1 : Math.round(e.detail.value * 100) / 100;
    var max = Math.min(parseFloat(this.data.amount), maxsum),
        rate = parseFloat(this.data.rate);
    max = Math.floor(max * 100 / (1 + rate)) / 100;
    if (max == 0 && inp != '') {
      wx.showToast({
        title: '没有余额',
        icon: 'loading',
        duration: 1000
      })
    }
    inp = inp > max ? max : inp;
    if (inp > 0) {
      inp = inp > minsum ? inp : minsum;
      inp = inp < max ? inp.toFixed(2) : max.toFixed(2);
    } else {
      inp = '';
    }
    var rsum = Math.ceil(inp * 100 * (1 + rate)) / 100 - parseFloat(inp);
    rsum = rsum > parseFloat(this.data.amount) - parseFloat(inp) ? parseFloat(this.data.amount) - parseFloat(inp) : rsum;
    rsum = rsum > 0 ? rsum.toFixed(2) : '0.00';
    this.setData({
      sum: inp,
      rsum
    })
    if (!e) {
      return inp
    }
  },
  // 表单提交
  formSubmit: function (e) {
    var that = this;
    var val = this.bindKeyInput() * 1;
    var rate = parseFloat(this.data.rate);
    var max = Math.min(parseFloat(this.data.amount), maxsum);
    max = Math.floor(max * 100 / (1 + rate)) / 100;
    if (num < 1) {
      wx.showLoading({
        title: '今日提现满' + maxnum + '次',
        mask: true,
        duration: 1500
      })
      return false;
    }
    val = val < max ? val : max;
    if (val > 0) {
      val = val > minsum ? val : minsum;
      val = val < max ? val : max;
    } else {
      val = '';
      let title = this.data.amount == 0 ? '没有余额' : '请输入提现金额'
      wx.showToast({
        title: title,
        icon: 'loading',
        duration: 1000
      })
    }
    var rsum = Math.ceil(val * 100 * (1 + rate)) / 100 - parseFloat(val);
    rsum = rsum > parseFloat(this.data.amount) - parseFloat(val) ? parseFloat(this.data.amount) - parseFloat(val) : rsum;
    rsum = rsum > 0 ? rsum : 0;
    if (val >= minsum) {
      wx.showModal({
        title: '提示',
        content: '确定提现' + val.toFixed(2) + '元?',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '提现中•••',
              mask: true
            })
            var postUrl = app.setConfig.url + '/index.php?g=Api&m=Withdrawals&a=cash';
            var postData = {
              amount: val.toFixed(2),
              sxf: rsum.toFixed(2),
              token: that.data.token
            }
            app.postLogin(postUrl, postData, function (res) {
              if (res.data.code == 20000) {
                num--;
                wx.showToast({
                  title: '提现成功',
                  icon: 'success',
                  duration: 1200
                })
                that.setData({
                  amount: (that.data.amount - val - rsum).toFixed(2),
                  sum: '',
                  rsum: '0.00'
                })
              }
            });
          }
        }
      })
    } else if (val > 0) {
      wx.showLoading({
        title: '提现最低' + minsum + '元起',
        mask: true,
        duration: 1200
      })
    }
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
      var info = app.globalData.userInfo,
          tok = app.globalData.token;
      if (info) {
        this.setData({
          userInfo: info,
          token: tok,
          hasUserInfo: true
        })
      }
      var postUrl = app.setConfig.url + '/index.php?g=Api&m=Withdrawals&a=getAmountWithdrawalP',
        postData = {
          token: tok
        };
      app.postLogin(postUrl, postData, this.initial);  
    }
  },
  initial: function (res) {
    if (res.data.code == 20000) {
      var data = res.data;
      var rate = !data.withdrawal_commission ? 0 : data.withdrawal_commission;
      minsum = !data.min_withdrawals ? 1 : data.min_withdrawals * 1;
      maxsum = !data.max_withdrawals ? 1000 : data.max_withdrawals * 1;
      maxnum = !data.max_withdrawal_time ? 5 : data.max_withdrawal_time * 1;
      num = !data.withdrawal_time ? 1 : data.withdrawal_time * 1;
      rate = rate < 1 ? rate : rate/100;
      this.setData({
        amount: data.amount,
        rate: rate,
      })
    }
  }
})
