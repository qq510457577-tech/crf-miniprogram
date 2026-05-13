// 个人中心页面
import Toast from 'tdesign-miniprogram/toast';
import Dialog from 'tdesign-miniprogram/dialog';

interface MyPageData {
  userInfo: {
    name: string;
    avatar: string;
    role: string;
    department: string;
  };
  version: string;
  cacheSize: string;
  showAbout: boolean;
  showLogoutConfirm: boolean;
}

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
  } as MyPageData,

  onLoad() {
    this.loadUserInfo();
    this.calculateCacheSize();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const app = getApp<IAppOption>();
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
    } catch (err) {
      this.setData({ cacheSize: '未知' });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onNavigate(e: any) {
    const { url } = e.currentTarget.dataset;
    wx.switchTab({ url });
  },

  onClearCache() {
    Dialog.confirm({
      title: '确认清除',
      content: '确定要清除本地缓存数据吗？',
      confirmBtn: '清除',
    }).then(async (res) => {
      if (res.confirm) {
        try {
          // 清除 Storage
          wx.clearStorageSync();
          // 重新设置登录状态
          const app = getApp<IAppOption>();
          if (app.globalData.isLoggedIn) {
            // 保留 token
            const token = wx.getStorageSync('token');
            wx.setStorageSync('token', token);
          }
          Toast({ message: '缓存已清除', theme: 'success' });
          this.calculateCacheSize();
        } catch (err) {
          Toast({ message: '清除失败', theme: 'error' });
        }
      }
    });
  },

  onCheckUpdate() {
    Toast({ message: '已是最新版本', theme: 'success' });
  },

  onChangePassword() {
    Toast({ message: '功能开发中', theme: 'warning' });
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

    const app = getApp<IAppOption>();
    app.logout();

    Toast({ message: '已退出登录', theme: 'success' });

    setTimeout(() => {
      wx.reLaunch({ url: '/pages/login/login' });
    }, 1500);
  },

  onCancelLogout() {
    this.setData({ showLogoutConfirm: false });
  },
});
