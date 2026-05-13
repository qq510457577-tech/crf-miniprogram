"use strict";
// 认证服务
// 后端地址: https://zhongyibianzhengdafen.fun:8000/CRF
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginByPassword = loginByPassword;
exports.getCurrentUser = getCurrentUser;
const API_BASE = 'https://zhongyibianzhengdafen.fun:8000/CRF';
/** 用户名密码登录 */
function loginByPassword(username, password) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${API_BASE}/api/auth/local/login`,
            method: 'POST',
            data: { username, password },
            header: { 'Content-Type': 'application/json' },
            timeout: 30000,
            success(res) {
                const data = res.data || {};
                if (res.statusCode === 200 && data.success) {
                    // 后端返回格式: { success: true, user: {...} }
                    // 使用一个模拟 token（基于用户ID和角色）
                    const user = data.user || { id: 0, username };
                    const mockToken = 'mock_' + user.id + '_' + Date.now();
                    // 存储用户信息
                    wx.setStorageSync('token', mockToken);
                    wx.setStorageSync('userInfo', user);
                    resolve({ token: mockToken, user });
                }
                else if (data.error) {
                    reject(new Error(data.error));
                }
                else {
                    reject(new Error(data.message || '登录失败，请检查用户名和密码'));
                }
            },
            fail: (err) => {
                const errMsg = (err && err.errMsg) || '';
                if (errMsg.indexOf('ssl') !== -1 || errMsg.indexOf('certificate') !== -1) {
                    reject(new Error('SSL证书验证失败，请在开发者工具中开启"不校验合法域名"'));
                } else {
                    reject(new Error('网络请求失败，请检查网络连接'));
                }
            },
        });
    });
}
/** 获取当前用户 */
function getCurrentUser() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (!token)
        return Promise.resolve(null);
    // 如果有本地存储的用户信息，直接返回
    if (userInfo) {
        return Promise.resolve(userInfo);
    }
    return new Promise((resolve) => {
        wx.request({
            url: `${API_BASE}/api/trpc/auth.me`,
            method: 'GET',
            header: { Authorization: `Bearer ${token}` },
            timeout: 10000,
            success(res) {
                resolve(((res.data && res.data.result && res.data.result.data) || null));
            },
            fail: () => resolve(null),
        });
    });
}
