// pages/add-addr/add-addr.js
var address = require('../../utils/cityData.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    isVisible: false,
    animationData: {},
    animationAddressMenu: {},
    addressMenuIsShow: false,
    value: [0, 0, 0],
    provinces: [],
    citys: [],
    areas: [],
    
    selProvince: '省',
    selCity: '市',
    selDistrict: '区/县',

    addressData: {},
    editType: ''
  },

  onLoad: function (e) {
    // 初始化动画变量
    var animation = wx.createAnimation({
      duration: 500,
      transformOrigin: "50% 50%",
      timingFunction: 'ease',
    })
    this.animation = animation
    this.initAddress()

    var that = this
    var id = e.id
    if (e.editType) {
      this.setData({
        editType: e.editType
      })
    }
    if (id) {
      // 初始化原数据
      wx.showLoading()
      wx.request({
        url: app.globalData.url + 'listAddress',
        data: {
          mid: app.globalData.userInfo.mid
        },
        success: function (res) {
          wx.hideLoading()
          that.setData({
            id: id,
            addressData: res.data[id],
            selProvince: res.data[id].province,
            selCity: res.data[id].city,
            selDistrict: res.data[id].area
          })
        }
      })
    }
  },

  // 初始化地址选择器
  initAddress: function () {
    var id = address.provinces[0].id
    this.setData({
      provinces: address.provinces,
      citys: address.citys[id],
      areas: address.areas[address.citys[id][0].id],
    })
  },
  // 点击所在地区弹出选择框
  selectDistrict: function (e) {
    if (this.data.value[0] == 0 && this.data.value[1] == 0 && this.data.value[2] == 0){
      this.setData({
        selProvince: '北京市',
        selCity: '市辖区',
        selDistrict: '东城区'
      })
    }
    
    var that = this
    if (that.data.addressMenuIsShow) {
      return
    }
    that.startAddressAnimation(true)
  },
  // 执行动画
  startAddressAnimation: function (isShow) {
    var that = this
    if (isShow) {
      that.animation.translateY(0).step()
    } else {
      that.animation.translateY(100 + '%').step()
    }
    that.setData({
      animationAddressMenu: that.animation.export(),
      addressMenuIsShow: isShow,
    })
  },
  // 取消
  cityCancel: function (e) {
    this.startAddressAnimation(false)
  },
  hideCitySelected: function (e) {
    this.startAddressAnimation(false)
  },
  // 处理省市县联动逻辑
  cityChange: function (e) {
    var val = e.detail.value
    var provinces = this.data.provinces
    var citys = this.data.citys
    var areas = this.data.areas

    if (this.data.value[0] != val[0]) {
      val[1] = 0
      val[2] = 0
      var id = provinces[val[0]].id
      this.setData({
        value: [val[0], 0, 0],
        citys: address.citys[id],
        areas: address.areas[address.citys[id][0].id]
      })
    } else if (this.data.value[1] != val[1]) {
      val[2] = 0
      var id = citys[val[1]].id
      this.setData({
        value: [val[0], val[1], 0],
        areas: address.areas[citys[val[1]].id]
      })
    }

    this.setData({
      value: [val[0], val[1], val[2]],
      selProvince: this.data.provinces[val[0]].name,
      selCity: this.data.citys[val[1]].name,
      selDistrict: this.data.areas[val[2]].name
    })
  },

  onShow: function () {
    this.setNavigationBarTitle()
  },

  setNavigationBarTitle: function () {
    var title = ''
    if (this.data.editType) {
      title = '编辑地址'
    } else {
      title = '添加地址'
    }
    wx.setNavigationBarTitle({
      title: title
    })
  },

  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function (e) {
    var that = this
    var linkMan = e.detail.value.linkMan
    var address = e.detail.value.address
    var mobile = e.detail.value.mobile
    // var code = e.detail.value.code

    if (linkMan == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
    if (mobile == "" || mobile.length < 11) {
        wx.showModal({
          title: '提示',
          content: '请填写正确的手机号码',
          showCancel: false
        })
      return
    }
    if (this.data.selProvince == "省") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    
    if (address == "") {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel: false
      })
      return
    }
    // if (code == "") {
    //   wx.showModal({
    //     title: '提示',
    //     content: '请填写邮编',
    //     showCancel: false
    //   })
    //   return
    // }

    if (this.data.editType == 'upData') {
      var addr = this.data.addressData
      var postData = {
        mid: app.globalData.userInfo.mid,
        id: addr.id,
        name: linkMan,
        tel: mobile,
        province: this.data.selProvince,
        city: this.data.selCity,
        area: this.data.selDistrict,
        address: address,
        status: addr.status
      }

      wx.request({
        url: app.globalData.url + 'eidtAddress',
        data: postData,
        success: (res) => {
          if (res.data.code == 1) {
            wx.navigateBack({})
          }
        }
      })
    } else {
      wx.request({
        url: app.globalData.url + 'addAddress',
        data: {
          mid: app.globalData.userInfo.mid,
          name: linkMan,
          tel: mobile,
          province: this.data.selProvince,
          city: this.data.selCity,
          area: this.data.selDistrict,
          address: address
        },
        success: function (res) {
          if (res.data.code != 1) {
            // 登录错误 
            wx.hideLoading()
            wx.showModal({
              title: '失败',
              content: res.data.msg,
              showCancel: false
            })
            return
          }
          // 跳转到结算页面
          wx.navigateBack({})
        }
      })
    }
  },

  deleteAddress: function (e) {
    var that = this
    var id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.url + 'delAddress',
            data: {
              id: id
            },
            success: (res) => {
              if (res.code != 0) {
                wx.navigateBack({})
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})
