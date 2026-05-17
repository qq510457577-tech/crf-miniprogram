import Toast from 'tdesign-miniprogram/toast';
import { subjectApi } from '../../services/api';

const GROUP_OPTIONS = [
  { label: '全部分组', value: '' },
  { label: '八段锦训练', value: '八段锦训练' },
  { label: 'PRE训练', value: 'PRE训练' },
  { label: 'PRE+八段锦联合训练', value: 'PRE+八段锦联合训练' },
];

Page({
  data: {
    statusBarHeight: 20,
    subjects: [] as any[],
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

  onLoad(options: any) {
    const app = getApp<IAppOption>();
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 });
    if (options.group) this.setData({ selectedGroup: decodeURIComponent(options.group) });
    this.loadData(true);
  },

  async loadData(reset = false) {
    const { page, searchValue, selectedGroup, pageSize, subjects } = this.data;
    this.setData({ loading: reset, loadingMore: !reset });

    try {
      const res = await subjectApi.list({
        search: searchValue,
        group: selectedGroup,
        page: reset ? 1 : page,
        pageSize,
      });
      // 后端返回格式: { data: [...], total: N, page: 1, pageSize: 20 }
      const dataItems: any[] = (res && (res as any).data) || [];
      const totalCount = (res && (res as any).total) || 0;
      this.setData({
        subjects: reset ? dataItems : [...subjects, ...dataItems],
        total: totalCount,
        hasMore: dataItems.length >= pageSize,
        page: reset ? 1 : page + 1,
        loading: false,
        loadingMore: false,
      });
    } catch (err: any) {
      Toast({ message: (err && err.message) || '加载失败', theme: 'error' });
      this.setData({ loading: false, loadingMore: false });
    }
  },

  onSearchChange(e: any) { this.setData({ searchValue: e.detail.value }); },
  onSearchSubmit() { this.loadData(true); },
  onSearchClear() { this.setData({ searchValue: '' }); this.loadData(true); },
  onGroupChange(e: any) { this.setData({ selectedGroup: e.detail.value }); this.loadData(true); },
  onReachBottom() { if (!this.data.loadingMore && this.data.hasMore) this.loadData(false); },
  loadMore() { if (!this.data.loadingMore && this.data.hasMore) this.loadData(false); },
  goToDetail(e: any) { wx.navigateTo({ url: '/pages/subject-detail/subject-detail?id=' + parseInt(e.currentTarget.dataset.id, 10) }); },
  goToAdd() { wx.navigateTo({ url: '/pages/subject-detail/subject-detail?mode=create' }); },
  onBack() { wx.navigateBack(); },
});
