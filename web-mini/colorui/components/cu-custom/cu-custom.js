// colorui/components/cu-custom.js
const app = getApp();
Component({
  /**
   * 组件的一些选项
   */
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    bgColor: {
      type: String,
      default: ''
    },
    isCustom: {
      type: Boolean,
      default: false
    },
    isBack: {
      type: Boolean,
      default: false
    },
    bgImage: {
      type: String,
      default: ''
    },
    isLucency: {
      type: Boolean,
      default: false
    },
    noFixed: {
      type: Boolean,
      default: false
    },
    homePage: {
      type: String,
      default: '/pages/index/index'
    },
    userPage: {
      type: String,
      default: '/pages/user/home/home'
    },
    avatarUrl: {
      type: String,
      default: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    mode: 'default'
  },

  pageLifetimes: {
    show() {
      this.getInfo()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    BackPage() {
      wx.navigateBack({
        delta: 1
      });
    },
    toHome(e) {
      if(e.currentTarget.dataset.url != ''){
        wx.reLaunch({
          url: e.currentTarget.dataset.url
        })
      }
      else{
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    },
    toUser(e) {
      console.log(e)
      if(e.currentTarget.dataset.url != ''){
        wx.navigateTo({
          url: e.currentTarget.dataset.url
        })
      }
      else{
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    },
    getInfo() {
      var that = this
      if (getCurrentPages().length === 1) {
        that.setData({
          mode: 'singlePage'
        })
      }
    }
  }
})