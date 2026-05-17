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
        const systemInfo = wx.getDeviceInfo();
        const windowInfo = wx.getWindowInfo();
        this.globalData.statusBarHeight = windowInfo.statusBarHeight || systemInfo.statusBarHeight || 20;

        const token = wx.getStorageSync('token');
        const userInfo = wx.getStorageSync('userInfo');
        if (token && userInfo) {
            this.globalData.token = token;
            this.globalData.userInfo = userInfo;
            this.globalData.isLoggedIn = true;
        }
    },
    onShow() {
        // 不再此处做页面跳转，避免 appLaunch with non-empty page stack 错误
        // 未登录检查由各页面自行处理
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
