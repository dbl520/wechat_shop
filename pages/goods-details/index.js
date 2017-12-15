//index.js
//获取应用实例
var app = getApp()
var WxParse = require('../../wxParse/wxParse.js')

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,

    goodsDetail: {},
    hasMoreSelect: false,
    selectSize: "选择：",
    selectSizePrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,

    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: [],
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车

    reputation: {}
  },

  onLoad: function (options) {
    var id = options.id
    var that = this
    wx.request({
      url: app.globalData.url + 'goodsDetail',
      data: {
        id: id
      },
      success: function (res) {
        var selectSizeTemp = ""
        if (res.data.attributes) {
          for (var i = 0; i < res.data.attributes.length; i++) {
            selectSizeTemp = selectSizeTemp + " " + res.data.attributes[i].name
          }
          that.setData({
            hasMoreSelect: true,
            selectSize: that.data.selectSize + selectSizeTemp,
            selectSizePrice: res.data.price,
          })
        }

        // that.data.goodsDetail = res.data

        that.setData({
          goodsDetail: res.data,
          selectSizePrice: res.data.price,
          buyNumMax: res.data.stock,
          buyNumber: (res.data.stock > 0) ? 1 : 0
        })
        WxParse.wxParse('article', 'html', res.data.content, that, 5)
      }
    })
    // 获取评论
    wx.request({
      url: app.globalData.url + 'goodsComments',
      data: {
        goods_id: id,
        pagesize: 3,
        page: 1
      },
      success: function (res) {
        that.setData({
          reputation: res.data
        })
      }
    })

  },
  onMoreRatingTap: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/more-rating/index?id=' + id
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
  goShopCar: function () {
    wx.switchTab({
      url: "/pages/shopcart/index"
    })
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap()
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    })
    this.bindGuiGeTap()
  },

  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber
      currentNum--
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber
      currentNum++
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  /**
   * 选择商品规格
   */
  // labelItemTap: function (e) {
  //   var that = this
  //   // 取消该分类下的子栏目所有的选中状态
  //   var childs = that.data.goodsDetail.attributes[e.currentTarget.dataset.propertyindex].attrs
  //   for (var i = 0; i < childs.length; i++) {
  //     that.data.goodsDetail.attributes[e.currentTarget.dataset.propertyindex].attrs[i].active = false
  //   }
  //   // 设置当前选中状态
  //   that.data.goodsDetail.attributes[e.currentTarget.dataset.propertyindex].attrs[e.currentTarget.dataset.propertychildindex].active = true
  //   // 获取所有的选中规格尺寸数据
  //   var needSelectNum = that.data.goodsDetail.attributes.length
  //   var curSelectNum = 0
  //   var propertyChildIds = ""
  //   var propertyChildNames = ""
  //   for (var i = 0; i < that.data.goodsDetail.attributes.length; i++) {
  //     childs = that.data.goodsDetail.attributes[i].attrs
  //     for (var j = 0; j < childs.length; j++) {
  //       if (childs[j].active) {
  //         curSelectNum++
  //         propertyChildIds = propertyChildIds + that.data.goodsDetail.attributes[i].id + ":" + childs[j].id + ","
  //         propertyChildNames = propertyChildNames + that.data.goodsDetail.attributes[i].name + ":" + childs[j].name + "  "
  //       }
  //     }
  //   }

  /**
  * 加入购物车
  */
  addShopCar: function () {
    var _this = this
    if (app.globalData.userInfo) {
      wx.request({
        url: app.globalData.url + 'add2Cart',
        data: {
          id: this.data.goodsDetail.id,
          shop_num: this.data.buyNumber,
          mid: app.globalData.userInfo.mid
        },
        success: function (res) {
          if (res.data.code == 3) {
            _this.setData({
              hideShopPopup: true
            })
            wx.showToast({
              title: '加入购物车成功',
              icon: 'success',
              duration: 2000
            })

            // 获取购物车数据
            var shopCarInfo = wx.getStorageSync('shopCarInfo')
            // var list = shopCarInfo.shopList
            if (shopCarInfo && shopCarInfo.shopList) {
              _this.setData({
                shopCarInfo: shopCarInfo
              })
            }
            //组建购物车
            var shopCarInfo = _this.bulidShopCarInfo()
            
            // this.setData({
            //   shopCarInfo: shopCarInfo
            // })
            // 写入本地存储
            wx.setStorage({
              key: "shopCarInfo",
              data: shopCarInfo
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '登录提示',
        content: '登录后再来看看看吧',
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

  // 立即购买
  buyNow: function () {
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0！',
        showCancel: false
      })
      return
    }
    if (app.globalData.userInfo) {
      wx.request({
        url: app.globalData.url + 'add2Cart',
        data: {
          id: this.data.goodsDetail.id,
          shop_num: this.data.buyNumber,
          mid: app.globalData.userInfo.mid
        },
        success: (res) => {
          this.setData({
            hideShopPopup: true
          })
          //组建立即购买信息
          var buyNowInfo = this.buliduBuyNowInfo()
          // 写入本地存储
          wx.setStorage({
            key: "buyNowInfo",
            data: buyNowInfo
          })
          this.closePopupTap()
          wx.navigateTo({
            url: "/pages/to-pay-order/index?orderType=buyNow"
          })
        }
      })
    } else {
      wx.showModal({
        title: '登录提示',
        content: '登录后再来看看吧',
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


  // 组建购物车信息
  bulidShopCarInfo: function () {
    // 加入购物车
    var shopCarMap = {}
    shopCarMap.shopList = {
      active: false,
      user_id: app.globalData.userInfo.mid,
      goods_id: this.data.goodsDetail.id,
      goods_num: this.data.buyNumber,
      goods: {
        title: this.data.goodsDetail.title,
        pic: this.data.goodsDetail.pic,
        price: this.data.goodsDetail.price,
        stock: this.data.goodsDetail.stock,
        dateline: this.data.goodsDetail.dateline
      }
    }
    var shopCarInfo = this.data.shopCarInfo

    // if (!shopCarInfo.shopNum) {
    //   shopCarInfo.shopNum = 0
    // }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = []
    }
    var hasSameGoodsIndex = -1
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i]
      if (tmpShopCarMap.goods_id == shopCarMap.shopList.goods_id) {
        hasSameGoodsIndex = i
        shopCarMap.shopList.active = tmpShopCarMap.active
        shopCarMap.shopList.goods_num = parseInt(shopCarMap.shopList.goods_num) + parseInt(tmpShopCarMap.goods_num)
        break
      }
    }

    // shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap.shopList)
    } else {
      shopCarInfo.shopList.push(shopCarMap.shopList)
    }
    return shopCarInfo
  },

  // 组建立即购买信息	
  buliduBuyNowInfo: function () {
    var shopCarMap = {}
    shopCarMap.shopList = [{
      goods_id: this.data.goodsDetail.id,
      goods_num: this.data.buyNumber,
      goods: {
        pic: this.data.goodsDetail.pic,
        title: this.data.goodsDetail.title,
        price: this.data.goodsDetail.price
      }
    }]
    var buyNowInfo = shopCarMap
    return buyNowInfo
  },
  onShareAppMessage: function () {
    return {
      title: this.data.goodsDetail.title,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.id,
    }
  }
})
