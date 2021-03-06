App({
  onLaunch: function () {
   
    // 更新代码
    const updateManager = wx.getUpdateManager();

    // 检查新版本
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
    })
    
    // 新版本下载完成
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      })
    })

    // 新版本下载失败
    updateManager.onUpdateFailed(function () {

    })



    // 初始化用户
    this.user = {};

    // 查看缓存中是否有用户信息
    if (wx.getStorageSync('user')) {
      this.user = wx.getStorageSync('user');
    }

    // 开发模式添加默认用户
    if (this.constant.isDev) {
       this.user = { id: 1316, deptId: 216, userPriv: 4, name: 'hua' };
			//  this.user = { id: 1317, deptId: 216, userPriv: 4, name: 'hua' };
      //  this.user = { id: 1318, deptId: 21, userPriv: 4, name: 'hua' };
      // this.user = {};

    }

    
    
  },

  /**
   * 常量
   */
  constant: {
    isDev: true,
    base_img_url: 'https://cwbt.castlc.cn/picture',
    base_domain:'https://cwbt.castlc.cn/',
    base_forward_url: 'https://cwbt.castlc.cn/cwbt/test/login',
    base_req_url: 'http://cwbt.castlc.cn/cwbt/api/cwbtMP/',
    upload_url: 'https://cwbt.castlc.cn/cwbt/api/cwbtMP/uploadFile',
    download_url: 'https://cwbt.castlc.cn/file/',
    logo: 'https://cwbt.castlc.cn/picture/shipLogo123.jpg',
    base_img_url_backup: 'https://fish.ecartoon.com.cn/picture',
    base_req_url_backup: 'http://192.168.0.176:8080/cwbt/api/cwbtMP/',
    base_req_url_backup_1: 'https://cwbt.castlc.cn/cwbt/test/login?url=http://47.92.101.196:8080/cwbt/api/cwbtMP/',
    upload_url_backup: 'https://fish.ecartoon.com.cn/uploadFile',
    download_url_backup: 'https://cwbt.castlc.cn/file/',
  },

  /**
   * 分页对象
   */
  pageInfo: {
    currentPage: 1,
    pageSize: 20
  }
})