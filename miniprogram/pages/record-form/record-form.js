"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 记录表单页面
const toast_1 = __importDefault(require("tdesign-miniprogram/toast"));
const api_1 = require("../../services/api");
Page({
    data: {
        loading: false,
        submitting: false,
        mode: 'add',
        recordType: '',
        recordId: 0,
        subjectId: 0,
        pageTitle: '添加记录',
        subjectInfo: null,
        formData: {},
    },
    onLoad(options) {
        const { mode = 'add', type, id, subjectId, week } = options;
        this.setData({
            mode,
            recordType: type,
            recordId: id ? parseInt(id, 10) : 0,
            subjectId: subjectId ? parseInt(subjectId, 10) : 0,
        });
        // 设置页面标题
        const titleMap = {
            intervention: '干预记录',
            weight: '体重记录',
            bodyComposition: '体成分记录',
            gripStrength: '握力记录',
            pgsga: 'PG-SGA评估',
            appetite: '食欲记录',
            inflammation: '炎症指标',
            subject: '受试者信息',
        };
        const prefix = mode === 'add' ? '添加' : mode === 'edit' ? '编辑' : '查看';
        this.setData({ pageTitle: prefix + (titleMap[type] || '记录') });
        if (mode === 'add' && subjectId) {
            // 新增模式：加载受试者基本信息
            this.loadSubjectInfo(subjectId);
            // 初始化周次（如有传参）
            if (week) {
                this.setData({ ['formData.week']: parseInt(week, 10) });
            }
        }
        else if (id) {
            // 编辑/查看模式：加载现有数据
            this.loadRecord(type, id);
        }
    },
    async loadSubjectInfo(subjectId) {
        try {
            const subject = await api_1.subjectApi.getById(subjectId);
            this.setData({ subjectInfo: subject });
        }
        catch (err) {
            console.error('加载受试者信息失败', err);
        }
    },
    async loadRecord(type, id) {
        this.setData({ loading: true });
        try {
            let record = null;
            const apiMap = {
                intervention: api_1.interventionApi,
                weight: api_1.weightApi,
                bodyComposition: api_1.bodyCompositionApi,
                gripStrength: api_1.gripStrengthApi,
                pgsga: api_1.pgsgaApi,
                appetite: api_1.appetiteApi,
                inflammation: api_1.inflammationApi,
            };
            if (type === 'subject') {
                record = await api_1.subjectApi.getById(id);
            }
            else if (apiMap[type]) {
                // 各记录类型暂无 getById 接口，先留空
                record = {};
            }
            if (record) {
                this.setData({ formData: record, loading: false });
            }
            else {
                this.setData({ loading: false });
            }
        }
        catch (err) {
            this.setData({ loading: false });
            (0, toast_1.default)({ message: err.message || '加载失败', theme: 'error' });
        }
    },
    onBack() {
        wx.navigateBack();
    },
    onFieldChange(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({ [`formData.${field}`]: value });
    },
    onStepperChange(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({ [`formData.${field}`]: value });
    },
    onSliderChange(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({ [`formData.${field}`]: value });
    },
    onCheckboxChange(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({ [`formData.${field}`]: value });
    },
    onDateChange(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({ [`formData.${field}`]: value });
    },
    onWeekChange(e) {
        const value = e.detail.value;
        this.setData({ ['formData.week']: value });
    },
    getPgsgaLevel(score) {
        if (score === undefined || score === null)
            return '可正常营养';
        if (score <= 1)
            return '可正常营养';
        if (score <= 8)
            return '中度营养不良';
        return '重度营养不良';
    },
    async onSubmit() {
        const { mode, recordType, recordId, subjectId, formData } = this.data;
        // 表单验证
        if (recordType === 'intervention' && !formData.week) {
            (0, toast_1.default)({ message: '请选择记录周次', theme: 'warning' });
            return;
        }
        if (['weight', 'bodyComposition', 'gripStrength', 'appetite', 'inflammation'].includes(recordType)) {
            if (!formData.recordDate) {
                (0, toast_1.default)({ message: '请选择记录日期', theme: 'warning' });
                return;
            }
        }
        this.setData({ submitting: true });
        try {
            switch (recordType) {
                case 'subject':
                    if (mode === 'add') {
                        await api_1.subjectApi.create(formData);
                    }
                    else {
                        await api_1.subjectApi.update(recordId, formData);
                    }
                    break;
                case 'intervention':
                    await api_1.interventionApi.upsert(subjectId, formData.week, {
                        exerciseFrequency: formData.exerciseFrequency,
                        exerciseDuration: formData.exerciseDuration,
                        exerciseType: formData.exerciseType,
                        adherence: formData.adherence,
                        adverseEvents: formData.adverseEvents,
                        fatigue: formData.fatigue,
                        appetite: formData.appetiteScore,
                        weight: formData.weight,
                        notes: formData.notes,
                    });
                    break;
                case 'weight':
                    await api_1.weightApi.upsert(subjectId, formData.week || 1, {
                        recordDate: formData.recordDate,
                        weight: formData.weight,
                        bmi: formData.bmi,
                        notes: formData.notes,
                    });
                    break;
                case 'bodyComposition':
                    await api_1.bodyCompositionApi.upsert(subjectId, formData.week || 1, {
                        recordDate: formData.recordDate,
                        calfCircumferenceLeft: formData.calfCircumferenceLeft,
                        calfCircumferenceRight: formData.calfCircumferenceRight,
                        skeletalMuscleMass: formData.skeletalMuscleMass,
                        bodyFatPercentage: formData.bodyFatPercentage,
                        bodyWaterPercentage: formData.bodyWaterPercentage,
                    });
                    break;
                case 'gripStrength':
                    await api_1.gripStrengthApi.upsert(subjectId, formData.week || 1, {
                        recordDate: formData.recordDate,
                        leftHand: formData.leftHand,
                        rightHand: formData.rightHand,
                    });
                    break;
                case 'pgsga':
                    await api_1.pgsgaApi.upsert(subjectId, formData.week || 1, {
                        recordDate: formData.recordDate,
                        weightLoss: formData.weightLoss,
                        foodIntake: formData.foodIntake,
                        symptoms: formData.symptoms,
                        functionalStatus: formData.functionalStatus,
                        disease: formData.disease,
                        metabolicDemand: formData.metabolicDemand,
                        physicalExam: formData.physicalExam,
                        totalScore: formData.totalScore,
                    });
                    break;
                case 'appetite':
                    await api_1.appetiteApi.upsert(subjectId, formData.week || 1, {
                        recordDate: formData.recordDate,
                        score: formData.score,
                        change: formData.change,
                        intake: formData.intake,
                        notes: formData.notes,
                    });
                    break;
                case 'inflammation':
                    await api_1.inflammationApi.upsert(subjectId, formData.week || 1, {
                        recordDate: formData.recordDate,
                        crp: formData.crp,
                        albumin: formData.albumin,
                        prealbumin: formData.prealbumin,
                        wbc: formData.wbc,
                        neutrophil: formData.neutrophil,
                        notes: formData.notes,
                    });
                    break;
            }
            (0, toast_1.default)({ message: '保存成功', theme: 'success' });
            setTimeout(() => wx.navigateBack(), 1500);
        }
        catch (err) {
            (0, toast_1.default)({ message: err.message || '保存失败', theme: 'error' });
        }
        finally {
            this.setData({ submitting: false });
        }
    },
});
