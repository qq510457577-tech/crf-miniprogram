// icon-text 组件 - 使用emoji作为备用的图标显示
Component({
  properties: {
    name: {
      type: String,
      value: '',
    },
    size: {
      type: Number,
      value: 24,
    },
    color: {
      type: String,
      value: '#333',
    },
  },

  data: {
    iconText: '',
  },

  lifetimes: {
    attached() {
      this._updateIcon();
    },
  },

  observers: {
    name() {
      this._updateIcon();
    },
  },

  methods: {
    _updateIcon() {
      const name = this.data.name;
      const iconMap = {
        // 用户相关
        'user': '👤',
        'user-filled': '👤',
        'user-add': '👤➕',
        'gender-female': '♀',
        'gender-male': '♂',
        // 操作相关
        'add': '➕',
        'add-circle': '⭕',
        'add-rectangle': '➕',
        'edit': '✏️',
        'edit-filled': '✏️',
        'delete': '🗑️',
        'delete-filled': '🗑️',
        'search': '🔍',
        'setting': '⚙️',
        'setting-filled': '⚙️',
        // 导航相关
        'home': '🏠',
        'home-filled': '🏠',
        'chevron-right': '›',
        'chevron-left': '‹',
        'chevron-up': '↑',
        'chevron-down': '↓',
        'arrow-left': '←',
        'arrow-right': '→',
        // 状态相关
        'check': '✓',
        'check-circle': '✅',
        'check-circle-filled': '✅',
        'close': '✕',
        'close-circle': '❌',
        'info-circle': 'ℹ️',
        'warning': '⚠️',
        // 图表相关
        'chart': '📊',
        'chart-bar': '📊',
        'chart-pie': '📈',
        'chart-filled': '📈',
        // 文档相关
        'file': '📄',
        'file-filled': '📄',
        'list': '📋',
        'bulletlist': '📋',
        // 其他常用
        'sound': '🔔',
        'refresh': '🔄',
        'download': '⬇️',
        'upload': '⬆️',
        'connection': '🔗',
        'filter': '�_filter',
        'mail': '📧',
        'lock': '🔒',
        'unlock': '🔓',
        'star': '⭐',
        'star-filled': '⭐',
        'heart': '❤️',
        'heart-filled': '❤️',
        'thumb-up': '👍',
        'thumb-down': '👎',
      };
      
      const iconText = iconMap[name] || '⬜';
      this.setData({ iconText });
    },
  },
});
