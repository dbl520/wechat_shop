// pages/orders/orders.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusType: ["全部", "待付款", "待发货", "待收货", "已完成"],
    orderStatus: ["已取消", "待付款", "待发货", "待收货", "已完成"],
    currentType: 0,
    pagesize: 5,
    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  showOrderList: function (idx, pagesize) {
    wx.showLoading()
    var status = ''
    if (idx == 0) {
      status = '-1,1,2,3,4'
    } else {
      status = idx
    }
    var postData = {
      mid: app.globalData.userInfo.mid,
      status: status,
      pagesize: pagesize,
      page: 1
    }
    wx.request({
      url: app.globalData.url + 'listOrder',
      data: postData,
      success: (res) => {
        wx.hideLoading()
        pagesize = pagesize + 5
        this.setData({
          pagesize: pagesize,
          orderList: res.data
        })
      }
    })
  },

  onNavBarTap: function (e) {
    var idx = e.currentTarget.dataset.index
    this.setData({
      pagesize: 5,
      currentType: idx
    })
    this.showOrderList(idx, this.data.pagesize)
  },

  onDetailTap: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/orders-detail/index?id=' + id
    })
  },
  // 取消订单
  cancelOrderTap: function (e) {
    var _this = this
    var order_id = e.currentTarget.dataset.orderid

    wx.showModal({
      title: '温馨提示',
      content: '确认取消吗？',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + 'cancelOrder',
            data: {
              order_id: order_id
            },
            success: (res) => {
              if (res.data.code != 0) {
                _this.showOrderList(_this.data.currentType, _this.data.pagesize)
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
  // 确认收货
  checkOrder: function (e) {
    var _this = this
    var orderId = e.currentTarget.dataset.orderid

    wx.showModal({
      title: '提示',
      content: '确认已经收货了吗？',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + 'confirmOrder',
            data: {
              mid: app.globalData.userInfo.mid,
              order_id: orderId
            },
            success: (res) => {
              if (res.data.code == 1) {
                _this.onShow()
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
   * 微信支付
   */
  toPayTap: function (e) {
    var goods = e.currentTarget.dataset.goods
    var body = ''
    if (goods.length > 1) {
      body = goods[0].title + '...等' + goods.length + '件商品'
    } else {
      body = goods[0].title
    }

    var out_trade_no = e.currentTarget.dataset.orderid
    var total_fee = e.currentTarget.dataset.money * 100

    wx.request({
      url: app.globalData.url + 'unifiedOrder',
      data: {
        openid: app.globalData.userInfo.openid,
        body: body,
        out_trade_no: out_trade_no,
        total_fee: total_fee
      },
      success: (res) => {
        wx.requestPayment({
          'timeStamp': res.data.timeStamp,
          'nonceStr': res.data.nonceStr,
          'package': res.data.package,
          'signType': res.data.signType,
          'paySign': res.data.paySign,
          'success': function (res) {
            console.log(res.data)
          },
          'fail': function (res) {
          }
        })
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
    this.showOrderList(this.data.currentType, this.data.pagesize)
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
    this.showOrderList(this.data.currentType, this.data.pagesize)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})