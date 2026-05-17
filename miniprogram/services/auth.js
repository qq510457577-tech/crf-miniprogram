"use strict";
// 认证服务
// 后端地址: https://zhongyibianzhengdafen.fun/CRF
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginByPassword = loginByPassword;
exports.getCurrentUser = getCurrentUser;
const API_BASE = 'https://zhongyibianzhengdafen.fun/CRF';
// 调试日志
function log(tag, ...args) {
    console.log(`[Auth-${tag}]`, ...args);
}
function logError(tag, ...args) {
    console.error(`[Auth-${tag}]`, ...args);
}
/** 用户名密码登录（REST 接口: /api/auth/local/login） */
function loginByPassword(username, password) {
    return new Promise((resolve, reject) => {
        log('Login-Start', { username });
        wx.request({
            url: `${API_BASE}/api/auth/local/login`,
            method: 'POST',
            data: { username, password },
            header: { 'Content-Type': 'application/json' },
            timeout: 60000, // 延长到60秒
            success(res) {
                log('Login-Success', { status: res.statusCode });
                const data = res.data || {};
                if (res.statusCode === 200 && data.success) {
                    const rawUser = data.user || { id: 0, username };
                    const user = {
                        id: rawUser.id || 0,
                        name: rawUser.name || rawUser.displayName || rawUser.username || username,
                        username: rawUser.username || username,
                        role: rawUser.role || '',
                    };
                    const token = data.token;
                    wx.setStorageSync('token', token);
                    wx.setStorageSync('userInfo', user);
                    resolve({ token, user });
                }
                else {
                    const errMsg = data.error || '登录失败，请检查用户名和密码';
                    logError('Login-Fail', { status: res.statusCode, error: errMsg });
                    reject(new Error(errMsg));
                }
            },
            fail: (err) => {
                logError('Login-Error', err);
                const errMsg = (err && err.errMsg) || '';
                if (errMsg.indexOf('ssl') !== -1 || errMsg.indexOf('certificate') !== -1) {
                    reject(new Error('SSL证书验证失败，请在开发者工具中开启"不校验合法域名"'));
                }
                else {
                    reject(new Error(`登录请求失败: ${errMsg || '网络超时'}`));
                }
            },
        });
    });
}
/** 获取当前用户 */
function getCurrentUser() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (!token) {
        log('GetCurrentUser', 'no token');
        return Promise.resolve(null);
    }
    if (userInfo) {
        log('GetCurrentUser', 'from cache');
        return Promise.resolve(userInfo);
    }
    return new Promise((resolve) => {
        log('GetCurrentUser', 'fetching from server');
        wx.request({
            url: `${API_BASE}/api/trpc/auth.me`,
            method: 'GET',
            header: { Authorization: `Bearer ${token}` },
            timeout: 30000, // 延长到30秒
            success(res) {
                log('GetCurrentUser-Success', { status: res.statusCode });
                const resData = res.data;
                resolve(((resData && resData.result && resData.result.data) || null));
            },
            fail: (err) => {
                logError('GetCurrentUser-Fail', err);
                resolve(null);
            },
        });
    });
}
