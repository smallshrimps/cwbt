import regeneratorRuntime from '../../utils/runtime.js';
var app = getApp();
var util = require('../../utils/util.js');
var obj = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingStatus: true,
    pickerData: [{ name: '请选择', value: 0 }, { name: '自行维修', value: 1 }, { name: '委外维修', value: 2 } ],
    base_img_url: app.constant.base_img_url,
    photos: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    obj = this;
    var code = options.code; // 扫码识别的code
    var overhaul = options.overhaul; // 维修方式

    // 测试数据
    // code = '121600110200400';
    // overhaul = 0;

    var index = 0;
    if (overhaul == 0) {
      index = 1;
    } else if (overhaul == 1) {
      index = 2;
    }
    
    if (code) {
      obj.setData({
        code: code,
        index: index
      });
    }

    var title = '';
    if (overhaul == 0) {
        title = '自行报审缺陷单';
    } else {
        title = '委外报审申请单';
    }

    wx.setNavigationBarTitle({
      title: title,
    })
    
    

    // 页面初始化
    this.init();
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
   * 页面初始化
   */
  init: () => {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    });
    var url = util.getRequestURL('getWcEquipmentcardByNumber.we');
    wx.request({
      url: url,
      data: {
        number: obj.data.code
      },
      success: function (res) {
        if (res.data) { // 数据请求成功
          obj.setData({
            loadingStatus: false,
            equipment: res.data
          });
          wx.hideLoading();
        } else { // 数据请求失败
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: '该条形码没有对应设备信息！',
            showCancel: false,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          });
        }
      },
      fail: (e) => {
        wx.hideLoading();
        console.log(e);
        util.showTipsMessage('数据加载失败');
      }
    });
  },

  /**
   * 保存表单数据
   */
  saveFormData: (e) => {
    var key = e.currentTarget.dataset.key;
    var value = e.detail.value;
    var data = {};
    data[key] = value;
    obj.setData(data);
  },

  /**
   * 检查表单数据
   */
  checkFormData: function () {
    var data = obj.data;
    
    // 维修方式
    var index = obj.data.index;
    if (index == 0) {
       wx.showModal({
         title: '提示',
         content: '请选择维修方式！',
         showCancel: false
       })
       return false;
    }
    // 存储维修方式
    obj.setData({
      overhaul: index - 1
    });

    // 异常描述
    var remark = data.remark;
    if (!remark) {
      wx.showModal({
        title: '提示',
        content: '请输入异常描述！',
        showCancel: false
      });
      return false;
    }

    // 照片
    var photos = obj.data.photos;
    if (photos.length < 1) {
      wx.showModal({
        title: '提示',
        content: '请将异常部位拍照！',
        showCancel: false,
      })
      return false;
    }

    return true;
  },

  /**
   * 提交(同步)
   */ 
  async execute () {
    // 数据校验
    if (!obj.checkFormData()) {
      return;
    }

    // 等待这一步骤执行完，再进行下面的步骤
    await obj.uploadDou('photos');
    obj.finish();
   
   
  },

  /**
   * 保存临时工作卡数据
   */
  finish: function () {
    var data = obj.data;
    var photos = data.photos;
    var overhaulFunction = data.overhaul == undefined ? data.pickerData[data.index].code : data.overhaul;
    var name = data.equipment.name + '-' + util.getOverhaul(overhaulFunction);
    var param = {
      equipmentId: data.equipment.id,
      name: name,
      exceptionalDescribe: data.remark,
      overhaulFunction: overhaulFunction,
      image: JSON.stringify(photos),
      creator: app.user.id,
      dept_id: app.user.deptId
    }

    // 报审事项
    var applyNote = obj.data.applyNote;
    if (applyNote) {
       param.applyNote = applyNote;
    }

    var url = util.getRequestURL('addTemporaryWorkCard.we');

    // 测试数据
    // console.log('param: ' + JSON.stringify(param));
    // return;

    wx.showLoading({
      title: '正在保存中',
      mask: true
    });

    wx.request({
      url: url,
      data: {
        json: encodeURI(JSON.stringify(param))
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.success) {
          wx.showModal({
            title: '提示',
            content: '保存成功! ',
            showCancel: false,
            complete: function () {
              wx.navigateBack({
                delta: 4
              });
            }
          });
        } else {
          util.tipsMessage('保存失败！');
        }
      },
      fail: function (e) {
        wx.hideLoading();
        console.log(e);
        util.tipsMessage('网络异常！');
      }
    });
  },

 /**
  * 拍照
  */
  photo: (e) => {
    var key = e.currentTarget.dataset.key;
    var photo = {};
    var photos = obj.data[key] || [];
    var dou = {};
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        var timex = util.formatTime(new Date());
        photo.pic_time = timex;
        photo.tempFilePath = res.tempFilePaths[0];
        console.log(res);

        photos.push(photo);
        dou[key] = photos;
        obj.setData(dou);
      },
    })
   
  },


  /**
   * 图片预览
   */
  preview: (e) => {
    util.preview(e);
  },


  /**
   * 删除图片
   */
  deletePic: (e) => {
    var index = e.currentTarget.dataset.index;
    var key = e.currentTarget.dataset.photoskey;
    var photos = obj.data[key] || [];
    photos.splice(index, 1);
    var isPhoto = true;
    if (photos.length == 0) {
      isPhoto = false;
    }
    var dou = {};
    dou[key] = photos;
    obj.setData(dou);

  },

  /**
   * 上传图片（同步）
   */
  uploadPictureDou (tempFilePath) {
  return new Promise(function (resolve, reject) {
    // 开始上传图片
    var reqUrl = app.constant.upload_url;
    wx.uploadFile({
      url: reqUrl,
      filePath: tempFilePath,
      name: 'myfile',
      success: (res) => {
        var res = res.data;
        if (res) {
          res = JSON.parse(res);
        }
        resolve(res)
      },

    })
  });
},

/**
 * 批量上传照片(同步)
 */
async uploadDou (key) {
  var photoList = obj.data[key] || [];
  for (var p = 0; p < photoList.length; p++) {
    var res = await obj.uploadPictureDou(photoList[p].tempFilePath);
    if (res.success) {
       photoList[p].name = res.picture;
       // 删除tempFilePath
       delete photoList[p]['tempFilePath'];
    }
  }

  var dou = {};
  dou[key] = photoList;
  obj.setData(dou);
},


})