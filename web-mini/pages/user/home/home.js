const http = require('../../../utils/http.js');
var that;
const app = getApp();
Page({
  data: {
    addGlobalClass: true,
    nickname: null,
    userInfo: wx.getStorageSync('userInfo'),
    CustomBar: app.globalData.CustomBar,
    StatusBar: app.globalData.StatusBar,
    appId: app.globalData.appid,
    baseUrl: app.globalData.baseUrl + "/uploads",
    isSignedIn: false, // 今日是否已签到
    userPoints: 0, // 用户积分
  },
  onLoad() {
    that = this;
  },
  onShow(){
    // 每次显示页面时检查签到状态
    this.checkSignInStatus();
  },
  onChooseAvatar(e) {
    wx.uploadFile({
      url: app.globalData.baseUrl + '/auth/updateAvatar',
      method: 'POST',
      filePath: e.detail.avatarUrl,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: function (res) {
        // get new avatar 
        that.getUserInfo();
        wx.hideLoading();
      },
      fail: function (err) {
        wx.hideLoading();
        wx.showToast({
          title: '更新头像失败',
          icon: 'error'
        })
      }
    })
  },
  onNicknameChange(e) {
    console.log(e.detail.value)
    that.setData({
      nickname: e.detail.value
    })
  },
  commitNickname() {
    console.log(that.data.nickname)
    if (that.data.nickname != null) {
      http.post("/auth/updateNickname", {
        nickname: that.data.nickname
      }).then(resp => {
        if (resp.code == 200) {
          this.getUserInfo();
        } else {
          wx.showToast({
            title: '系统错误',
            icon: 'error'
          })
        }
      }).catch(err => {
        wx.showToast({
          title: '系统错误',
          icon: 'error'
        })
      })
    }
    this.hideModal()
  },
  getUserInfo() {
    http.get("/auth/getUserInfo")
      .then(resp => {
        that.setData({
          userInfo: resp.data
        })
        wx.setStorageSync('userInfo', resp.data)
      }).catch(err => {
        wx.showToast({
          title: '获取信息失败',
          icon: 'none'
        })
      })
  },
  showPrivacyContract() {
    wx.openPrivacyContract({
      success: res => {
        console.log('openPrivacyContract success')
      },
      fail: res => {
        console.error('openPrivacyContract fail', res)
      }
    })
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  coutNum(e) {
    if (e > 1000 && e < 10000) {
      e = (e / 1000).toFixed(2) + 'k'
    }
    if (e > 10000) {
      e = (e / 10000).toFixed(2) + 'W'
    }
    return e
  },
  showModal(e) {
    console.log(e.currentTarget.dataset)
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      error: false,
      success: false,
      showMail: false,
      modalName: null
    })
  },
  goTo(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  // 检查签到状态
  checkSignInStatus() {
    const token = wx.getStorageSync('token') || app.globalData.token;
    if (!token) {
      // 未登录，默认未签到
      that.setData({
        isSignedIn: false,
        userPoints: 0
      });
      return;
    }

    http.get('/auth/checkSignIn')
      .then(resp => {
        if (resp.code === 200) {
          that.setData({
            isSignedIn: resp.data || false
          });
        }
      })
      .catch(err => {
        // 检查失败，默认未签到
        that.setData({
          isSignedIn: false
        });
      });

    // 获取用户信息（包含积分）
    http.get('/auth/getUserInfo')
      .then(resp => {
        if (resp.code === 200 && resp.data) {
          that.setData({
            userPoints: resp.data.points || 0
          });
          wx.setStorageSync('userInfo', resp.data); // 更新缓存用户信息
        }
      })
      .catch(err => {
        console.log('获取用户信息失败', err);
      });
  },

  // 执行签到
  doSignIn() {
    const token = wx.getStorageSync('token') || app.globalData.token;
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    http.post('/auth/signIn', {})
      .then(resp => {
        if (resp.code === 200) {
          wx.showToast({
            title: resp.data.message || '签到成功',
            icon: 'success'
          });
          // 更新签到状态和积分
          that.setData({
            isSignedIn: true,
            userPoints: resp.data.points || 0
          });
          // 3秒后关闭弹窗
          setTimeout(() => {
            that.hideModal();
          }, 2000);
        }
      })
      .catch(err => {
        wx.showToast({
          title: err.data?.msg || '签到失败',
          icon: 'none'
        });
      });
  },

})