// tRPC API 服务层
// 后端地址: https://zhongyibianzhengdafen.fun/CRF
// 后端使用 superjson transformer

const API_BASE = 'https://zhongyibianzhengdafen.fun/CRF/api/trpc';

// tRPC v11 的 input 格式：使用标准 JSON 字符串
function superjsonSerialize(value: any): string {
  return JSON.stringify(value);
}

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

// tRPC 查询使用 GET，参数需要 superjson 序列化
function trpcQuery<T = any>(
  endpoint: string,
  params?: any
): Promise<T> {
  const headers = getHeaders();
  let url = `${API_BASE}/${endpoint}`;
  if (params !== undefined) {
    // tRPC v11 使用 URL 编码的 JSON（_superjson 格式）
    url += `?input=${encodeURIComponent(superjsonSerialize(params))}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      header: headers,
      timeout: 30000,
      success(res) {
        const data = res.data as TrpcResponse<T>;
        if (data.error) {
          reject(new Error(data.error.message || '请求失败'));
        } else {
          // tRPC v11 响应格式: { result: { data: { json: T, meta: {...} } } }
          const resultData = data.result?.data;
          // 如果有 superjson 包装，取 json 字段；否则直接取 data
          const extracted = (resultData && (resultData as any).json !== undefined)
            ? (resultData as any).json
            : resultData;
          resolve(extracted as T);
        }
      },
      fail(err) {
        reject(new Error('网络请求失败，请检查网络连接'));
      },
    });
  });
}

// tRPC 变更使用 POST，使用 superjson 的 json 格式
function trpcMutation<T = any>(
  endpoint: string,
  data?: any
): Promise<T> {
  const headers = getHeaders();

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/${endpoint}`,
      method: 'POST',
      // tRPC v11 期望 body: { json: <data> }（superjson 会自动处理）
      data: data !== undefined ? { json: data } : undefined,
      header: headers,
      timeout: 30000,
      success(res) {
        const resData = res.data as TrpcResponse<T>;
        if (resData.error) {
          reject(new Error(resData.error.message || '请求失败'));
        } else {
          // 响应格式: { result: { data: { json: T, meta: {...} } } } 或 { result: { data: T } }
          const resultData = resData.result?.data;
          const extracted = (resultData && (resultData as any).json !== undefined)
            ? (resultData as any).json
            : resultData;
          resolve(extracted as T);
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
    return trpcQuery<ListResponse<any>>('crf.subject.list', params);
  },
  getById(id: number) {
    return trpcQuery<any>('crf.subject.getById', { id });
  },
  create(data: any) {
    return trpcMutation<{ id: number; success: boolean }>('crf.subject.create', data);
  },
  update(id: number, data: any) {
    return trpcMutation<{ success: boolean }>('crf.subject.update', { id, data });
  },
  delete(id: number) {
    return trpcMutation<{ success: boolean }>('crf.subject.delete', { id });
  },
};

// ============ 干预记录 API ============
export const interventionApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.intervention.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.intervention.upsert', { subjectId, week, data });
  },
  delete(id: number) {
    return trpcMutation<{ success: boolean }>('crf.intervention.delete', { id });
  },
};

// ============ 体重记录 API ============
export const weightApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.weight.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.weight.upsert', { subjectId, week, data });
  },
  delete(id: number) {
    return trpcMutation<{ success: boolean }>('crf.weight.delete', { id });
  },
};

// ============ 体成分记录 API ============
export const bodyCompositionApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.bodyComposition.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.bodyComposition.upsert', { subjectId, week, data });
  },
};

// ============ 握力记录 API ============
export const gripStrengthApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.gripStrength.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.gripStrength.upsert', { subjectId, week, data });
  },
  delete(id: number) {
    return trpcMutation<{ success: boolean }>('crf.gripStrength.delete', { id });
  },
};

// ============ PG-SGA API ============
export const pgsgaApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.pgsga.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.pgsga.upsert', { subjectId, week, data });
  },
};

// ============ MFSI 疲劳量表 API ============
export const mfsiApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.mfsi.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.mfsi.upsert', { subjectId, week, data });
  },
};

// ============ 食欲记录 API ============
export const appetiteApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.appetite.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.appetite.upsert', { subjectId, week, data });
  },
};

// ============ 炎症指标 API ============
export const inflammationApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.inflammation.list', { subjectId });
  },
  upsert(subjectId: number, week: number, data: any) {
    return trpcMutation<{ id: number; created?: boolean; updated?: boolean }>('crf.inflammation.upsert', { subjectId, week, data });
  },
};

// ============ 随访记录 API ============
export const followUpApi = {
  list(subjectId: number) {
    return trpcQuery<any[]>('crf.followUp.list', { subjectId });
  },
  upsert(subjectId: number, followUpPoint: string, data: any) {
    return trpcMutation<{ success: boolean }>('crf.followUp.upsert', { subjectId, followUpPoint, data });
  },
};

// ============ 导出 API ============
export const exportApi = {
  allSubjects() {
    return trpcQuery<any>('export.allSubjects');
  },
  subjectDetail(subjectId: number) {
    return trpcQuery<any>('export.subjectDetail', { subjectId });
  },
  // 下载导出文件（返回 base64 数据）
  subjects(params?: { group?: string }) {
    const token = getToken();
    return new Promise<string>((resolve, reject) => {
      // 使用 tRPC 查询获取所有受试者数据
      trpcQuery<any>('export.allSubjects').then((data) => {
        // 将数据转换为可下载的格式
        const jsonStr = JSON.stringify(data, null, 2);
        const base64 = wx.arrayBufferToBase64(
          new Uint8Array(jsonStr.split('').map(c => c.charCodeAt(0))).buffer as ArrayBuffer
        );
        resolve(base64);
      }).catch(reject);
    });
  },
};
