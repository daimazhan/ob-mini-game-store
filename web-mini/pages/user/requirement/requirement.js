import http from '../../../utils/http.js';
var app = getApp()
Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    StatusBar: app.globalData.StatusBar,
    contactInfo: "",
    content: "",
    submitting: false  // 提交状态，防止重复点击
  },

  onLoad(options) {

  },

  sendRequire(e) {
    const that = this;
    console.log(e.detail.value)
    
    // 防止重复点击：如果正在提交，直接返回
    if (that.data.submitting) {
      return;
    }
    
    const {contactInfo, content} = e.detail.value
    if(!contactInfo || !content){
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      })
      return;
    }
    
    // 设置提交状态，防止重复点击
    that.setData({
      submitting: true
    })
    
    http.post("/requirement/addRequirement", {
        contactInfo, content
      })
      .then(resp => {
        console.log(resp)
        if (resp.code == 200) {
          wx.showToast({
            title: '操作成功',
            icon: 'success'
          })
        }
        that.setData({
          contactInfo: '',
          content: '',
          submitting: false
        })
        setTimeout(()=>{
          wx.navigateBack();
        }, 1500)
      }).catch(err => {
        //console.log(err)
        // 提交失败，重置提交状态
        that.setData({
          submitting: false
        })
        wx.showToast({
          title: err.data.msg || '提交失败，请稍后重试',
          icon: 'none',
        })
      })
  },

  handleContact(e){
    console.log(e)
  }
})
