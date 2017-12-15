// pages/address/address.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  initShippingAddress: function () {
    wx.request({
      url: app.globalData.url + 'listAddress',
      data: {
        mid: app.globalData.userInfo.mid
      },
      success: (res) => {
        this.setData({
          addressList: res.data
        })
      }
    })
  },

  selectTap: function (e) {
    var idx = e.currentTarget.dataset.id
    var addr = this.data.addressList[idx]
    var postData = {
      mid: app.globalData.userInfo.mid,
      id: addr.id,
      name: addr.name,
      tel: addr.tel,
      province: addr.province,
      city: addr.city,
      area: addr.area,
      address: addr.address,
      status: 1
    }
    if (addr.status != 1) {
      wx.request({
        url: app.globalData.url + 'eidtAddress',
        data: postData,
        success: (res) => {
          if (res.data.code == 1) {
            this.initShippingAddress()
          }
        }
      })
    }
  },

  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/add-addr/index?id=" + e.currentTarget.dataset.id + '&editType=upData'
    })
  },

  onAddAddrTap: function () {
    wx.navigateTo({
      url: '/pages/add-addr/index',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initShippingAddress()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})