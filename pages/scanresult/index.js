// pages/scanresult/index.js
Page({
  data:{
    time: 9
  },
// 页面加载
  onLoad:function(options){
    // 获取解锁密码
    this.setData({
      password: options.password
    })
    // 设置初始计时秒数
    let time = 9;
    // 开始定时器
    this.timer = setInterval(() => {
      this.setData({
        time: -- time
      });
      // 读完秒后携带单车号码跳转到计费页
      if(time < 0){
        clearInterval(this.timer)
        wx.redirectTo({
          url: '../billing/index?number=' + options.number
        })
      }
    },1000)
  },
// 点击去首页报障
  moveToWarn: function(){
    clearInterval(this.timer)
    wx.redirectTo({
      url: '../index/index'
    })
  }
})