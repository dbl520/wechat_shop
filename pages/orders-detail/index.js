// pages/orders-detail/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusType: ["全部", "待付款", "待发货", "待收货", "已完成"],
    orderStatus: ["已取消", "待付款", "待发货", "待收货", "已完成"],
    id: '',
    orderDetail: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    this.setData({
      id: id
    })
  },

  onRatingTap:function (e) {
    var pic = e.currentTarget.dataset.pic
    var title = e.currentTarget.dataset.title
    var orderid = e.currentTarget.dataset.orderid
    var goodsid = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '/pages/rating/index?orderid=' + orderid + '&goodsid=' + goodsid + '&pic=' + pic + '&title=' + title,
    })
  },

  delOrder:function (e) {
    var orderid = e.currentTarget.dataset.orderid
    wx.showModal({
      title: '提示',
      content: '确认删除吗？删除的订单不能恢复哦！',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + 'deleteOrder',
            data: {
              order_id: orderid
            },
            success: (res) => {
              if (res.data.code == 1) {
                wx.navigateBack({})
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.data.msg,
                  showCancel: false
                })
              }
            }
          })
        }
      }
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
    wx.request({
      url: app.globalData.url + 'orderDetail',
      data: {
        mid: app.globalData.userInfo.mid,
        id: this.data.id
      },
      success: (res) => {
        this.setData({
          orderDetail: res.data
        })
      }
    })
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