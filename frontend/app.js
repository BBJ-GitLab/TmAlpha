// 时间规划器小程序入口
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('时间规划器小程序启动');
    
    // 检查本地存储
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (isLoggedIn) {
      console.log('用户已登录');
    } else {
      console.log('用户未登录');
    }
  },
  
  onShow() {
    // 小程序显示时执行
    console.log('时间规划器小程序显示');
  },
  
  onHide() {
    // 小程序隐藏时执行
    console.log('时间规划器小程序隐藏');
  },
  
  globalData: {
    // 全局数据
    userInfo: null,
    version: '1.0.0'
  }
});