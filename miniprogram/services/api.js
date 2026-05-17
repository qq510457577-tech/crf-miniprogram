"use strict";
// tRPC API 服务层
// 后端地址: https://zhongyibianzhengdafen.fun/CRF
// 后端使用 superjson transformer
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportApi = exports.followUpApi = exports.inflammationApi = exports.appetiteApi = exports.mfsiApi = exports.pgsgaApi = exports.gripStrengthApi = exports.bodyCompositionApi = exports.weightApi = exports.interventionApi = exports.subjectApi = void 0;
const API_BASE = 'https://zhongyibianzhengdafen.fun/CRF/api/trpc';
// tRPC v11 的 input 格式：使用标准 JSON 字符串
function superjsonSerialize(value) {
    return JSON.stringify(value);
}
function getToken() {
    const app = getApp();
    return app.globalData.token || wx.getStorageSync('token') || '';
}
function getHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    return headers;
}
// tRPC 查询使用 GET，参数需要 superjson 序列化
function trpcQuery(endpoint, params) {
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
                // 检查 HTTP 状态码
                if (res.statusCode >= 400) {
                    reject(new Error(`服务器错误 (${res.statusCode})`));
                    return;
                }
                const data = res.data;
                if (!data || typeof data !== 'object') {
                    reject(new Error('服务器响应格式错误'));
                    return;
                }
                if (data.error) {
                    reject(new Error(data.error.message || '请求失败'));
                }
                else {
                    // tRPC v11 响应格式: { result: { data: { json: T, meta: {...} } } }
                    const resultData = data.result?.data;
                    // 如果有 superjson 包装，取 json 字段；否则直接取 data
                    const extracted = (resultData && resultData.json !== undefined)
                        ? resultData.json
                        : resultData;
                    resolve(extracted);
                }
            },
            fail(err) {
                reject(new Error('网络请求失败，请检查网络连接'));
            },
        });
    });
}
// tRPC 变更使用 POST，使用 superjson 的 json 格式
function trpcMutation(endpoint, data) {
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
                // 检查 HTTP 状态码
                if (res.statusCode >= 400) {
                    reject(new Error(`服务器错误 (${res.statusCode})`));
                    return;
                }
                const resData = res.data;
                if (!resData || typeof resData !== 'object') {
                    reject(new Error('服务器响应格式错误'));
                    return;
                }
                if (resData.error) {
                    reject(new Error(resData.error.message || '请求失败'));
                }
                else {
                    // 响应格式: { result: { data: { json: T, meta: {...} } } } 或 { result: { data: T } }
                    const resultData = resData.result?.data;
                    const extracted = (resultData && resultData.json !== undefined)
                        ? resultData.json
                        : resultData;
                    resolve(extracted);
                }
            },
            fail(err) {
                reject(new Error('网络请求失败，请检查网络连接'));
            },
        });
    });
}
// ============ 受试者 API ============
exports.subjectApi = {
    list(params) {
        return trpcQuery('crf.subject.list', params);
    },
    getById(id) {
        return trpcQuery('crf.subject.getById', { id });
    },
    create(data) {
        return trpcMutation('crf.subject.create', data);
    },
    update(id, data) {
        return trpcMutation('crf.subject.update', { id, data });
    },
    delete(id) {
        return trpcMutation('crf.subject.delete', { id });
    },
};
// ============ 干预记录 API ============
exports.interventionApi = {
    list(subjectId) {
        return trpcQuery('crf.intervention.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.intervention.upsert', { subjectId, week, data });
    },
    delete(id) {
        return trpcMutation('crf.intervention.delete', { id });
    },
};
// ============ 体重记录 API ============
exports.weightApi = {
    list(subjectId) {
        return trpcQuery('crf.weight.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.weight.upsert', { subjectId, week, data });
    },
    delete(id) {
        return trpcMutation('crf.weight.delete', { id });
    },
};
// ============ 体成分记录 API ============
exports.bodyCompositionApi = {
    list(subjectId) {
        return trpcQuery('crf.bodyComposition.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.bodyComposition.upsert', { subjectId, week, data });
    },
};
// ============ 握力记录 API ============
exports.gripStrengthApi = {
    list(subjectId) {
        return trpcQuery('crf.gripStrength.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.gripStrength.upsert', { subjectId, week, data });
    },
    delete(id) {
        return trpcMutation('crf.gripStrength.delete', { id });
    },
};
// ============ PG-SGA API ============
exports.pgsgaApi = {
    list(subjectId) {
        return trpcQuery('crf.pgsga.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.pgsga.upsert', { subjectId, week, data });
    },
};
// ============ MFSI 疲劳量表 API ============
exports.mfsiApi = {
    list(subjectId) {
        return trpcQuery('crf.mfsi.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.mfsi.upsert', { subjectId, week, data });
    },
};
// ============ 食欲记录 API ============
exports.appetiteApi = {
    list(subjectId) {
        return trpcQuery('crf.appetite.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.appetite.upsert', { subjectId, week, data });
    },
};
// ============ 炎症指标 API ============
exports.inflammationApi = {
    list(subjectId) {
        return trpcQuery('crf.inflammation.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcMutation('crf.inflammation.upsert', { subjectId, week, data });
    },
};
// ============ 随访记录 API ============
exports.followUpApi = {
    list(subjectId) {
        return trpcQuery('crf.followUp.list', { subjectId });
    },
    upsert(subjectId, followUpPoint, data) {
        return trpcMutation('crf.followUp.upsert', { subjectId, followUpPoint, data });
    },
};
// ============ 导出 API ============
exports.exportApi = {
    allSubjects() {
        return trpcQuery('export.allSubjects');
    },
    subjectDetail(subjectId) {
        return trpcQuery('export.subjectDetail', { subjectId });
    },
    // 下载导出文件（返回 base64 数据）
    subjects(params) {
        const token = getToken();
        return new Promise((resolve, reject) => {
            // 使用 tRPC 查询获取所有受试者数据
            trpcQuery('export.allSubjects').then((data) => {
                // 将数据转换为可下载的格式
                const jsonStr = JSON.stringify(data, null, 2);
                const base64 = wx.arrayBufferToBase64(new Uint8Array(jsonStr.split('').map(c => c.charCodeAt(0))).buffer);
                resolve(base64);
            }).catch(reject);
        });
    },
};
