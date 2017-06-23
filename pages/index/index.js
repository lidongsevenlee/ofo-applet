//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    scale: 18,
    latitude: 0,
    longitude: 0
  },
// 页面加载
  onLoad: function (options) {
    // 1.获取定时器，用于判断是否已经在计费
    this.timer = options.timer;

    // 2.获取并设置当前位置经纬度
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    });

    // 3.设置地图控件的位置及大小，通过设备宽高定位
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          controls: [{
            id: 1,
            iconPath: '/images/location.png',
            position: {
              left: 20,
              top: res.windowHeight - 80,
              width: 50,
              height: 50
            },
            clickable: true
          },
          {
            id: 2,
            iconPath: '/images/use.png',
            position: {
              left: res.windowWidth/2 - 45,
              top: res.windowHeight - 100,
              width: 90,
              height: 90
            },
            clickable: true
          },
          {
            id: 3,
            iconPath: '/images/warn.png',
            position: {
              left: res.windowWidth - 70,
              top: res.windowHeight - 80,
              width: 50,
              height: 50
            },
            clickable: true
          },
          {
            id: 4,
            iconPath: '/images/marker.png',
            position: {
              left: res.windowWidth/2 - 11,
              top: res.windowHeight/2 - 45,
              width: 22,
              height: 45
            },
            clickable: true
          },
          {
            id: 5,
            iconPath: '/images/avatar.png',
            position: {
              left: res.windowWidth - 68,
              top: res.windowHeight - 155,
              width: 45,
              height: 45
            },
            clickable: true
          }]
        })
      }
    });

    // 4.请求服务器，显示附近的单车，用marker标记
    wx.request({
      url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/biyclePosition',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: (res) => {
          this.setData({
            markers: res.data.data
          })
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },
// 页面显示
  onShow: function(){
    // 1.创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("ofoMap");
    this.movetoPosition()
  },
// 地图控件点击事件
  bindcontroltap: function(e){
    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
    switch(e.controlId){
      // 点击定位控件
      case 1: this.movetoPosition();
        break;
      // 点击立即用车，判断当前是否正在计费
      case 2: if(this.timer === "" || this.timer === undefined){
          // 没有在计费就扫码
          wx.scanCode({
            success: (res) => {
              // 正在获取密码通知
              wx.showLoading({
                title: '正在获取密码',
                mask: true
              })
              // 请求服务器获取密码和车号
              wx.request({
                url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/password',
                data: {},
                method: 'GET', 
                success: function(res){
                  // 请求密码成功隐藏等待框
                  wx.hideLoading();
                  // 携带密码和车号跳转到密码页
                  wx.redirectTo({
                    url: '../scanresult/index?password=' + res.data.data.password + '&number=' + res.data.data.number,
                    success: function(res){
                      wx.showToast({
                        title: '获取密码成功',
                        duration: 1000
                      })
                    }
                  })           
                }
              })
            }
          })
        // 当前已经在计费就回退到计费页
        }else{
          wx.navigateBack({
            delta: 1
          })
        }  
        break;
      // 点击保障控件，跳转到报障页
      case 3: wx.navigateTo({
          url: '../warn/index'
        });
        break;
      // 点击头像控件，跳转到个人中心
      case 5: wx.navigateTo({
          url: '../my/index'
        });
        break; 
      default: break;
    }
  },
// 地图视野改变事件
  bindregionchange: function(e){
    // 拖动地图，获取附件单车位置
    if(e.type == "begin"){
      wx.request({
        url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/biyclePosition',
        data: {},
        method: 'GET', 
        success: (res) => {
          this.setData({
            _markers: res.data.data
          })
        }
      })
    // 停止拖动，显示单车位置
    }else if(e.type == "end"){
        this.setData({
          markers: this.data._markers
        })
    }
  },
// 地图标记点击事件，连接用户位置和点击的单车位置
  bindmarkertap: function(e){
    console.log(e);
    let _markers = this.data.markers;
    let markerId = e.markerId;
    let currMaker = _markers[markerId];
    this.setData({
      polyline: [{
        points: [{
          longitude: this.data.longitude,
          latitude: this.data.latitude
        }, {
          longitude: currMaker.longitude,
          latitude: currMaker.latitude
        }],
        color:"#FF0000DD",
        width: 1,
        dottedLine: true
      }],
      scale: 18
    })
  },
// 定位函数，移动位置到地图中心
  movetoPosition: function(){
    this.mapCtx.moveToLocation();
  }
})
