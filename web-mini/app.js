App({
  globalData: {
    deviceInfo: null,
    // 遮挡率
    shadeDegree: .3,
    // 性能优化
    optimization: false,
    baseUrl: 'https://localhost:2026/api',
    share: null,
  },

  onLaunch: function () {
    this.globalData.StatusBar = wx.getWindowInfo().statusBarHeight;
    this.globalData.ScreenWidth = wx.getWindowInfo().screenWidth;
    this.globalData.ScreenHeight = wx.getWindowInfo().screenHeight;

    let capsule = wx.getMenuButtonBoundingClientRect();
    if (capsule) {
      this.globalData.Custom = capsule;
      this.globalData.CustomBar = capsule.bottom + capsule.top -  wx.getWindowInfo().statusBarHeight;
    } else {
      this.globalData.CustomBar =  wx.getWindowInfo().statusBarHeight + 50;
    }
    
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 全局数据
    this.globalData.deviceInfo = wx.getWindowInfo();
    this.globalData.shadeDegree = wx.getStorageSync('shadeDegree') || .3
    this.globalData.optimization = wx.getStorageSync('optimization') || false

    // 小程序启动时完成用户登录流程
    this.doLogin()

    // wx.request({
    //   url: this.globalData.requestHost + '/degree',
    //   method: 'GET',
    //   success: res => {
    //     if (res.data.code === 201) {
    //       this.globalData.degree = res.data.result
    //     }
    //   }
    // })
  },

  /**
   * 执行登录流程
   */
  doLogin: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 将code发送到后台
          wx.request({
            url: this.globalData.baseUrl + '/auth/wxLogin',
            method: 'POST',
            data: {
              code: res.code
            },
            header: {
              'Content-Type': 'application/json'
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.code === 200) {
                // 保存token和用户信息到localStorage
                const token = res.data.data.token
                const userInfo = res.data.data.userInfo
                
                this.globalData.token = token
                this.globalData.userInfo = userInfo
                wx.setStorageSync('token', token)
                wx.setStorageSync('userInfo', userInfo)
                
                console.log('登录成功，用户信息已保存', userInfo)
              } else {
                console.error('登录失败：', res.data.message || '未知错误')
                wx.showToast({
                  icon: 'error',
                  title: res.data.message || '登录失败',
                  duration: 2000
                })
              }
            },
            fail: (err) => {
              console.error('登录请求失败：', err)
              wx.showToast({
                icon: 'error',
                title: '网络请求失败',
                duration: 2000
              })
            }
          })
        } else {
          console.error('获取code失败：', res.errMsg)
        }
      },
      fail: (err) => {
        console.error('wx.login调用失败：', err)
      }
    })
  },
  onShow: function () {
    // wx.request({
    //   url: this.globalData.requestHost + '/share',
    //   method: 'GET',
    //   success: res => {
    //     if (res.data.code === 201) {
    //       this.globalData.share = res.data.result
    //     }
    //   }
    // })
  },

  adapterDegree(shadeDegree, returnType = 'title') {
    let setDegree = parseInt(shadeDegree * 100)
    let title, range
    this.globalData.degree.map(item => {
      if (setDegree >= item.range[0] && setDegree <= item.range[1]) {
        title = item.title
        range = item.range
        // 好像并不会跳过剩余的循环
        return
      }
    })
    if (returnType === 'range') {
      return range
    }
    return title
  }
})
