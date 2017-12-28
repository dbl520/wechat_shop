//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0,
    allGoodsPrice: 0,
    orderType: "",  //  订单类型,默认是购物车
    addrs: [],
    curAddressData: ''
  },

  onLoad: function (e) {
    var that = this
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    })
  },

  onShow: function () {
    var that = this
    var shopList = []
    //立即购买下单
    if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo')
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo')
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active
        })
      }
    }
    that.setData({
      goodsList: shopList
    }) 
    that.initShippingAddress()
  },
  // 初始化地址信息
  initShippingAddress: function () {
    var that = this
    wx.request({
      url: app.globalData.url + 'listAddress',
      data: {
        mid: app.globalData.userInfo.mid
      },
      success: (res) => {
        var addrsList = res.data
        for (let i = 0; i < addrsList.length; i++) {
          var temp = addrsList[i]
          if (temp.status == 1) {
            that.setData({
              addrs: addrsList,
              curAddressData: temp
            })
          }
        }
        that.totalPrice()
      }
    })
  },
  // 计算订单总价
  totalPrice: function () {
    var that = this
    var goodsList = this.data.goodsList
    var isNeedLogistics = 0
    var allGoodsPrice = 0

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i]
      if (carShopBean.logistics) {
        isNeedLogistics = 1
      }
      allGoodsPrice += carShopBean.goods.price * carShopBean.goods_num
    }
    that.setData({
      allGoodsPrice: allGoodsPrice.toFixed(2)
    })
  },
  // 提交订单
  createOrder: function (e) {
    wx.showLoading()
    var that = this
    var remark = ""
    if (e) {
      remark = e.detail.value.remark // 备注信息
    }
    var postData = {
      mid: app.globalData.userInfo.mid,
      total: this.data.allGoodsPrice,
      remarks: remark,
    }
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading()
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return
      }

      var goodslist = this.data.goodsList   
      var templist = []
      for (var idx in goodslist) {
        var obj = goodslist[idx]
        var temp = {
          id: obj.goods_id,
          price: obj.goods.price,
          num: obj.goods_num
        }
        templist.push(temp)
      }

      postData.goods = JSON.stringify(templist)
      postData.address = JSON.stringify({
        name: this.data.curAddressData.name,
        tel: this.data.curAddressData.tel,
        address: this.data.curAddressData.province + this.data.curAddressData.city + this.data.curAddressData.area + this.data.curAddressData.address
      })
    }

    wx.request({
      url: app.globalData.url + 'add2Order',
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: postData,
      success: (res) => {
        wx.hideLoading()    
        if (res.data.code == 1) {
          // 微信支付
          var out_trade_no = res.data.order.order_id
          var total_fee = res.data.order.price * 100
          var goodslist = this.data.goodsList
          var body = ''
          if (goodslist.length > 1) {
            body = goodslist[0].goods.title + '...等' + goodslist.length + '件商品'
          } else {
            body = goodslist[0].goods.title
          }
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
                  wx.navigateBack({})
                },
                'fail': function (res) {
                  wx.redirectTo({
                    url: '/pages/orders/index',
                  })
                }
              })
            }
          })
          // 清空购物车已购买商品
          wx.removeStorageSync('shopCarInfo')
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.navigateBack({})
              }
            }
          })
        }
      }
    })
  },

  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address/index"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/address/index"
    })
  }
})
