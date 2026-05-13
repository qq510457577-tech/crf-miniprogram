"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 受试者详情页面
const dialog_1 = __importDefault(require("tdesign-miniprogram/dialog"));
const toast_1 = __importDefault(require("tdesign-miniprogram/toast"));
const api_1 = require("../../services/api");
Page({
    data: {
        loading: true,
        subject: null,
        subjectId: 0,
        activeTab: 'intervention',
        interventionRecords: [],
        weightRecords: [],
        bodyCompositionRecords: [],
        gripStrengthRecords: [],
        pgsgaRecords: [],
        appetiteRecords: [],
        inflammationRecords: [],
    },
    onLoad(options) {
        if (options.id) {
            const id = parseInt(options.id, 10);
            this.setData({ subjectId: id });
            this.loadSubject(id);
        }
        else {
            (0, toast_1.default)({ message: '参数错误', theme: 'error' });
            setTimeout(() => wx.navigateBack(), 1500);
        }
    },
    async loadSubject(id) {
        this.setData({ loading: true });
        try {
            const subject = await api_1.subjectApi.getById(id);
            this.setData({ subject, loading: false });
            // 加载各类型记录
            this.loadRecords(id);
        }
        catch (err) {
            this.setData({ loading: false });
            (0, toast_1.default)({ message: err.message || '加载失败', theme: 'error' });
        }
    },
    async loadRecords(subjectId) {
        try {
            const [intervention, weight, bodyComposition, gripStrength, pgsga, appetite, inflammation] = await Promise.all([
                api_1.interventionApi.list(subjectId),
                api_1.weightApi.list(subjectId),
                api_1.bodyCompositionApi.list(subjectId),
                api_1.gripStrengthApi.list(subjectId),
                api_1.pgsgaApi.list(subjectId),
                api_1.appetiteApi.list(subjectId),
                api_1.inflammationApi.list(subjectId),
            ]);
            this.setData({
                interventionRecords: intervention || [],
                weightRecords: weight || [],
                bodyCompositionRecords: bodyComposition || [],
                gripStrengthRecords: gripStrength || [],
                pgsgaRecords: pgsga || [],
                appetiteRecords: appetite || [],
                inflammationRecords: inflammation || [],
            });
        }
        catch (err) {
            console.error('加载记录失败', err);
        }
    },
    onBack() {
        wx.navigateBack();
    },
    onEdit() {
        const { subject } = this.data;
        if (!subject)
            return;
        wx.navigateTo({
            url: `/pages/record-form/record-form?mode=edit&type=subject&id=${subject.id}`,
        });
    },
    onDelete() {
        const { subject } = this.data;
        if (!subject)
            return;
        dialog_1.default.confirm({
            title: '确认删除',
            content: `确定要删除受试者 ${subject.subjectUniqueId} 吗？此操作不可撤销。`,
            confirmBtn: '删除',
            cancelBtn: '取消',
        }).then(async (res) => {
            if (res.confirm) {
                try {
                    await api_1.subjectApi.delete(subject.id);
                    (0, toast_1.default)({ message: '删除成功', theme: 'success' });
                    setTimeout(() => wx.navigateBack(), 1500);
                }
                catch (err) {
                    (0, toast_1.default)({ message: err.message || '删除失败', theme: 'error' });
                }
            }
        });
    },
    onTabChange(e) {
        this.setData({ activeTab: e.detail.value });
    },
    onAddRecord(e) {
        const { type } = e.currentTarget.dataset;
        const { subjectId } = this.data;
        wx.navigateTo({
            url: `/pages/record-form/record-form?mode=add&type=${type}&subjectId=${subjectId}`,
        });
    },
    onRecordTap(e) {
        const { type, id, week } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/record-form/record-form?mode=view&type=${type}&id=${id}&subjectId=${this.data.subjectId}${week ? '&week=' + week : ''}`,
        });
    },
    getGroupTheme(group) {
        const map = {
            '八段锦训练': 'primary',
            'PRE训练': 'warning',
            'PRE+八段锦联合训练': 'success',
        };
        return map[group] || 'default';
    },
    onShow() {
        // 从表单返回时刷新数据
        if (this.data.subjectId) {
            this.loadRecords(this.data.subjectId);
        }
    },
});
