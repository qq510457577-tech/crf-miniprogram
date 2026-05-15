// 认证服务
// 后端地址: https://zhongyibianzhengdafen.fun/CRF

const API_BASE = 'https://zhongyibianzhengdafen.fun/CRF';

export interface LoginResult {
  token: string;
  user: {
    id: number;
    username: string;
    displayName?: string;
    email?: string;
    role?: string;
  };
}

/** 用户名密码登录 */
export function loginByPassword(username: string, password: string): Promise<LoginResult> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/api/auth/local/login`,
      method: 'POST',
      data: { username, password },
      header: { 'Content-Type': 'application/json' },
      timeout: 30000,
      success(res) {
        const data = (res.data as any) || {};
        if (res.statusCode === 200 && data.success) {
          // 后端返回格式: { success: true, token: "...", user: { id, name, role } }
          // 兼容不同 user 字段名
          const rawUser = data.user || { id: 0, username };
          const user = {
            id: rawUser.id,
            name: rawUser.name || rawUser.displayName || rawUser.username || username,
            username: rawUser.username || username,
            role: rawUser.role || '',
          };
          const token = data.token;
          wx.setStorageSync('token', token);
          wx.setStorageSync('userInfo', user);
          resolve({ token, user });
        } else if (data.error) {
          reject(new Error(data.error));
        } else {
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
export function getCurrentUser() {
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  if (!token) return Promise.resolve(null);
  if (userInfo) return Promise.resolve(userInfo);

  return new Promise((resolve) => {
    wx.request({
      url: `${API_BASE}/api/trpc/auth.me`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` },
      timeout: 10000,
      success(res) {
        const resData = res.data as any;
        resolve(((resData && resData.result && resData.result.data) || null));
      },
      fail: () => resolve(null),
    });
  });
}
