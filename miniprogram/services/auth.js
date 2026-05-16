"use strict";
// 认证服务（tRPC 接口）
// 后端地址: https://zhongyibianzhengdafen.fun/CRF
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginByPassword = loginByPassword;
exports.getCurrentUser = getCurrentUser;
const API_BASE = 'https://zhongyibianzhengdafen.fun/CRF';
/** 用户名密码登录（tRPC 接口） */
function loginByPassword(username, password) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${API_BASE}/trpc/crf.auth.login`,
            method: 'POST',
            data: { json: { username, password } },
            header: { 'Content-Type': 'application/json' },
            timeout: 30000,
            success(res) {
                const data = res.data || {};
                if (res.statusCode === 200 && data.result) {
                    const resultData = (data.result && data.result.data && data.result.data.json) || {};
                    const { token, user: rawUser } = resultData;
                    if (!token) {
                        reject(new Error('登录响应异常：未返回 token'));
                        return;
                    }
                    const user = {
                        id: (rawUser && rawUser.id) || 0,
                        name: (rawUser && (rawUser.displayName || rawUser.username)) || username,
                        username: (rawUser && rawUser.username) || username,
                        role: (rawUser && rawUser.role) || '',
                    };
                    wx.setStorageSync('token', token);
                    wx.setStorageSync('userInfo', user);
                    resolve({ token, user });
                } else {
                    const errMsg = (data.error && data.error.message) || data.error || '登录失败，请检查用户名和密码';
                    reject(new Error(errMsg));
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
            url: `${API_BASE}/trpc/crf.auth.me`,
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
