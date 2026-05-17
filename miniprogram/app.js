"use strict";
App({
    globalData: {
        userInfo: null,
        token: '',
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
        // TDesign图标字体加载 - 小程序本地字体需要使用 package:// 前缀
        wx.loadFontFace({
            family: 't',
            source: 'package://miniprogram/assets/fonts/t.ttf',
            success: () => console.log('[Font] TDesign icon font loaded'),
            fail: (err) => {
                console.warn('[Font] Font load failed:', err);
                // 尝试woff格式
                wx.loadFontFace({
                    family: 't',
                    source: 'package://miniprogram/assets/fonts/t.woff',
                    success: () => console.log('[Font] TDesign icon font loaded (woff)'),
                    fail: (e) => console.error('[Font] Font loading failed:', e),
                });
            },
        });
    },
    onShow() {
        const token = wx.getStorageSync('token');
        if (!token) {
            wx.redirectTo({ url: '/pages/login/login' });
        }
    },
    onHide() { },
    login(token, userInfo) {
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
