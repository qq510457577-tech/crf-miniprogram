// 统计页面
import Toast from 'tdesign-miniprogram/toast';
import { subjectApi, exportApi } from '../../services/api';

interface StatsData {
  loading: boolean;
  stats: {
    total: number;
    active: number;
    exited: number;
    bajiaojin: number;
    pre: number;
    preBajiaojin: number;
  };
  tumorDistribution: Array<{ type: string; count: number; percent: string }>;
  stageDistribution: Array<{ stage: string; count: number }>;
  exporting: string;
}

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
    tumorDistribution: [] as Array<{ type: string; count: number; percent: string }>,
    stageDistribution: [] as Array<{ stage: string; count: number }>,
    exporting: '',
  } as StatsData,

  onLoad() {
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  async loadStats() {
    this.setData({ loading: true });
    try {
      const res = await subjectApi.list({ pageSize: 1000 });
      // 后端返回格式: { data: [...], total: N }
      const subjects: any[] = (res && (res as any).data) || [];

      const stats = {
        total: subjects.length,
        active: subjects.filter((s: any) => !s.exitDate && !s.exitReason).length,
        exited: subjects.filter((s: any) => s.exitDate || s.exitReason).length,
        bajiaojin: subjects.filter((s: any) => s.interventionGroup === '八段锦训练').length,
        pre: subjects.filter((s: any) => s.interventionGroup === 'PRE训练').length,
        preBajiaojin: subjects.filter((s: any) => s.interventionGroup === 'PRE+八段锦联合训练').length,
      };

      // 肿瘤类型分布
      const tumorMap: Record<string, number> = {};
      subjects.forEach((s: any) => {
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
      const stageMap: Record<string, number> = {};
      subjects.forEach((s: any) => {
        const stageMapKey = s.clinicalStage || 'unknown';
        stageMap[stageMapKey] = (stageMap[stageMapKey] || 0) + 1;
      });
      const stageOrder = ['I', 'II', 'III', 'IV', 'unknown'];
      const stageDistribution = stageOrder
        .filter((s) => stageMap[s])
        .map((stage) => ({
          stage,
          stageLabel: stage === 'unknown' ? '未知' : stage + '期',
          count: stageMap[stage]
        }));

      this.setData({ stats, tumorDistribution, stageDistribution, loading: false });
    } catch (err: any) {
      this.setData({ loading: false });
      Toast({ message: err.message || '加载失败', theme: 'error' });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onFilterByGroup(e: any) {
    const { group } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/subject-list/subject-list?group=${encodeURIComponent(group)}`,
    });
  },

  async onExport(e: any) {
    const { type } = e.currentTarget.dataset;

    this.setData({ exporting: type });
    Toast({ message: '正在导出，请稍候...', theme: 'loading' });

    try {
      let group: string | undefined;
      if (type === 'bajiaojin') group = '八段锦训练';
      else if (type === 'pre') group = 'PRE训练';
      else if (type === 'preBajiaojin') group = 'PRE+八段锦联合训练';

      const base64 = await exportApi.subjects(group ? { group } : undefined);

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
              Toast({ message: '导出成功', theme: 'success' });
            },
            fail: () => {
              Toast({ message: '打开文件失败', theme: 'error' });
            },
          });
        },
        fail: (err) => {
          console.error('保存文件失败', err);
          Toast({ message: '保存文件失败', theme: 'error' });
        },
      });
    } catch (err: any) {
      Toast({ message: err.message || '导出失败', theme: 'error' });
    } finally {
      this.setData({ exporting: '' });
    }
  },
});
