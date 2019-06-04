  //redpacket.js
//获取应用实例
const app = getApp();
var winW = wx.getSystemInfoSync().windowWidth;
var maxsum = 50000;   // 最大赏金
var maxnum = 1000;     // 最大个数
var minfc = 1;      // 最小发出金额
var minlq = 1;      // 最小领取金额
var commision = 0.02;       // 佣金比例（*%）

Page({
  data: {
    userInfo: {},   // 用户信息
    hasUserInfo: false,  // 用户授权
    canIUse: wx.canIUse('button.open-type.getUserInfo'),   //  检测小程序版本兼容
    imgsrc: '',
    boxW: 180,
    imgW: 0,
    imgH: 0,
    imgL: 0,
    imgT: 0,
    mode: 3,    //模式难度
    lines:[],
    template:[],
    textCN:'',     // 输入框内容
    difficulty: true,
    sum: '',      // 赏金
    num: '',      // 数量
    serviceCharge:'0.00',    // 服务费
    balance:'0.00',      // 账户余额
    commision: 0,          // 手续费比例
    token: '',
    btn:'生成拼图PK',      // 按钮
  },
  //获取登录信息
  onLoad: function () {
    this.tomode();
    this.loop();
  },
  onShow:function(){
    var that = this;
    var src = wx.getStorageSync('src');
    // var W = wx.getStorageSync('W')
    // var L = wx.getStorageSync('L') || 0
    // var T = wx.getStorageSync('T') || 0
    var boxW = winW * .5
    
      that.setData({
        imgsrc: src,
        boxW: boxW
      })
    
  },
  //事件处理函数
  //难度选择
  tomode:function(e){
    var mode = !e ? this.data.mode : parseFloat(e.currentTarget.dataset.id),
        lines = [];
    for (var i = 1; i < 6; i++) {
      var obj = i * 100 / mode + '%';
      lines.push(obj);
    }
    console.log(lines);
    this.setData({
      lines: lines,
      mode: mode
    })

  },
  //选择推荐模版
  stencilShow:function(){
    var that = this,
        template = that.data.template

    wx.showActionSheet({
      itemList: template,
      success: function (res) {
        let i = res.tapIndex
        that.setData({
          textCN: template[i]
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    }) 
  },

  //输入框规则
  // bindKLInput:function(e){
  //   //筛选出汉字
  //   var val = e.detail.value.trim(),
  //       reg = /[\u4e00-\u9fa5]/g,
  //       result = val.match(reg);

  //   if (result === null){
  //     this.setData({
  //       textCN: ''
  //     })
  //   }else{
  //     result = result.join("");
  //     this.setData({
  //       textCN: result
  //     })
  //   }
  // },

  //金额输入框函数
  bindJEInput: function (e) {
    var value = !e ? this.data.sum : e.detail.value;
    var inp = Math.round(value * 100) / 100;
    var bi = commision/100;
    inp = inp > maxsum ? maxsum : inp;
    inp = inp > minfc ? inp.toFixed(2) : minfc.toFixed(2);
    var val = inp*1;
    var balance = parseFloat(this.data.balance);
    var serc = Math.round(val * bi * 100) / 100;
    var actual = val + serc > balance ? (val + serc - balance).toFixed(2) : 0;
    serc = inp*1>0 ? serc < 0.01 ? 0.01 : serc : 0;
    if (parseFloat(actual) > 0) {
      //var btntxt = '还需支付' + actual + '元'
      this.setData({
        sum: inp,
        serviceCharge: serc.toFixed(2),
        //btn: btntxt
      })
    }else{
      this.setData({
        sum: inp,
        serviceCharge: serc.toFixed(2),
        //btn: '生成拼图PK'
      })
    }
  },
  //数量输入框控制函数
  bindSLInput: function(e){
    var num = parseFloat(e.detail.value);
        num = num > 1 ? num > maxnum ? maxnum : num : 1;
    this.setData({
      num: num
    })
  },
  //表单提交
  formSubmit: function (e) {
    var that = this;
    var val = e.detail.value,
        valkl = val.text,
        valsj = val.sum*1,
        valsl = parseFloat(val.num),
        formid = e.detail.formId;
    if(valkl == ''){
      wx.showModal({
        title: '提示',
        content: '请留下你的寄语！',
        showCancel:false,
        success: function (res) {
        }
      })
      return false
    }  
    if(valsj == ''){
      wx.showModal({
        title: '提示',
        content: '请填写金额！',
        showCancel: false,
        success: function (res) {
        }
      })
      return false
    }
    if(valsl == ''){
      wx.showModal({
        title: '提示',
        content: '请填写数量！',
        showCancel: false,
        success: function (res) {
        }
      })
      return false
    }
    valsj = valsj > maxsum ? maxsum : valsj;
    valsj = valsj > minfc ? valsj : minfc;
    valsl = valsl > 1 ? valsl > maxnum ? maxnum : valsl : 1;
    var ns = valsj*100 - minlq*100*valsl;
    if (ns < 0) {
      wx.showModal({
        title: '提示',
        content: '单个金额不能少于' + minlq.toFixed(2) + '元',
        showCancel: false,
        success: function (res) {
        }
      })
      return false
    }
    
    //登录信息验证
    var tok = app.globalData.token;
    if (!tok){return false;}
    wx.showLoading({
      title: '正在提交',
      mask: true
    })
    var mode = this.data.mode
    var src = wx.getStorageSync('src')
    var W = wx.getStorageSync('W')
    var L = wx.getStorageSync('L')
    var T = wx.getStorageSync('T')
    // wx.uploadFile({
    //   url: app.setConfig.url + '/index.php/Asset/asset/plupload',
    //   filePath: src,
    //   name: 'file',
    //   formData: {
    //     'token': tok,
    //   },
    //   success: function (res) {
    //     wx.showLoading({
    //       title: '信息验证',
    //       mask: true
    //     })
    //     var src = JSON.parse(res.data).file_url;
        //提交信息
        var postUrl = app.setConfig.url + '/index.php/Api/Enve/saveEnve',
          postData = {
            quest: valkl,
            amount: valsj,
            num: valsl,
            type: mode,
            pic_dir:src,
            form_id: formid,
            token: tok
          };
        app.postLogin(postUrl, postData, that.saveEnve);
        return false;
    //   }
    // })
    
  },
  //查看原图
  toimgs: function () {
    var src = this.data.imgsrc;
    wx.showActionSheet({
      itemList: ['查看原图', '从手机相册选择', '摄影师作品'],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.previewImage({
            current: '', // 当前显示图片的http链接
            urls: [src] // 需要预览的图片http链接列表
          })
        } else if (res.tapIndex == 1) {
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
            url: '../select/select?cid=1'
          });
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  // 转发
  onShareAppMessage: function (res) {
    var title = '新奇的拼图领赏玩法，快来体验吧 >>';
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
  //提交
  saveEnve:function(res){
    var that = this;
    console.log(res)
    if(res.data.code===20000){
      var payInfo = res.data.data;
      var pid = payInfo.pid;
      if (payInfo.pay_type == 2){
        var balance = parseFloat(that.data.balance) - parseFloat(that.data.sum) - parseFloat(that.data.serviceCharge);
        wx.showToast({
          title: '支付成功',
          mask: true,
          icon: 'success',
          duration: 1000
        })
        var ownerImg = that.data.userInfo.avatarUrl
        var ownerName = that.data.userInfo.nickName
        var describe = that.data.textCN
        wx.setStorageSync('SPid', pid)
        wx.setStorageSync('SOwnerImg', ownerImg)
        wx.setStorageSync('SOwnerName', ownerName)
        wx.setStorageSync('SDescribe', describe)
        setTimeout(function () {
          that.setData({
            sum: '',
            num: '',
            balance: balance.toFixed(2)
          })
          wx.navigateTo({
            url: '../share/share?cid=0'
          })
        }, 1000)
        var postUrlTZ = app.setConfig.url + '/index.php?g=Api&m=Enve&a=sendCreateEnveNotify',
          postDataTZ = {
            token: app.globalData.token,
            prepay_id: payInfo.prepay_id,
            pid: payInfo.pid
          };
        app.postLogin(postUrlTZ, postDataTZ);
      }else{
        wx.requestPayment({
          'timeStamp': payInfo.timeStamp,
          'nonceStr': payInfo.nonceStr,
          'package': payInfo.package,
          'signType': 'MD5',
          'paySign': payInfo.paySign,
          'success': function (res) {
            var balance = parseFloat(that.data.balance) - parseFloat(that.data.sum);
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 1000
            })
            var ownerImg = that.data.userInfo.avatarUrl
            var ownerName = that.data.userInfo.nickName
            var describe = that.data.textCN
            wx.setStorageSync('SPid', pid)
            wx.setStorageSync('SOwnerImg', ownerImg)
            wx.setStorageSync('SOwnerName', ownerName)
            wx.setStorageSync('SDescribe', describe)
            setTimeout(function(){
              that.setData({
                sum: '',
                num: '',
                balance: '0.00'
              })
              wx.navigateTo({
                url: '../share/share?cid=0'
              })
            },1000)
            var postUrlTZ = app.setConfig.url + '/index.php?g=Api&m=Enve&a=sendCreateEnveNotify',
              postDataTZ = {
                token: app.globalData.token,
                prepay_id: payInfo.prepay_id,
                pid: payInfo.pid
              };
            app.postLogin(postUrlTZ, postDataTZ);
          },
          'fail': function (res) {
            // 支付失败
            wx.showToast({
              title: '支付失败',
              icon: 'loading',
              mask: true,
              duration: 1000
            })
            //释放冻结金额
            var postUrl = app.setConfig.url + '/index.php?g=User&m=Consumer&a=rurnFrozenAmount',
            postData = {
              token: app.globalData.token
            };
            app.postLogin(postUrl, postData);
          }
          
        })
      }
    }
    return false;
  },
  
  loop: function () {  
    var info = app.globalData.userInfo,
        tok = app.globalData.token;
    if (info && !this.data.hasUserInfo){
      wx.showLoading({
        title: '数据初始化',
        mask: true
      })
      this.setData({
        userInfo: info,
        hasUserInfo: true
      })
    }
    if (!tok) {
      var that = this
      setTimeout(function () { that.loop(); }, 100)
    } else {
      this.setData({
        token: tok
      })
      var postUrl = app.setConfig.url + '/index.php?g=User&m=Consumer&a=userInfo',
        postData = {
          token: tok
        };
      app.postLogin(postUrl, postData, this.initial);
    }
  },
  
  initial: function (res) {
    wx.hideLoading()
    if (res.data.code == 20000) {
      var data = res.data.data;
      var difficulty = !data.difficulty ? true : false;
      maxsum = !data.hb_max_amount ? 50000 : data.hb_max_amount;            // 最大赏金
      maxnum = !data.hb_max_num ? 1000 : data.hb_max_num;                 // 最大个数
      minfc = !data.amount_min ? 1 : data.amount_min;                 // 最小发出金额
      minlq = !data.receive_amount_min ? 1 : data.receive_amount_min;   // 最小领取金额
      commision = !data.commision ? 2 : data.commision;   // 佣金比例（*%）
      this.setData({
        template: data.word_tpl,
        textCN: data.word_tpl[0],
        commision: commision,
        difficulty: difficulty
      })
      //this.bindJEInput();
    }
  }
})
