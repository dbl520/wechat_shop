// pages/topic/index.js
const app = getApp()
var goodListUrl = app.globalData.url + 'goodsList'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodList: [],
    cid: 0,
    pagesize: 8
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cid = options.cid
    var category = options.category
    wx.setNavigationBarTitle({
      title: category,
    })
    this.setData({
      cid: cid
    })
    this.http(goodListUrl, this.data.cid, this.data.pagesize, this.goodList)
  },

  http: function (url, cid, pagesize, callback) {
    if (cid == 0) {
      cid = ''
    }
    wx.request({
      url: url,
      data: {
        cid: cid,
        pagesize: pagesize
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        callback(res.data)
      }
    })
  },
  
  goodList: function (data) {
    wx.hideLoading()
    wx.hideNavigationBarLoading()
    var pagesize = this.data.pagesize + 8
    this.setData({
      pagesize: pagesize,
      goodList: data
    })
  },

  toDetailsTap: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../goods-details/index?id=' + id
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
    wx.showNavigationBarLoading()
    this.http(goodListUrl, this.data.cid, this.data.pagesize, this.goodList)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})