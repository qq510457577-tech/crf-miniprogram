"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toast_1 = __importDefault(require("tdesign-miniprogram/toast"));
const api_1 = require("../../services/api");
Page({
    data: {
        userInfo: null,
        stats: {},
        recentSubjects: [],
        marquee: { speed: 50, loop: -1 },
        loading: false,
    },
    onShow() {
        const app = getApp();
        this.setData({ userInfo: app.globalData.userInfo || {} });
        this.loadData();
    },
    async loadData() {
        this.setData({ loading: true });
        try {
            const res = await api_1.subjectApi.list({ page: 1, pageSize: 5 });
            const subjects = (res && res.data && res.data.list) || [];
            let b = 0, p = 0, c = 0;
            subjects.forEach((s) => {
                if (s.interventionGroup === '八段锦训练')
                    b++;
                else if (s.interventionGroup === 'PRE训练')
                    p++;
                else if (s.interventionGroup === 'PRE+八段锦联合训练')
                    c++;
            });
            this.setData({ recentSubjects: subjects, stats: { totalSubjects: (res && res.data && res.data.total) || 0, baduanjin: b, pre: p, combined: c } });
        }
        catch (err) {
            (0, toast_1.default)({ message: (err && err.message) || '加载失败', theme: 'error' });
        }
        finally {
            this.setData({ loading: false });
        }
    },
    goToSubjectList(e) {
        const dataset = (e && e.currentTarget && e.currentTarget.dataset) || {};
        const group = dataset.group || '';
        wx.navigateTo({ url: '/pages/subject-list/subject-list' + (group ? '?group=' + encodeURIComponent(group) : '') });
    },
    goToAddSubject() { wx.navigateTo({ url: '/pages/subject-detail/subject-detail?mode=create' }); },
    goToStats() { wx.navigateTo({ url: '/pages/stats/stats' }); },
    goToMy() { wx.switchTab({ url: '/pages/my/my' }); },
    goToDetail(e) { wx.navigateTo({ url: '/pages/subject-detail/subject-detail?id=' + e.currentTarget.dataset.id }); },
});
