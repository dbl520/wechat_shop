// pages/list/list.js
const app = getApp()
var goodListUrl = app.globalData.url + 'goodsList'
var CategoryUrl = app.globalData.url + 'goodsCategory'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: [],
    currentType: 0,
    pagesize: 8,
    goodList: [],
    scrollHight: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var res = wx.getSystemInfoSync().windowWidth
    var scrollHight = Math.floor(750 / res * wx.getSystemInfoSync().windowHeight)
    this.setData({
      scrollHight: scrollHight
    })
    this.getCategory()
    this.http(goodListUrl, this.data.currentType, this.data.pagesize, this.goodList)
  },

  getCategory: function () {
    wx.request({
      url: CategoryUrl,
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        var category = []
        for(let idx in res.data) {
          var obj = res.data[idx]
          if (obj.level == 1) {
            var temp= {
              id: obj.id,
              name: obj.name 
            }
            category.push(temp)
          }
        }
        var all = {
          id: '0',
          name: '全部'
        }
        category.unshift(all)
        this.setData({
          category: category
        })
      }
    })
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
    // console.log(data)
    wx.hideLoading()
    wx.hideNavigationBarLoading()
    var pagesize = this.data.pagesize + 8
    if (data.length != 0) {
      this.setData({
        pagesize: pagesize,
        goodList: data
      })
    } else {
      this.setData({
        pagesize: pagesize,
        goodList: data
      })
    }
  },

  onNavBarTap: function (e) {
    wx.showLoading()
    var idx = e.currentTarget.dataset.index
    this.setData({
      currentType: idx,
      pagesize: 8
    })
    this.http(goodListUrl, this.data.currentType, this.data.pagesize, this.goodList)
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
    this.http(goodListUrl, this.data.currentType, this.data.pagesize, this.goodList)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})