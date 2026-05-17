App<IAppOption>({
  globalData: {
    userInfo: null as any,
    token: '' as string,
    isLoggedIn: false,
    apiBase: 'https://zhongyibianzhengdafen.fun/CRF',
    statusBarHeight: 0,
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
    }
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20;

    // 加载 TDesign 图标字体
    wx.loadFontFace({
      family: 't',
      source: 'url("/assets/fonts/t.woff")',
      success: () => console.log('[Font] TDesign icon font loaded'),
      fail: (err) => console.error('[Font] TDesign icon font failed:', err),
    });
  },

  onShow() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({ url: '/pages/login/login' });
    }
  },

  onHide() {},

  login(token: string, userInfo: any) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', userInfo);
  },

  logout() {
    this.globalData.token = '';
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.redirectTo({ url: '/pages/login/login' });
  },
});
