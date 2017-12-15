//index.js
//获取应用实例
const app = getApp()
var bannerUrl = app.globalData.url + 'fetchSlide'
var goodListUrl = app.globalData.url + 'goodsList'

Page({
  data: {
    showResult: false,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    banner: [],
    goodList: [],
    cid: 0,
    pagesize: 8
  },

  onLoad: function () {
    this.http(bannerUrl, '', '', this.bannerData)
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
  bannerData: function (data) {
    this.setData({
      banner: data
    })
  },
  onFocusTap: function (e) {
    wx.navigateTo({
      url: '../serach/index'
    })
  },

  onTopicTap: function (e) {
    var cid = e.currentTarget.dataset.cid
    var category = e.currentTarget.dataset.category
    wx.navigateTo({
      url: '/pages/topic/index?cid=' + cid + '&category=' + category,
    })
  },

  // onTypeTap: function(e) {
  //   wx.showLoading()
  //   var type = e.currentTarget.dataset.type
  //   this.setData({
  //     Type: type,
  //     pagesize: 8
  //   })
  //   this.http(goodListUrl, this.data.Type, this.data.pagesize, this.goodList)
  // },

  toDetailsTap: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../goods-details/index?id=' + id
    })
  },
  
  onReachBottom: function() {
    wx.showNavigationBarLoading()
    this.http(goodListUrl, this.data.cid, this.data.pagesize, this.goodList)
  },

  onShareAppMessage: function () {
    return {
      title: '华邦商城',
      path: '/pages/index/index'
    }
  }
})
