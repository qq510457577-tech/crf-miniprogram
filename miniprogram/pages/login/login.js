"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toast_1 = __importDefault(require("tdesign-miniprogram/toast"));
const auth_1 = require("../../services/auth");
Page({
    data: { statusBarHeight: 20, username: '', password: '', loading: false },
    onLoad() {
        const app = getApp();
        this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 });
        if (wx.getStorageSync('token'))
            wx.switchTab({ url: '/pages/home/home' });
    },
    onUsernameChange(e) { this.setData({ username: e.detail.value }); },
    onPasswordChange(e) { this.setData({ password: e.detail.value }); },
    async handleLogin() {
        const { username, password } = this.data;
        if (!username.trim()) {
            (0, toast_1.default)({ context: this, selector: '#t-toast', message: '请输入用户名', theme: 'warning' });
            return;
        }
        if (!password.trim()) {
            (0, toast_1.default)({ context: this, selector: '#t-toast', message: '请输入密码', theme: 'warning' });
            return;
        }
        this.setData({ loading: true });
        try {
            const result = await (0, auth_1.loginByPassword)(username, password);
            const app = getApp();
            app.login(result.token, result.user);
            (0, toast_1.default)({ context: this, selector: '#t-toast', message: '登录成功', theme: 'success' });
            setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 800);
        }
        catch (err) {
            (0, toast_1.default)({ context: this, selector: '#t-toast', message: err.message, theme: 'error' });
        }
        finally {
            this.setData({ loading: false });
        }
    },
});
