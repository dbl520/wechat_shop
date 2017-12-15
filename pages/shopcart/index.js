// pages/shopcart/index.js

var app = getApp()
Page({
  data: {
    first: false,
    saveHidden: true,
    totalPrice: 0,
    allSelect: false,
    noSelect: false,
    goodsList: [],
    delBtnWidth: 120
  },
  onLoad: function () {
    this.initEleWidth()
    if (app.globalData.userInfo) {
      this.initShopCart()
    } else {
      wx.showModal({
        title: '登录提示',
        content: '登录后再来看吧',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/user/index',
            })
          }
        }
      })
    }
  },

  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth)
    this.setData({
      delBtnWidth: delBtnWidth
    })
  },
  // 获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0
    try {
      var res = wx.getSystemInfoSync().windowWidth
      var scale = (750 / 2) / (w / 2)
      real = Math.floor(res / scale)
      return real
    } catch (e) {
      return false
    }
  },
  // 初始化购物车
  initShopCart: function () {
    wx.request({
      url: app.globalData.url + 'viewCart',
      data: {
        mid: app.globalData.userInfo.mid
      },
      success: (res) => {
        this.setData({
          goodsList: res.data
        })
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), res.data)
      }
    })
  },

  onShow: function () {
    var shopCarInfo = wx.getStorageSync('shopCarInfo')
    if (shopCarInfo && shopCarInfo.shopList) {
      this.setData({
        goodsList: shopCarInfo.shopList
      })
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), shopCarInfo.shopList)
    } else if (app.globalData.userInfo){
      this.initShopCart()
    }
  },

  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      })
    }
  },
  touchM: function (e) {
    var index = e.currentTarget.dataset.index

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX
      var disX = this.data.startX - moveX
      var delBtnWidth = this.data.delBtnWidth
      var left = ""
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px"
      } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px"
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px"
        }
      }
      var list = this.data.goodsList
      if (index != "" && index != null) {
        list[parseInt(index)].left = left
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
      }
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX
      var disX = this.data.startX - endX
      var delBtnWidth = this.data.delBtnWidth
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px"
      var list = this.data.goodsList
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
      }
    }
  },
  // 单个删除
  delItem: function (e) {
    var index = e.currentTarget.dataset.index
    var goods_id = e.currentTarget.dataset.goodsid
    var list = this.data.goodsList

    var _this = this
    wx.request({
      url: app.globalData.url + 'deleteCart',
      data: {
        mid: app.globalData.userInfo.mid,
        ids: goods_id
      },
      success: (res) => {
        if (res.data.code == 1) {
          list.splice(index, 1)
          this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
        }
      }
    })
  },
  // 单选
  selectTap: function (e) {
    var index = e.currentTarget.dataset.index
    var list = this.data.goodsList
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
    }
  },
  // 计算价格
  totalPrice: function () {
    var list = this.data.goodsList
    var total = 0
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (curItem.active) {
        total += parseFloat(curItem.goods.price) * curItem.goods_num
      }
    }
    total = parseFloat(total.toFixed(2))
    return total
  },
  // 全选
  allSelect: function () {
    var list = this.data.goodsList
    var allSelect = false
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (curItem.active) {
        allSelect = true
      } else {
        allSelect = false
        break
      }
    }
    return allSelect
  },
  // 取消选择
  noSelect: function () {
    var list = this.data.goodsList
    var noSelect = 0
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (!curItem.active) {
        noSelect++
      }
    }
    if (noSelect == list.length) {
      return true
    } else {
      return false
    }
  },

  setGoodsList: function (saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      saveHidden: saveHidden,
      totalPrice: total,
      allSelect: allSelect,
      noSelect: noSelect,
      goodsList: list
    })
    // console.log(this.data.goodsList)
    var shopCarInfo = {}
    shopCarInfo.shopList = list
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
  },

  bindAllSelect: function () {
    var currentAllSelect = this.data.allSelect
    var list = this.data.goodsList
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i]
        curItem.active = false
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i]
        curItem.active = true
      }
    }

    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list)
  },
  // 商品数量加
  jiaBtnTap: function (e) {
    var index = e.currentTarget.dataset.index
    var goods_id = e.currentTarget.dataset.goodsid
    var list = this.data.goodsList
    if (index !== "" && index != null) {
      if (list[parseInt(index)].goods_num < 10) {
        list[parseInt(index)].goods_num++
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
      }
    }
    var shop_num = list[parseInt(index)].goods_num
    this.editCart(goods_id, shop_num)
  },
  // 商品数量减
  jianBtnTap: function (e) {
    var index = e.currentTarget.dataset.index
    var goods_id = e.currentTarget.dataset.goodsid
    var list = this.data.goodsList
    if (index !== "" && index != null) {
      if (list[parseInt(index)].goods_num > 1) {
        list[parseInt(index)].goods_num--
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
      }
    }
    var shop_num = list[parseInt(index)].goods_num
    this.editCart(goods_id, shop_num)
  },
  // 编辑
  editCart: function (goods_id, shop_num) {
    var _this = this
    wx.request({
      url: app.globalData.url + 'editCart',
      data: {
        mid: app.globalData.userInfo.mid,
        goods_id: goods_id,
        shop_num: shop_num
      },
      success: function (res) {
        console.log(res.data)
      }
    })
  },

  editTap: function () {
    var list = this.data.goodsList
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      curItem.active = false
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
  },
  
  saveTap: function () {
    var list = this.data.goodsList
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      curItem.active = true
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
  },
  // 完成
  getSaveHide: function () {
    var saveHidden = this.data.saveHidden
    return saveHidden
  },
  // 删除选中
  deleteSelected: function () {
    var _this = this
    var list = this.data.goodsList
    var templist = this.data.goodsList
    var temp = []

    list = list.filter(function (curGoods) {
      return !curGoods.active
    })
    templist = templist.filter(function (curGoods) {
      return curGoods.active
    })

    for (let i = 0; i < templist.length; i++) {
      let curItem = templist[i]
      temp.push(curItem.goods_id)
    }
    temp = temp.toString()

    wx.request({
      url: app.globalData.url + 'deleteCart',
      data: {
        mid: app.globalData.userInfo.mid,
        ids: temp
      },
      success: function (res) {
        if (res.data.code == 1) {
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
  },
  // 结算
  toPayOrder: function () {
    wx.showLoading()
    var that = this
    if (this.data.noSelect) {
      wx.hideLoading()
      return
    }
    that.navigateToPayOrder()
  },

  navigateToPayOrder: function () {
    wx.hideLoading()
    wx.navigateTo({
      url: "/pages/to-pay-order/index"
    })
  },
  // 分享
  onShareAppMessage: function (res) {
    return {
      title: '华邦商城',
      path: '/pages/index/index'
    }
  }
})
