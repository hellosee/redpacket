//recordDetails.js
//获取应用实例
const app = getApp();
var top1 = ''
var top2 = ''
var num1 = -1
var num2 = -1
var winW = wx.getSystemInfoSync().windowWidth;
var control = false
var timeout = 4
var timeadd = 0

var timer1 = null
var timer2 = null

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    token:'',       //  用户登录
    pid:'',            // 包id
    ownerImg:'',           // 包主 头像
    ownerName:'',       //包主 名字
    imgsrc:'/images/pt001.png',     //图片
    textCN: "恭喜发财",       // 
    hint: "",        // 按钮文字
    count: { 
      qtx: '去提现', 
      fhb: '发拼图', 
      qzf: '去转发' 
    },
    status: false,          //  判断包主是否为自己
    zje:'0.00',        // 总金额
    zlq:0,          // 领取个数
    zgs:0,         // 总个数
    ls: [],              // 领取人列表
    playID:-1,        // 语音播放器控制id
    state: 1,         // 状态参数 1-可领取  2-已领取  3-领完了  4-已失效
    receiveState: false,     // 领取状态  true为已领取
    receiveJE:'',
    mytime:'52秒',   //  用时（秒）
    totimer:'0秒',    // 计时器
    boxW: 600,
    mode: 4,      // 难度选择
    list: [],
    abimg: [],
    num1: -1,
    num2: -1,
    key: -1,
    tocue:false,    //  开启
    timeout:3,
    timeot:true,     // 拼图页开关
    toend:false,      // 拼图结束后弹框开关
    boxState: 0,   // 结束后弹框状态 0-可领取  1-被领完  2-已领取
    boxbg:[
      '/images/tan1.png',
      '/images/tan2.png',
      '/images/tan3.png'
    ],
    roll:false,   // 领取开关
    relay:'给你发了一个拼图考验，立刻去挑战吧 >>'    // 转发后显示的提示语
  },
  
  
  onLoad: function (options) {  
    wx.showLoading({
      title: '加载中•••',
      mask: true
    })
    var scene = decodeURIComponent(options.scene);
    if (scene > 0) {
      var pid = scene;
    } else {
      var pid = options.pid;
    }
    this.loop(pid);
  },
  loop:function(pid){
    if (!app.globalData.token){
      var that = this
      setTimeout(function () { that.loop(pid);},100)
    }else{
      var info = app.globalData.userInfo,
          tok = app.globalData.token;
      if (!info) {
        app.userInfoReadyCallback = res => {
          this.setData({
            userInfo: res.userInfo,
            token: tok,
            pid: pid
          })
        }
      } else {
        this.setData({
          userInfo: info,
          token: tok,
          pid: pid
        })
      }

      var postUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=enveDetail',
          postData = {
            id: pid,
            token: tok
          };
      app.postLogin(postUrl, postData, this.initial);  
    }

  },
  //数据初始化
  initial:function(res){
    wx.stopPullDownRefresh();
    if(res.data.code == 20000){
      var data = res.data.data;
      var vos = data.receive,
          status = data.status,
          recive_status = data.recive_status,
          term_status = data.be_overdue,
          voices = [],
          state = 0;
        
      if (recive_status){
        var hint = "已领取";
        state = 2
      } else if (!status){
        var hint = "赏金都被领完了";
        state = 3
      }else{
        var hint = "点击领取";
        state = 1
      }
      if (term_status == 1) {
        state = 4;
      }
      for(var i = 0;i<vos.length;i++){
        var width = (45 + 55 * vos[i].durat / 1000 / 30) + '%',
            duration = Math.round(vos[i].durat / 1000);
        
        var voice = {
          imgurl: vos[i].head_img,
          name: vos[i].nick_name,
          src: vos[i].voice_url,
          width: width,
          duration: duration,
          get_time: vos[i].get_time,
          millisecond: vos[i].durat,
          time: vos[i].add_time,
          lsje: vos[i].receive_amount
        };
        voices = voices.concat(voice);
      }
      let mytime = data.get_time;
      this.setData({
        ownerImg: data.head_img,
        ownerName: data.nick_name,
        mode: data.type,
        imgsrc: data.pic_dir, 
        textCN: data.quest, 
        zje: data.show_amount,
        zlq: data.receive_num,    
        zgs: data.num, 
        mytime: mytime,
        ls: voices,
        state: state,
        receiveState: recive_status,
        hint: hint,
        receiveJE: data.receive_amount,
        hasUserInfo: true
      })
      wx.hideLoading();
      this.addLattice()
    }
  },


  // 点击开始游戏
  cueIn:function(){
    if(this.data.state == 1){
      var that = this
      timeout = 4;
      timeadd = 0;
      top1 = '';
      top2 = '';
      num1 = -1;
      num2 = -1;
      this.setData({
        tocue:true,
        timeout:3,
        totimer: '0秒',
        num1: -1,
        num2: -1,
        key: -1
      })
      this.addLattice()
      setTimeout(function(){
        that.timefun(-1);
      },550)
    }else{
      let src = this.data.imgsrc;
      wx.previewImage({
        current: '', // 当前显示图片的http链接
        urls: [src] // 需要预览的图片http链接列表
      })
    }
  },
  // 放弃挑战
  cueOut:function(){
    if (timer1) { clearTimeout(timer1);}
    if (timer2){ clearInterval(timer2);}
    control = false;
    this.setData({
      tocue: false
    })
  },
  // 计时器函数
  timefun:function(i){
    var that = this
    if(i<0){
      timeout--;
      let timeouts = timeout < 1 ? '开 始': timeout
      let timeot = timeout < 0 ? true : false
      this.setData({
        timeout: timeouts,
        timeot: false
      })
      if(timeout == 0){
        setTimeout(function(){
          that.setData({
            timeot: true
          })
          that.random(that.data.list)
        },300)
        timer1 = setTimeout(function(){
          that.timefun(1)
        },1000)
        return false;
      }
      timer1 = setTimeout(function(){
        that.timefun(-1);
      },1000)
    }else{
      if (timer2) { clearInterval(timer2); } 
      timer2 = setInterval(function(){
        timeadd++;
        that.setData({
          totimer: timeadd + '秒'
        })
      },1000)
    }
  },
  //添加图片方块
  addLattice: function () {
    var mode = this.data.mode,
        list = [],
        abimg = [];
    for (var i = 0; i < mode; i++) {
      for (var j = 0; j < mode; j++) {
        var obj1 = {},
          obj2 = {};
        obj1.id = i + '-' + j
        obj1.left = winW * .8 / mode * j;
        obj1.top = winW * .8 / mode * i;
        obj2.imgl = - winW * .8 * j / mode - 1;
        obj2.imgt = -winW * .8 * i / mode - 1;
        list.push(obj1)
        abimg.push(obj2)
      }
    }
    this.setData({
      list: list,
      abimg: abimg,
      boxW: winW * .8
    })   
  },
  //数组打乱
  random: function (arr) {
    var that = this
    const randomsort = (a, b) => {
      return Math.random() > .5 ? -1 : 1;
    }
    arr.sort(randomsort);
    arr.sort(randomsort);
    arr.sort(randomsort);
    this.setData({
      list: arr
    })
    setTimeout(function(){
      arr.sort(randomsort);
      arr.sort(randomsort);
      that.setData({
        list: arr
      })
      setTimeout(function () { control = true; }, 500)
    }, 400)
  },
  // 点击对换
  toStart: function (e) {
    if (!control) { return false }
    var i = e.currentTarget.dataset.key
    var list = this.data.list
    if (!top1) {
      num1 = i
      top1 = list[num1]
      this.setData({
        key: i
      })
    } else if (!top2 && num1 != i) {
      num2 = i;
      top2 = list[i]
      list[num1] = top2;
      list[i] = top1;
      top1 = '';
      top2 = '';
      this.setData({
        num1: num1,
        num2: num2,
        key: -1,
        list: list
      })
      this.proving();
    } else {
      top1 = '';
      top2 = '';
      num1 = -1
      num2 = -1
      this.setData({
        num1: num1,
        num2: num2,
        key: -1
      })
    }
  },
  //答案验证
  proving: function () {
    var that = this,
        list = this.data.list,
        mode = this.data.mode,
        correct = 0;
    for (var i = 0; i < mode; i++) {
      for (var j = 0; j < mode; j++) {
        var index = i * mode + j,
          oid = i + '-' + j;
        if (list[index].id == oid) {
          correct++;
        } else {
          return false;
        }
      }
    }
    
    if (correct == mode * mode) {
      if (timer2) { clearInterval(timer2); }
      control = false;
      setTimeout(function () {
        wx.showToast({
          title: '你过关啦',
          icon: 'success',
          duration: 1250
        })
      }, 300)
      setTimeout(function(){
        that.setData({
          tocue: false,
          toend: true,
          boxState: 0
        })
      },1500)
    }
  },
  // 点击打开
  endBtn:function(){
    var that = this;
    that.setData({
      roll:true
    })
    let totimer = that.data.totimer;
    totimer = totimer.replace("秒", "")
    var postUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=saveEnveReceive';
    var postData = {
      pid: that.data.pid,
      get_time: totimer,
      token: that.data.token
    };
    var tims1 = new Date().getTime();
    app.postLogin(postUrl, postData, function (res) {
      wx.hideToast()
      let boxState = 1;
      let amount = '';
      console.log(res)
      if (res.data.code == 20000) {
        boxState = 2;
        amount = res.data.data.amount;
      }
      var tims2 = 900 - new Date().getTime() + tims1;
      tims2 = tims2 > 50 ? tims2 : 50;
      setTimeout(function(){
        that.setData({
          receiveJE: amount,
          boxState: boxState,
          roll: false
        })
        
      }, tims2)
    })
  },
  // 关闭提示框
  clearNnd:function(){
    var that = this;
    that.setData({
      toend:false
    })
    setTimeout(function(){
      if (that.data.state == 1){
        wx.showLoading({
          title: '刷新中',
          mask: true
        })
      }
    },500)
    if (that.data.state == 1){
      var cUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=enveDetail',
          cData = {
            id: that.data.pid,
            token: that.data.token
          };
      app.postLogin(cUrl, cData, that.initial);
    }
  },
  //下拉刷新数据
  onPullDownRefresh: function (e) {
    if (this.data.tocue) { wx.stopPullDownRefresh();return false;}
    var postUrl = app.setConfig.url + '/index.php?g=Api&m=Enve&a=enveDetail',
      postData = {
        id: this.data.pid,
        token: this.data.token
      };
    app.postLogin(postUrl, postData, this.initial);
  },
  toBalance: function () {
    wx.navigateTo({
      url: '../balance/balance'
    })
  },
  toIndex: function () {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  toShare: function () {
    var pid = this.data.pid;
    var ownerImg = this.data.ownerImg
    var ownerName = this.data.ownerName
    var describe = this.data.textCN
    wx.setStorageSync('SPid', pid)
    wx.setStorageSync('SOwnerImg', ownerImg)
    wx.setStorageSync('SOwnerName', ownerName)
    wx.setStorageSync('SDescribe', describe)
    wx.navigateTo({
      url: '../share/share?cid=1'
    })
  },
  // 查看大头像
  picture: function (e) {
    var maxurl = e.currentTarget.dataset.src;
    if(!maxurl){return false;}
    wx.previewImage({
      current: '',
      urls: [maxurl]
    })
  },
  // 转发
  onShareAppMessage: function (res) {
    var id = this.data.pid,
      title = this.data.ownerName + ' ' + this.data.relay;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: title,
      path: '/pages/recordDetails/recordDetails?pid=' + id,
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
  }
})
