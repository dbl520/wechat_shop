//index.js
var util = require('../../utils/util.js')
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
    totalPrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,

    propertyChildIds: "",
    propertyChildNames: "",
    shopCarInfo: [],
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车

    selectedGoods: {},

    reputation: {}
  },

  onLoad: function (options) {
    var id = options.id
    wx.request({
      url: app.globalData.url + 'goodsDetail',
      data: {
        id: id
      },
      success: (res) => {
        var selectSizeTemp = ""
        if (res.data.attributes) {
          for (var i = 0; i < res.data.attributes.length; i++) {
            selectSizeTemp = selectSizeTemp + " " + res.data.attributes[i].name
          }
          this.setData({
            hasMoreSelect: true,
            selectSize: this.data.selectSize + selectSizeTemp
          })
        }
        this.setData({
          goodsDetail: res.data,
          buyNumMax: res.data.stock,
          buyNumber: (res.data.stock > 0) ? 1 : 0
        })
        WxParse.wxParse('article', 'html', res.data.content, this, 5)
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
      success: (res) => {
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
          reputation: res.data,
          ratings: ratings
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
    this.labelItemTap()
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
        buyNumber: currentNum,
        totalPrice: (this.data.selectedGoods.price * currentNum).toFixed(2)
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber
      currentNum++
      this.setData({
        buyNumber: currentNum,
        totalPrice: (this.data.selectedGoods.price * currentNum).toFixed(2)
      })
    }
  },
  /**
   * 选择商品规格
   */
  labelItemTap: function (e) {
    var goodsDetail = this.data.goodsDetail
    // var goods_id = this.data.goodsDetail.id
    if (e) {
      // goods_id = e.currentTarget.dataset.goodsid
      var propertyindex = e.currentTarget.dataset.propertyindex
      var propertychildindex = e.currentTarget.dataset.propertychildindex
      // 取消该分类下的子栏目所有的选中状态
      var childs = goodsDetail.attributes[propertyindex].attrs
      for (var i = 0; i < childs.length; i++) {
        goodsDetail.attributes[propertyindex].attrs[i].class = ''
      }
      // 设置当前选中状态
      goodsDetail.attributes[propertyindex].attrs[propertychildindex].class = 'current'
      this.setData({
        goodsDetail: goodsDetail
      })
    }
    // 获取所有的选中属性
    var attrs = {}
    var temp = ''
    for (var i = 0; i < goodsDetail.attributes.length; i++) {
      childs = goodsDetail.attributes[i].attrs
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].class) {
          var tid = goodsDetail.attributes[i].id
          attrs[tid] = Number(childs[j].id)
        }
      }
    }
    console.log(attrs)
    wx.request({
      url: app.globalData.url + 'checkAttrs',
      data: {
        mark: this.data.goodsDetail.mark,
        goods_id: this.data.goodsDetail.goods_id,
        attrs: attrs
      },
      success: (res) => {
        if (res.data) {
          this.setData({
            totalPrice: res.data.price,
            selectedGoods: res.data
          })
        }
      }
    })
  },

  /**
  * 加入购物车
  */
  addShopCar: function () {
    var _this = this
    if (app.globalData.userInfo) {
      wx.request({
        url: app.globalData.url + 'add2Cart',
        data: {
          id: this.data.selectedGoods.id,
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
          id: this.data.selectedGoods.id,
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
      goods_id: this.data.selectedGoods.id,
      goods_num: this.data.buyNumber,
      goods: {
        title: this.data.selectedGoods.title,
        pic: this.data.selectedGoods.pic,
        price: this.data.selectedGoods.price,
        stock: this.data.selectedGoods.stock
        // dateline: this.data.goodsDetail.dateline
      }
    }
    var shopCarInfo = this.data.shopCarInfo

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
      goods_id: this.data.selectedGoods.id,
      goods_num: this.data.buyNumber,
      goods: {
        pic: this.data.selectedGoods.pic,
        title: this.data.selectedGoods.title,
        price: this.data.selectedGoods.price
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
