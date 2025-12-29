function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function goto(url) {
  if(url){
    wx.navigateTo({
      url: url,
      fail: wx.navigateBack()
    })
  }else{
    wx.navigateBack({
      delta: 1,
      fail: ()=>{
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }
    })
  }
}

module.exports = {
  formatTime,
  goto
}
