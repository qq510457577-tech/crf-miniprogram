// 受试者详情页面
import Dialog from 'tdesign-miniprogram/dialog';
import Toast from 'tdesign-miniprogram/toast';
import { Subject } from '../../types/crf';
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

interface SubjectDetailData {
  loading: boolean;
  subject: Subject | null;
  activeTab: string;
  interventionRecords: any[];
  weightRecords: any[];
  bodyCompositionRecords: any[];
  gripStrengthRecords: any[];
  pgsgaRecords: any[];
  appetiteRecords: any[];
  inflammationRecords: any[];
}

Page({
  data: {
    loading: true,
    subject: null as Subject | null,
    subjectId: 0,
    activeTab: 'intervention',
    interventionRecords: [] as any[],
    weightRecords: [] as any[],
    bodyCompositionRecords: [] as any[],
    gripStrengthRecords: [] as any[],
    pgsgaRecords: [] as any[],
    appetiteRecords: [] as any[],
    inflammationRecords: [] as any[],
  } as SubjectDetailData,

  onLoad(options: { id?: string }) {
    if (options.id) {
      const id = parseInt(options.id, 10);
      this.setData({ subjectId: id });
      this.loadSubject(id);
    } else {
      Toast({ message: '参数错误', theme: 'error' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  async loadSubject(id: number) {
    this.setData({ loading: true });
    try {
      const subject = await subjectApi.getById(id);
      this.setData({ subject, loading: false });
      // 加载各类型记录
      this.loadRecords(id);
    } catch (err: any) {
      this.setData({ loading: false });
      Toast({ message: err.message || '加载失败', theme: 'error' });
    }
  },

  async loadRecords(subjectId: number) {
    try {
      const [intervention, weight, bodyComposition, gripStrength, pgsga, appetite, inflammation] =
        await Promise.all([
          interventionApi.list(subjectId),
          weightApi.list(subjectId),
          bodyCompositionApi.list(subjectId),
          gripStrengthApi.list(subjectId),
          pgsgaApi.list(subjectId),
          appetiteApi.list(subjectId),
          inflammationApi.list(subjectId),
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
    } catch (err) {
      console.error('加载记录失败', err);
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onEdit() {
    const { subject } = this.data;
    if (!subject) return;
    wx.navigateTo({
      url: `/pages/record-form/record-form?mode=edit&type=subject&id=${subject.id}`,
    });
  },

  onDelete() {
    const { subject } = this.data;
    if (!subject) return;

    Dialog.confirm({
      title: '确认删除',
      content: `确定要删除受试者 ${subject.subjectUniqueId} 吗？此操作不可撤销。`,
      confirmBtn: '删除',
      cancelBtn: '取消',
    }).then(async (res) => {
      if (res.confirm) {
        try {
          await subjectApi.delete(subject.id);
          Toast({ message: '删除成功', theme: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } catch (err: any) {
          Toast({ message: err.message || '删除失败', theme: 'error' });
        }
      }
    });
  },

  onTabChange(e: any) {
    this.setData({ activeTab: e.detail.value });
  },

  onAddRecord(e: any) {
    const { type } = e.currentTarget.dataset;
    const { subjectId } = this.data;
    wx.navigateTo({
      url: `/pages/record-form/record-form?mode=add&type=${type}&subjectId=${subjectId}`,
    });
  },

  onRecordTap(e: any) {
    const { type, id, week } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-form/record-form?mode=view&type=${type}&id=${parseInt(id, 10)}&subjectId=${this.data.subjectId}${week ? '&week=' + week : ''}`,
    });
  },

  getGroupTheme(group: string): string {
    const map: Record<string, string> = {
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
