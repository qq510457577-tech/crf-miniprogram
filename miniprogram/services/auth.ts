// 认证服务
const API_BASE = 'https://zhongyibianzhengdafen.fun/CRF';

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

/** 用户名密码登录（tRPC 接口） */
export function loginByPassword(username: string, password: string): Promise<LoginResult> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/trpc/crf.auth.login`,
      method: 'POST',
      data: { json: { username, password } },
      header: { 'Content-Type': 'application/json' },
      timeout: 30000,
      success(res) {
        const data = (res.data as any) || {};
        if (res.statusCode === 200 && data.result) {
          // tRPC 响应格式: { result: { data: { json: { token, user } } } }
          const resultData = (data.result && data.result.data && data.result.data.json) || {};
          const { token, user: rawUser } = resultData;
          if (!token) {
            reject(new Error('登录响应异常：未返回 token'));
            return;
          }
          const user = {
            id: rawUser?.id || 0,
            name: rawUser?.displayName || rawUser?.username || username,
            username: rawUser?.username || username,
            role: rawUser?.role || '',
          };
          wx.setStorageSync('token', token);
          wx.setStorageSync('userInfo', user);
          resolve({ token, user });
        } else {
          const errMsg = data.error?.message || data.error || '登录失败，请检查用户名和密码';
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
export function getCurrentUser() {
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  if (!token) return Promise.resolve(null);
  if (userInfo) return Promise.resolve(userInfo);

  return new Promise((resolve) => {
    wx.request({
      url: `${API_BASE}/trpc/crf.auth.me`,
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
