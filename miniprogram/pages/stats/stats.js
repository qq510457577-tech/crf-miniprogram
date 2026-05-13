"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 统计页面
const toast_1 = __importDefault(require("tdesign-miniprogram/toast"));
const api_1 = require("../../services/api");
Page({
    data: {
        loading: true,
        stats: {
            total: 0,
            active: 0,
            exited: 0,
            bajiaojin: 0,
            pre: 0,
            preBajiaojin: 0,
        },
        tumorDistribution: [],
        stageDistribution: [],
        exporting: '',
    },
    onLoad() {
        this.loadStats();
    },
    onShow() {
        this.loadStats();
    },
    async loadStats() {
        this.setData({ loading: true });
        try {
            const res = await api_1.subjectApi.list({ pageSize: 1000 });
            const subjects = res.data.list || [];
            const stats = {
                total: subjects.length,
                active: subjects.filter((s) => !s.exitDate && !s.exitReason).length,
                exited: subjects.filter((s) => s.exitDate || s.exitReason).length,
                bajiaojin: subjects.filter((s) => s.interventionGroup === '八段锦训练').length,
                pre: subjects.filter((s) => s.interventionGroup === 'PRE训练').length,
                preBajiaojin: subjects.filter((s) => s.interventionGroup === 'PRE+八段锦联合训练').length,
            };
            // 肿瘤类型分布
            const tumorMap = {};
            subjects.forEach((s) => {
                const type = s.tumorType || '未知';
                tumorMap[type] = (tumorMap[type] || 0) + 1;
            });
            const tumorDistribution = Object.entries(tumorMap)
                .map(([type, count]) => ({
                type,
                count,
                percent: ((count / subjects.length) * 100).toFixed(1),
            }))
                .sort((a, b) => b.count - a.count);
            // 临床分期分布
            const stageMap = {};
            subjects.forEach((s) => {
                const stage = s.clinicalStage || '未知';
                stageMap[stage] = (stageMap[stage] || 0) + 1;
            });
            const stageOrder = ['I期', 'II期', 'III期', 'IV期', '未知'];
            const stageDistribution = stageOrder
                .filter((s) => stageMap[s])
                .map((stage) => ({ stage, count: stageMap[stage] }));
            this.setData({ stats, tumorDistribution, stageDistribution, loading: false });
        }
        catch (err) {
            this.setData({ loading: false });
            (0, toast_1.default)({ message: err.message || '加载失败', theme: 'error' });
        }
    },
    onBack() {
        wx.navigateBack();
    },
    onFilterByGroup(e) {
        const { group } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/subject-list/subject-list?group=${encodeURIComponent(group)}`,
        });
    },
    async onExport(e) {
        const { type } = e.currentTarget.dataset;
        this.setData({ exporting: type });
        (0, toast_1.default)({ message: '正在导出，请稍候...', theme: 'loading' });
        try {
            let group;
            if (type === 'bajiaojin')
                group = '八段锦训练';
            else if (type === 'pre')
                group = 'PRE训练';
            else if (type === 'preBajiaojin')
                group = 'PRE+八段锦联合训练';
            const base64 = await api_1.exportApi.subjects(group ? { group } : undefined);
            // 保存文件
            const fileName = `CRF数据导出_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            const fs = wx.getFileSystemManager();
            const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
            const buffer = wx.base64ToArrayBuffer(base64);
            fs.writeFile({
                filePath,
                data: buffer,
                encoding: 'binary',
                success: () => {
                    wx.openDocument({
                        filePath,
                        fileType: 'xlsx',
                        showMenu: true,
                        success: () => {
                            (0, toast_1.default)({ message: '导出成功', theme: 'success' });
                        },
                        fail: () => {
                            (0, toast_1.default)({ message: '打开文件失败', theme: 'error' });
                        },
                    });
                },
                fail: (err) => {
                    console.error('保存文件失败', err);
                    (0, toast_1.default)({ message: '保存文件失败', theme: 'error' });
                },
            });
        }
        catch (err) {
            (0, toast_1.default)({ message: err.message || '导出失败', theme: 'error' });
        }
        finally {
            this.setData({ exporting: '' });
        }
    },
});
