var app = getApp();
var util = require('../../utils/util.js');
var obj = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_img_url: app.constant.base_img_url + "/",
    overhaul_function: ["自行维修", "委外维修"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    obj = this;

    if (options.id) {
      obj.data.id = options.id;
    }
    
    var type = options.type;
    if (type) {
      obj.setData({
        type: type
      });
    }
    var title = '';
    // 自行
    if (type == 0) {
       title = '自行维修完成情况';
    }

    // 委外
    if (type == 1) {
       title = '委外维修完成情况';
    }

    wx.setNavigationBarTitle({
      title: title,
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
    this.getTempFeedback();
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
   * 查询临时工作卡反馈数据
   */
  getTempFeedback: function () {
    var url = util.getRequestURL('getTempWorkcardFeedback.we');
    // loading
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: url,
      data: {
        workcardId: obj.data.id
      },
      
      success: function (res) {
        if (res.data.image1) {
          res.data.image1 = JSON.parse(res.data.image1);
        }
        if (res.data.image2) {
          res.data.image2 = JSON.parse(res.data.image2);
        }
        obj.setData({
          feedback: res.data
        });
      },
      fail: function (e) {
        util.tipsMessage('网络异常！');
        console.log(e);
      },
      complete: function (com) {
        wx.hideLoading();
      }
    });
  },

  /**
   * 图片预览
   */
  preview: (e) => {
    util.preview(e);
  },

  /**
   * 验收
   */
  valid: function () {
    wx.showLoading({
      title: '处理中',
      mark: true
    });
    var url = util.getRequestURL('updateWorkFeedBackStatus.we');
    var param = { id: obj.data.feedback.id, confirm_id: app.user.id, status: 2 };
    wx.request({
      url: url,
      data: {
        json: encodeURI(JSON.stringify(param))
      },
      success: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '操作成功！',
          showCancel: false,
          complete: function () {
            wx.navigateBack({
              delta: 1
            });
          }
        });
      },
      fail: function (e) {
        wx.hideLoading();
        util.tipsMessage('网络异常！');
        console.log(e);
      }
    });
  }
})