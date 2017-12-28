// pages/rating/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    goodsId: '',
    pic: '',
    title: '',
    pics: [],

    stars: [0, 0, 0, 0, 0],
    score: 0,
    lv: ['很差', '一般', '满意', '非常满意', '无可挑剔'],
    tips: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderId = options.orderid
    var goodsId = options.goodsid
    var pic = options.pic
    var title = options.title
    this.setData({
      orderId: orderId,
      goodsId: goodsId,
      pic: pic,
      title: title
    })
  },

  score: function (e) {
    var stars = [0, 0, 0, 0, 0]
    var idx = e.currentTarget.dataset.idx + 1
    for (let i = 0; i < idx; i++) {
      stars[i] = 1
    }
    this.setData({
      stars: stars,
      score: idx,
      tips: this.data.lv[idx - 1]
    })
  },

  chooseImg: function (e) {
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        var pics = []
        var imgs = []
        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: app.globalData.url + 'uploadCommentPic',
            filePath: tempFilePaths[i],
            name: 'file',
            success: (res) => {
              var data = JSON.parse(res.data)
              pics.push(data.path[0])
              imgs.push(data.domain_path[0])
              //do something
              this.setData({
                imgs: imgs,
                pics: pics
              })
            }
          })
        }
      }
    })
  },

  formSubmit: function (e) {
    var rating = e.detail.value.rating
    if (this.data.score == 0) {
      wx.showModal({
        title: '提示！',
        content: '您还没有评分呢',
        showCancel: false
      })
    } else if(rating != '' || this.data.pics.length != 0) {
      wx.request({
        url: app.globalData.url + 'commentOrder',
        data: {
          mid: app.globalData.userInfo.mid,
          order_id: this.data.orderId,
          goods_id: this.data.goodsId,
          pic: this.data.pics.join('||'),
          content: rating,
          score: this.data.score
        },
        method: 'post',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: (res) => {
          if (res.data.code == 1) {
            wx.navigateBack({})
          }
        }
      })
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})