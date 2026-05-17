import Toast from 'tdesign-miniprogram/toast';
import { loginByPassword } from '../../services/auth';

Page({
  data: { statusBarHeight: 20, username: '', password: '', loading: false },

  onLoad() {
    const app = getApp<IAppOption>();
    if (app && app.globalData) {
      this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 });
    }
    if (wx.getStorageSync('token')) wx.switchTab({ url: '/pages/home/home' });
  },

  onUsernameChange(e: any) { this.setData({ username: e.detail.value }); },
  onPasswordChange(e: any) { this.setData({ password: e.detail.value }); },

  async handleLogin() {
    const { username, password } = this.data;
    if (!username.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入用户名', theme: 'warning' }); return;
    }
    if (!password.trim()) {
      Toast({ context: this, selector: '#t-toast', message: '请输入密码', theme: 'warning' }); return;
    }

    this.setData({ loading: true });
    try {
      const result = await loginByPassword(username, password);
      const app = getApp<IAppOption>();
      if (app && app.login) {
        app.login(result.token, result.user);
      }
      Toast({ context: this, selector: '#t-toast', message: '登录成功', theme: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 800);
    } catch (err: any) {
      Toast({ context: this, selector: '#t-toast', message: err.message, theme: 'error' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
