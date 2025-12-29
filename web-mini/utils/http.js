//获取应用实例
const app = getApp()

//请求数据
const requsetData = (url, method, parm) => {
  return new Promise(function (resolve, reject) {
    let token = wx.getStorageSync('token') ? wx.getStorageSync('token') : app.globalData.token;
    let finalUrl = url.startsWith("https://")? url : app.globalData.baseUrl + url;
    wx.request({
      url: finalUrl, //请求接口地址
      data: parm,
      method: method,
      header: {
        'content-type': 'application/json', //JSON格式传输
        'Authorization': 'Bearer ' + token
      },
      success(res) {
        // console.log("success res",res) //打印网络请求
        if (res.statusCode == 200 && res.data.code == 200) {
          resolve(res.data)
        } else if(res.data.code == 401){
              wx.login({
                success(res) {
                  if (res.code) {
                    // 获取后台用户信息
                    wx.request({
                      url: app.globalData.baseUrl + '/sys/user/login',
                      method: 'GET',
                      data: {
                        jsCode: res.code
                      },
                      header: {
                        'Content-Type': 'application/json'
                      },
                      success: function (res) {
                        app.globalData.token = res.data.data.token
                        wx.setStorageSync('token', res.data.data.token)
                        wx.setStorageSync('userInfo', res.data.data.user)
                        // 重新执行上次的操作
                        requsetData(url, method, parm)
                      },
                      fail: function (err) {
                        console.log(err)
                        wx.showToast({
                          icon: 'error',
                          title: '登录失败请重启',
                        })
                      }
                    })
                  }
                }
              });
        } else {
          reject(res)
        }
      },
      fail: function (e) {
        console.log("e",e)
        e.errMsg = '网络请求失败！'
        reject(e)
      }
    })
  })
}

//GET请求(地址，参数)
function getData(url, parm) {
  return requsetData(url, 'GET', parm)
}

//POST请求(地址，参数)
function postData(url, parm) {
  return requsetData(url, 'POST', parm)
}

//导出
module.exports = {
  get:getData,
  post:postData
}

