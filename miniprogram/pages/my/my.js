"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 个人中心页面
const toast_1 = __importDefault(require("tdesign-miniprogram/toast"));
const dialog_1 = __importDefault(require("tdesign-miniprogram/dialog"));
Page({
    data: {
        userInfo: {
            name: '',
            avatar: '',
            role: '',
            department: '中山大学肿瘤防治中心',
        },
        version: '1.0.0',
        cacheSize: '0 KB',
        showAbout: false,
        showLogoutConfirm: false,
    },
    onLoad() {
        this.loadUserInfo();
        this.calculateCacheSize();
    },
    onShow() {
        this.loadUserInfo();
    },
    loadUserInfo() {
        const app = getApp();
        const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo') || {};
        this.setData({
            userInfo: {
                name: userInfo.name || userInfo.username || '研究者',
                avatar: userInfo.avatar || '',
                role: userInfo.role || '研究者',
                department: userInfo.department || '中山大学肿瘤防治中心',
            },
        });
    },
    calculateCacheSize() {
        try {
            const fs = wx.getFileSystemManager();
            // 估算缓存大小（实际可能需要异步计算）
            const info = wx.getStorageInfoSync();
            const sizeKB = (info.currentSize / 1024).toFixed(1);
            const sizeStr = parseFloat(sizeKB) >= 1024
                ? `${(parseFloat(sizeKB) / 1024).toFixed(1)} MB`
                : `${sizeKB} KB`;
            this.setData({ cacheSize: sizeStr });
        }
        catch (err) {
            this.setData({ cacheSize: '未知' });
        }
    },
    onBack() {
        wx.navigateBack();
    },
    onNavigate(e) {
        const { url } = e.currentTarget.dataset;
        wx.switchTab({ url });
    },
    onClearCache() {
        dialog_1.default.confirm({
            title: '确认清除',
            content: '确定要清除本地缓存数据吗？',
            confirmBtn: '清除',
        }).then(async (res) => {
            if (res.confirm) {
                try {
                    // 先保存登录凭证
                    const token = wx.getStorageSync('token');
                    const userInfo = wx.getStorageSync('userInfo');
                    // 清除 Storage
                    wx.clearStorageSync();
                    // 恢复登录状态（不清除用户身份）
                    if (token) {
                        wx.setStorageSync('token', token);
                        wx.setStorageSync('userInfo', userInfo);
                    }
                    (0, toast_1.default)({ message: '缓存已清除', theme: 'success' });
                    this.calculateCacheSize();
                }
                catch (err) {
                    (0, toast_1.default)({ message: '清除失败', theme: 'error' });
                }
            }
        });
    },
    onCheckUpdate() {
        (0, toast_1.default)({ message: '已是最新版本', theme: 'success' });
    },
    onChangePassword() {
        (0, toast_1.default)({ message: '功能开发中', theme: 'warning' });
    },
    onShowAbout() {
        this.setData({ showAbout: true });
    },
    onCloseAbout() {
        this.setData({ showAbout: false });
    },
    onLogout() {
        this.setData({ showLogoutConfirm: true });
    },
    onConfirmLogout() {
        this.setData({ showLogoutConfirm: false });
        const app = getApp();
        app.logout();
        (0, toast_1.default)({ message: '已退出登录', theme: 'success' });
        setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/login' });
        }, 1500);
    },
    onCancelLogout() {
        this.setData({ showLogoutConfirm: false });
    },
});
