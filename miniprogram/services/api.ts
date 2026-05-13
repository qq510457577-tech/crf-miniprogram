// tRPC API 服务层
// 后端地址: https://zhongyibianzhengdafen.fun:8000/CRF

const API_BASE = 'https://zhongyibianzhengdafen.fun:8000/CRF/api/trpc';

function getToken(): string {
  const app = getApp<IAppOption>();
  return app.globalData.token || wx.getStorageSync('token') || '';
}

function getHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

interface TrpcResponse<T> {
  result?: { data: T };
  error?: { message: string };
}

function trpcRequest<T = any>(
  endpoint: string,
  params?: any
): Promise<T> {
  const headers = getHeaders();
  const url = `${API_BASE}.${endpoint}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: params !== undefined ? 'POST' : 'GET',
      data: params !== undefined ? { input: params } : undefined,
      header: headers,
      timeout: 30000,
      success(res) {
        const data = res.data as TrpcResponse<T>;
        if (data.error) {
          reject(new Error(data.error.message || '请求失败'));
        } else {
          resolve(((data.result && data.result.data) || {}) as T);
        }
      },
      fail(err) {
        reject(new Error('网络请求失败，请检查网络连接'));
      },
    });
  });
}

// ============ 受试者 API ============
export const subjectApi = {
  list(params?: { search?: string; group?: string; page?: number; pageSize?: number }) {
    return trpcRequest<ListResponse<any>>('crf.subject.list', params);
  },
  getById(id: number) {
    return trpcRequest<any>('crf.subject.getById', { id });
  },
  create(data: any) {
    return trpcRequest<{ id: number; success: boolean }>('crf.subject.create', data);
  },
  update(id: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.subject.update', { id, data });
  },
  delete(id: number) {
    return trpcRequest<{ success: boolean }>('crf.subject.delete', { id });
  },
};

// ============ 干预记录 API ============
export const interventionApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.intervention.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.intervention.upsert', { subjectId, week, data });
  },
  delete(id: number) {
    return trpcRequest<{ success: boolean }>('crf.intervention.delete', { id });
  },
};

// ============ 体重记录 API ============
export const weightApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.weight.list', { subjectId });
  },
  upsert(subjectId: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.weight.upsert', { subjectId, data });
  },
  delete(id: number) {
    return trpcRequest<{ success: boolean }>('crf.weight.delete', { id });
  },
};

// ============ 体成分记录 API ============
export const bodyCompositionApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.bodyComposition.list', { subjectId });
  },
  upsert(subjectId: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.bodyComposition.upsert', { subjectId, data });
  },
};

// ============ 握力记录 API ============
export const gripStrengthApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.gripStrength.list', { subjectId });
  },
  upsert(subjectId: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.gripStrength.upsert', { subjectId, data });
  },
  delete(id: number) {
    return trpcRequest<{ success: boolean }>('crf.gripStrength.delete', { id });
  },
};

// ============ PG-SGA API ============
export const pgsgaApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.pgsga.list', { subjectId });
  },
  upsert(subjectId: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.pgsga.upsert', { subjectId, data });
  },
};

// ============ MFSI 疲劳量表 API ============
export const mfsiApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.mfsi.list', { subjectId });
  },
  upsert(subjectId: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.mfsi.upsert', { subjectId, data });
  },
};

// ============ 食欲记录 API ============
export const appetiteApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.appetite.list', { subjectId });
  },
  upsert(subjectId: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.appetite.upsert', { subjectId, data });
  },
};

// ============ 炎症指标 API ============
export const inflammationApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.inflammation.list', { subjectId });
  },
  upsert(subjectId: number, data: any) {
    return trpcRequest<{ success: boolean }>('crf.inflammation.upsert', { subjectId, data });
  },
};

// ============ 随访记录 API ============
export const followUpApi = {
  list(subjectId: number) {
    return trpcRequest<any[]>('crf.followUp.list', { subjectId });
  },
  upsert(subjectId: number, followUpPoint: string, data: any) {
    return trpcRequest<{ success: boolean }>('crf.followUp.upsert', { subjectId, followUpPoint, data });
  },
};

// ============ 导出 API ============
export const exportApi = {
  subjects(params?: { group?: string }) {
    const token = getToken();
    return new Promise<string>((resolve, reject) => {
      wx.request({
        url: `${API_BASE}.export.subjects`,
        method: 'POST',
        data: { input: params },
        header: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        responseType: 'arraybuffer',
        success(res) {
          const base64 = wx.arrayBufferToBase64(res.data as ArrayBuffer);
          resolve(base64);
        },
        fail: reject,
      });
    });
  },
};
