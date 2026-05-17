"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toast_1 = __importDefault(require("tdesign-miniprogram/toast"));
const api_1 = require("../../services/api");
const GROUP_OPTIONS = [
    { label: '全部分组', value: '' },
    { label: '八段锦训练', value: '八段锦训练' },
    { label: 'PRE训练', value: 'PRE训练' },
    { label: 'PRE+八段锦联合训练', value: 'PRE+八段锦联合训练' },
];
Page({
    data: {
        statusBarHeight: 20,
        subjects: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
        searchValue: '',
        selectedGroup: '',
        groupOptions: GROUP_OPTIONS,
        loading: false,
        loadingMore: false,
    },
    onLoad(options) {
        const app = getApp();
        this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 });
        if (options.group)
            this.setData({ selectedGroup: decodeURIComponent(options.group) });
        this.loadData(true);
    },
    async loadData(reset = false) {
        const { page, searchValue, selectedGroup, pageSize, subjects } = this.data;
        this.setData({ loading: reset, loadingMore: !reset });
        try {
            const res = await api_1.subjectApi.list({
                search: searchValue,
                group: selectedGroup,
                page: reset ? 1 : page,
                pageSize,
            });
            // 后端返回格式: { data: [...], total: N, page: 1, pageSize: 20 }
            const dataItems = (res && res.data) || [];
            const totalCount = (res && res.total) || 0;
            this.setData({
                subjects: reset ? dataItems : [...subjects, ...dataItems],
                total: totalCount,
                hasMore: dataItems.length >= pageSize,
                page: reset ? 1 : page + 1,
                loading: false,
                loadingMore: false,
            });
        }
        catch (err) {
            (0, toast_1.default)({ message: (err && err.message) || '加载失败', theme: 'error' });
            this.setData({ loading: false, loadingMore: false });
        }
    },
    onSearchChange(e) { this.setData({ searchValue: e.detail.value }); },
    onSearchSubmit() { this.loadData(true); },
    onSearchClear() { this.setData({ searchValue: '' }); this.loadData(true); },
    onGroupChange(e) { this.setData({ selectedGroup: e.detail.value }); this.loadData(true); },
    onReachBottom() { if (!this.data.loadingMore && this.data.hasMore)
        this.loadData(false); },
    loadMore() { if (!this.data.loadingMore && this.data.hasMore)
        this.loadData(false); },
    goToDetail(e) { wx.navigateTo({ url: '/pages/subject-detail/subject-detail?id=' + e.currentTarget.dataset.id }); },
    goToAdd() { wx.navigateTo({ url: '/pages/subject-detail/subject-detail?mode=create' }); },
    onBack() { wx.navigateBack(); },
});
