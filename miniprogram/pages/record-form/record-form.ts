// 记录表单页面
import Toast from 'tdesign-miniprogram/toast';
import {
  subjectApi,
  interventionApi,
  weightApi,
  bodyCompositionApi,
  gripStrengthApi,
  pgsgaApi,
  appetiteApi,
  inflammationApi,
} from '../../services/api';

interface RecordFormData {
  loading: boolean;
  submitting: boolean;
  mode: 'add' | 'edit' | 'view';
  recordType: string;
  recordId: number;
  subjectId: number;
  pageTitle: string;
  subjectInfo: any;
  formData: Record<string, any>;
}

Page({
  data: {
    loading: false,
    submitting: false,
    mode: 'add' as 'add' | 'edit' | 'view',
    recordType: '',
    recordId: 0,
    subjectId: 0,
    pageTitle: '添加记录',
    subjectInfo: null as any,
    formData: {} as Record<string, any>,
  } as RecordFormData,

  onLoad(options: any) {
    const { mode = 'add', type, id, subjectId, week } = options;

    this.setData({
      mode,
      recordType: type,
      recordId: id ? parseInt(id, 10) : 0,
      subjectId: subjectId ? parseInt(subjectId, 10) : 0,
    });

    // 设置页面标题
    const titleMap: Record<string, string> = {
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
      this.loadSubjectInfo(parseInt(subjectId, 10));
      // 初始化周次（如有传参）
      if (week) {
        this.setData({ ['formData.week']: parseInt(week, 10) });
      }
    } else if (id) {
      // 编辑/查看模式：加载现有数据
      this.loadRecord(type, parseInt(id, 10));
    }
  },

  async loadSubjectInfo(subjectId: number) {
    try {
      const subject = await subjectApi.getById(subjectId);
      this.setData({ subjectInfo: subject });
    } catch (err) {
      console.error('加载受试者信息失败', err);
    }
  },

  async loadRecord(type: string, id: number) {
    this.setData({ loading: true });
    try {
      let record: any = null;
      const apiMap: Record<string, any> = {
        intervention: interventionApi,
        weight: weightApi,
        bodyComposition: bodyCompositionApi,
        gripStrength: gripStrengthApi,
        pgsga: pgsgaApi,
        appetite: appetiteApi,
        inflammation: inflammationApi,
      };

      if (type === 'subject') {
        record = await subjectApi.getById(id);
      } else if (apiMap[type]) {
        // 各记录类型暂无 getById 接口，先留空
        record = {};
      }

      if (record) {
        this.setData({ formData: record, loading: false });
      } else {
        this.setData({ loading: false });
      }
    } catch (err: any) {
      this.setData({ loading: false });
      Toast({ message: err.message || '加载失败', theme: 'error' });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onFieldChange(e: any) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  onStepperChange(e: any) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  onSliderChange(e: any) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  onCheckboxChange(e: any) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  onDateChange(e: any) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  onWeekChange(e: any) {
    const value = e.detail.value;
    this.setData({ ['formData.week']: value });
  },

  getPgsgaLevel(score: number): string {
    if (score === undefined || score === null) return '可正常营养';
    if (score <= 1) return '可正常营养';
    if (score <= 8) return '中度营养不良';
    return '重度营养不良';
  },

  async onSubmit() {
    const { mode, recordType, recordId, subjectId, formData } = this.data;

    // 表单验证
    if (recordType === 'intervention' && !formData.week) {
      Toast({ message: '请选择记录周次', theme: 'warning' });
      return;
    }

    if (['weight', 'bodyComposition', 'gripStrength', 'appetite', 'inflammation'].includes(recordType)) {
      if (!formData.recordDate) {
        Toast({ message: '请选择记录日期', theme: 'warning' });
        return;
      }
    }

    this.setData({ submitting: true });

    try {
      switch (recordType) {
        case 'subject':
          if (mode === 'add') {
            await subjectApi.create(formData);
          } else {
            await subjectApi.update(recordId, formData);
          }
          break;

        case 'intervention':
          await interventionApi.upsert(subjectId, formData.week, {
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
          await weightApi.upsert(subjectId, formData.week || 1, {
            recordDate: formData.recordDate,
            weight: formData.weight,
            bmi: formData.bmi,
            notes: formData.notes,
          });
          break;

        case 'bodyComposition':
          await bodyCompositionApi.upsert(subjectId, formData.week || 1, {
            recordDate: formData.recordDate,
            calfCircumferenceLeft: formData.calfCircumferenceLeft,
            calfCircumferenceRight: formData.calfCircumferenceRight,
            skeletalMuscleMass: formData.skeletalMuscleMass,
            bodyFatPercentage: formData.bodyFatPercentage,
            bodyWaterPercentage: formData.bodyWaterPercentage,
          });
          break;

        case 'gripStrength':
          await gripStrengthApi.upsert(subjectId, formData.week || 1, {
            recordDate: formData.recordDate,
            leftHand: formData.leftHand,
            rightHand: formData.rightHand,
          });
          break;

        case 'pgsga':
          await pgsgaApi.upsert(subjectId, formData.week || 1, {
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
          await appetiteApi.upsert(subjectId, formData.week || 1, {
            recordDate: formData.recordDate,
            score: formData.score,
            change: formData.change,
            intake: formData.intake,
            notes: formData.notes,
          });
          break;

        case 'inflammation':
          await inflammationApi.upsert(subjectId, formData.week || 1, {
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

      Toast({ message: '保存成功', theme: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err: any) {
      Toast({ message: err.message || '保存失败', theme: 'error' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
