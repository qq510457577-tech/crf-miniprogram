"use strict";
// 高科技风格图标组件 - 使用 Canvas 绘制精美矢量图标
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
        iconPath: '',
        iconType: 'path',
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
        color() {
            this._updateIcon();
        },
        size() {
            this._updateIcon();
        },
    },
    methods: {
        _updateIcon() {
            const name = this.data.name;
            const color = this.data.color;
            const size = this.data.size;
            
            // SVG 图标路径映射
            const iconPaths = {
                // 用户相关
                'user': this._userPath(color),
                'user-filled': this._userPath(color),
                'user-add': this._userAddPath(color),
                'gender-female': this._femalePath(color),
                'gender-male': this._malePath(color),
                // 操作相关
                'add': this._addPath(color),
                'add-circle': this._addCirclePath(color),
                'edit': this._editPath(color),
                'delete': this._deletePath(color),
                'search': this._searchPath(color),
                'setting': this._settingPath(color),
                // 导航相关
                'home': this._homePath(color),
                'chevron-right': this._chevronRightPath(color),
                'chevron-left': this._chevronLeftPath(color),
                'chevron-up': this._chevronUpPath(color),
                'chevron-down': this._chevronDownPath(color),
                'arrow-left': this._arrowLeftPath(color),
                'arrow-right': this._arrowRightPath(color),
                // 状态相关
                'check': this._checkPath(color),
                'check-circle': this._checkCirclePath(color),
                'close': this._closePath(color),
                'close-circle': this._closeCirclePath(color),
                'info-circle': this._infoPath(color),
                'warning': this._warningPath(color),
                // 图表相关
                'chart': this._chartPath(color),
                'chart-bar': this._chartBarPath(color),
                'chart-pie': this._chartPiePath(color),
                // 文档相关
                'file': this._filePath(color),
                'list': this._listPath(color),
                'bulletlist': this._listPath(color),
                // 其他常用
                'refresh': this._refreshPath(color),
                'download': this._downloadPath(color),
                'upload': this._uploadPath(color),
                'filter': this._filterPath(color),
                'mail': this._mailPath(color),
                'lock': this._lockPath(color),
                'star': this._starPath(color),
                'connection': this._connectionPath(color),
                // 医疗场景相关
                'health': this._healthPath(color),
                'medical': this._medicalPath(color),
                'pill': this._pillPath(color),
                'heart-pulse': this._heartPulsePath(color),
                'heartbeat': this._heartbeatPath(color),
                'thermometer': this._thermometerPath(color),
                'blood-pressure': this._bloodPressurePath(color),
                'clipboard': this._clipboardPath(color),
                'record': this._recordPath(color),
            };
            
            const path = iconPaths[name] || this._defaultPath(color);
            this.setData({ iconPath: path });
            this._drawIcon();
        },
        
        _drawIcon() {
            const path = this.data.iconPath;
            if (!path) return;
            
            const query = this.createSelectorQuery();
            query.select('#icon-canvas').fields({ node: true, size: true }).exec((res) => {
                if (res[0]) {
                    const canvas = res[0].node;
                    const ctx = canvas.getContext('2d');
                    const dpr = wx.getSystemInfoSync().pixelRatio;
                    const size = this.data.size;
                    
                    canvas.width = size * dpr;
                    canvas.height = size * dpr;
                    canvas.style.width = size + 'px';
                    canvas.style.height = size + 'px';
                    
                    ctx.scale(dpr, dpr);
                    ctx.clearRect(0, 0, size, size);
                    ctx.fillStyle = this.data.color;
                    ctx.strokeStyle = this.data.color;
                    ctx.lineWidth = 1.5;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    
                    // 绘制路径
                    if (Array.isArray(path)) {
                        path.forEach(p => {
                            if (p.type === 'path') {
                                ctx.beginPath();
                                ctx.fill(new Path2D(p.d));
                            } else if (p.type === 'circle') {
                                ctx.beginPath();
                                ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2);
                                ctx.fill();
                            } else if (p.type === 'rect') {
                                ctx.fillRect(p.x, p.y, p.w, p.h);
                            } else if (p.type === 'stroke') {
                                ctx.beginPath();
                                ctx.stroke(new Path2D(p.d));
                            }
                        });
                    } else if (path.type === 'path') {
                        ctx.beginPath();
                        ctx.fill(new Path2D(path.d));
                    } else if (path.type === 'circle') {
                        ctx.beginPath();
                        ctx.arc(path.cx, path.cy, path.r, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (path.type === 'stroke') {
                        ctx.beginPath();
                        ctx.stroke(new Path2D(path.d));
                    }
                }
            });
        },
        
        // 用户图标
        _userPath(color) {
            return { type: 'path', d: 'M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z' };
        },
        
        _userAddPath(color) {
            return [
                { type: 'path', d: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9-4c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z' },
                { type: 'circle', cx: 19, cy: 5, r: 2 }
            ];
        },
        
        // 性别图标
        _femalePath(color) {
            return { type: 'path', d: 'M12 2C9.24 2 7 4.24 7 7c0 2.85 2.92 7.21 5 9.88 2.11-2.69 5-7 5-9.88 0-2.76-2.24-5-5-5zm0 7.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z' };
        },
        
        _malePath(color) {
            return { type: 'path', d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z' };
        },
        
        // 加号图标
        _addPath(color) {
            return [
                { type: 'stroke', d: 'M12 5v14M5 12h14' }
            ];
        },
        
        _addCirclePath(color) {
            return [
                { type: 'circle', cx: 12, cy: 12, r: 10 },
                { type: 'stroke', d: 'M12 7v10M7 12h10' }
            ];
        },
        
        // 编辑图标
        _editPath(color) {
            return { type: 'path', d: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' };
        },
        
        // 删除图标
        _deletePath(color) {
            return { type: 'path', d: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' };
        },
        
        // 搜索图标
        _searchPath(color) {
            return [
                { type: 'circle', cx: 10.5, cy: 10.5, r: 7.5 },
                { type: 'stroke', d: 'M21 21l-5.2-5.2' }
            ];
        },
        
        // 设置图标
        _settingPath(color) {
            return { type: 'path', d: 'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 11-3.6-3.6 3.6 3.6 0 013.6 3.6z' };
        },
        
        // 首页图标
        _homePath(color) {
            return { type: 'path', d: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' };
        },
        
        // 箭头图标
        _chevronRightPath(color) {
            return { type: 'path', d: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' };
        },
        
        _chevronLeftPath(color) {
            return { type: 'path', d: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' };
        },
        
        _chevronUpPath(color) {
            return { type: 'path', d: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' };
        },
        
        _chevronDownPath(color) {
            return { type: 'path', d: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z' };
        },
        
        _arrowLeftPath(color) {
            return { type: 'path', d: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' };
        },
        
        _arrowRightPath(color) {
            return { type: 'path', d: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z' };
        },
        
        // 勾选图标
        _checkPath(color) {
            return { type: 'path', d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' };
        },
        
        _checkCirclePath(color) {
            return [
                { type: 'circle', cx: 12, cy: 12, r: 10 },
                { type: 'path', d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' }
            ];
        },
        
        // 关闭图标
        _closePath(color) {
            return { type: 'path', d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' };
        },
        
        _closeCirclePath(color) {
            return [
                { type: 'circle', cx: 12, cy: 12, r: 10 },
                { type: 'path', d: 'M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12z' }
            ];
        },
        
        // 信息图标
        _infoPath(color) {
            return [
                { type: 'circle', cx: 12, cy: 12, r: 10 },
                { type: 'path', d: 'M12 7v6M12 15.5h.01' }
            ];
        },
        
        // 警告图标
        _warningPath(color) {
            return [
                { type: 'path', d: 'M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83z' },
                { type: 'path', d: 'M11 10h2v5h-2zm0 6h2v2h-2z' }
            ];
        },
        
        // 图表图标
        _chartPath(color) {
            return { type: 'path', d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' };
        },
        
        _chartBarPath(color) {
            return [
                { type: 'rect', x: 3, y: 12, w: 4, h: 9 },
                { type: 'rect', x: 10, y: 8, w: 4, h: 13 },
                { type: 'rect', x: 17, y: 4, w: 4, h: 17 }
            ];
        },
        
        _chartPiePath(color) {
            return [
                { type: 'circle', cx: 12, cy: 12, r: 10 },
                { type: 'path', d: 'M12 2v10l7.5 4.5' }
            ];
        },
        
        // 文件图标
        _filePath(color) {
            return { type: 'path', d: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z' };
        },
        
        // 列表图标
        _listPath(color) {
            return { type: 'path', d: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' };
        },
        
        // 其他图标
        _refreshPath(color) {
            return { type: 'path', d: 'M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' };
        },
        
        _downloadPath(color) {
            return { type: 'path', d: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' };
        },
        
        _uploadPath(color) {
            return { type: 'path', d: 'M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z' };
        },
        
        _filterPath(color) {
            return { type: 'path', d: 'M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z' };
        },
        
        _mailPath(color) {
            return { type: 'path', d: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' };
        },
        
        _lockPath(color) {
            return { type: 'path', d: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' };
        },
        
        _starPath(color) {
            return { type: 'path', d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' };
        },
        
        _connectionPath(color) {
            return [
                { type: 'circle', cx: 5, cy: 12, r: 3 },
                { type: 'circle', cx: 19, cy: 12, r: 3 },
                { type: 'circle', cx: 12, cy: 5, r: 3 },
                { type: 'stroke', d: 'M12 8v4m0 4v.01M7.5 10.5l4.5-5.5m5 4.5l-4.5-5' }
            ];
        },
        
        // ========== 医疗场景图标 ==========
        
        // 医疗十字
        _healthPath(color) {
            return [
                { type: 'rect', x: 10, y: 4, w: 4, h: 16 },
                { type: 'rect', x: 4, y: 10, w: 16, h: 4 }
            ];
        },
        
        // 医疗标志
        _medicalPath(color) {
            return [
                { type: 'circle', cx: 12, cy: 12, r: 10 },
                { type: 'rect', x: 10, y: 6, w: 4, h: 12 },
                { type: 'rect', x: 6, y: 10, w: 12, h: 4 }
            ];
        },
        
        // 药丸
        _pillPath(color) {
            return [
                { type: 'rect', x: 3, y: 10, w: 18, h: 4, r: 2 },
                { type: 'path', d: 'M12 6v12' }
            ];
        },
        
        // 心跳/心电图
        _heartPulsePath(color) {
            return [
                { type: 'path', d: 'M3 12h3l2-6 4 12 2-6h6' }
            ];
        },
        
        // 心跳图标
        _heartbeatPath(color) {
            return [
                { type: 'path', d: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' }
            ];
        },
        
        // 体温计
        _thermometerPath(color) {
            return [
                { type: 'circle', cx: 12, cy: 17, r: 3 },
                { type: 'rect', x: 10, y: 4, w: 4, h: 10, r: 2 },
                { type: 'circle', cx: 12, cy: 17, r: 1.5 }
            ];
        },
        
        // 血压
        _bloodPressurePath(color) {
            return [
                { type: 'circle', cx: 7, cy: 12, r: 4 },
                { type: 'circle', cx: 17, cy: 12, r: 4 },
                { type: 'stroke', d: 'M11 12h2' }
            ];
        },
        
        // 病历/剪贴板
        _clipboardPath(color) {
            return { type: 'path', d: 'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' };
        },
        
        // 记录
        _recordPath(color) {
            return [
                { type: 'rect', x: 4, y: 2, w: 16, h: 20, r: 2 },
                { type: 'stroke', d: 'M8 7h8M8 11h8M8 15h5' }
            ];
        },
        
        _defaultPath(color) {
            return { type: 'circle', cx: 12, cy: 12, r: 4 };
        },
    },
});
