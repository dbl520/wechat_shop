// pages/more-rating/index.js
var util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_id: '',
    pagesize: 0,
    reputation: {},
    ratings: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    this.setData({
      goods_id: id
    })
    this.getMoreRating(id, this.data.pagesize)
  },

  getMoreRating: function (goods_id, pagesize) {
    wx.showNavigationBarLoading()
    pagesize = pagesize + 8
    wx.request({
      url: app.globalData.url + 'goodsComments',
      data: {
        goods_id: goods_id,
        pagesize: pagesize,
        page: 1
      },
      success: (res) => {
        wx.hideNavigationBarLoading()

        var ratings = []
        for (let i in res.data.data) {
          var obj = res.data.data[i]
          var temp = {
            id: obj.id,
            mid: obj.mid,
            gid: obj.gid,
            oid: obj.oid,
            content: obj.content,
            score: obj.score,
            stars: util.convertToStarsArray(obj.score),
            reply: obj.reply,
            replytime: obj.replytime,
            dateline: obj.dateline,
            nickname: obj.nickname,
            account: obj.acount,
            avatar: obj.avatar,
            pics: obj.pics
          }
          ratings.push(temp)
        }

        this.setData({
          pagesize: pagesize,
          ratings: ratings
        })
      }
    })
  },
  
  onViewImgTap: function (e) {
    var currentImg = e.currentTarget.dataset.img
    var pics = e.currentTarget.dataset.pics
    wx.previewImage({
      current: currentImg,
      urls: pics
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
    this.getMoreRating(this.data.goods_id, this.data.pagesize)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})