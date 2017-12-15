//app.js
App({
  onLaunch: function () {
    var that = this;
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        wx.getStorage({
          key: 'openid',
          success: function (res) {
            that.globalData.openid = res.data
          }
        })
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            that.globalData.userInfo = res.data
          }
        })
      },
      fail: function () {
        //session 已过期，重新拉取openid
        that.getUserOpenId(function (data) {
          wx.setStorage({
            key: 'openid',
            data: data.openid
          })
        })
      }
    })
  },
  // 闭包获取openid
  getUserOpenId: function (callback) {
    var self = this
    if (self.globalData.openid) {
      //已获取openid
      callback(null, self.globalData.openid)
    } else {
      wx.login({
        //参考wx.login文档
        success: function (data) {
          wx.request({
            url: self.globalData.url + 'onLogin',
            data: {
              code: data.code
            },
            success: function (res) {
              // console.log('获取用户openid成功')
              self.globalData.openid = res.data.openid
              callback(res.data)
            },
            fail: function (res) {
              // console.log('获取用户openid失败，将无法正常使用开放接口等服务')
              callback(res)
            }
          })
        },
        fail: function (err) {
          // console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务')
          callback(err)
        }
      })
    }
  },

  //关联登陆
  relateUser: function (callback) {
    var that = this
    wx.getUserInfo({
      success: function (res) {
        wx.request({
          url: that.globalData.url + 'relateUser',
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          data: {
            openid: that.globalData.openid,
            userInfo: JSON.stringify(res.userInfo)
          },
          success: function (res) {
            that.globalData.userInfo = res.data
            // typeof callback == 'function' && callback(res.data)
            wx.setStorage({
              key: 'userInfo',
              data: res.data
            })
            callback(res.data)
          }
        })
      },
      fail: function (res) {
        console.log('用户授权失败，将无法正常获取用户信息', res)
      }
    })
  },

  globalData: {
    userInfo: null,
    url: 'https://miniapi.eiewz.cn/index.php/API/WxTestcart/'
  }
})