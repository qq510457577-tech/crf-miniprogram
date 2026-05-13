"use strict";
// tRPC API 服务层
// 后端地址: https://zhongyibianzhengdafen.fun:8000/CRF
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportApi = exports.followUpApi = exports.inflammationApi = exports.appetiteApi = exports.mfsiApi = exports.pgsgaApi = exports.gripStrengthApi = exports.bodyCompositionApi = exports.weightApi = exports.interventionApi = exports.subjectApi = void 0;
const API_BASE = 'https://zhongyibianzhengdafen.fun:8000/CRF/api/trpc';
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
function trpcRequest(endpoint, params) {
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
                const data = res.data;
                if (data.error) {
                    reject(new Error(data.error.message || '请求失败'));
                }
                else {
                    resolve((data.result && data.result.data) || {});
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
        return trpcRequest('crf.subject.list', params);
    },
    getById(id) {
        return trpcRequest('crf.subject.getById', { id });
    },
    create(data) {
        return trpcRequest('crf.subject.create', data);
    },
    update(id, data) {
        return trpcRequest('crf.subject.update', { id, data });
    },
    delete(id) {
        return trpcRequest('crf.subject.delete', { id });
    },
};
// ============ 干预记录 API ============
exports.interventionApi = {
    list(subjectId) {
        return trpcRequest('crf.intervention.list', { subjectId });
    },
    upsert(subjectId, week, data) {
        return trpcRequest('crf.intervention.upsert', { subjectId, week, data });
    },
    delete(id) {
        return trpcRequest('crf.intervention.delete', { id });
    },
};
// ============ 体重记录 API ============
exports.weightApi = {
    list(subjectId) {
        return trpcRequest('crf.weight.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcRequest('crf.weight.upsert', { subjectId, data });
    },
    delete(id) {
        return trpcRequest('crf.weight.delete', { id });
    },
};
// ============ 体成分记录 API ============
exports.bodyCompositionApi = {
    list(subjectId) {
        return trpcRequest('crf.bodyComposition.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcRequest('crf.bodyComposition.upsert', { subjectId, data });
    },
};
// ============ 握力记录 API ============
exports.gripStrengthApi = {
    list(subjectId) {
        return trpcRequest('crf.gripStrength.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcRequest('crf.gripStrength.upsert', { subjectId, data });
    },
    delete(id) {
        return trpcRequest('crf.gripStrength.delete', { id });
    },
};
// ============ PG-SGA API ============
exports.pgsgaApi = {
    list(subjectId) {
        return trpcRequest('crf.pgsga.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcRequest('crf.pgsga.upsert', { subjectId, data });
    },
};
// ============ MFSI 疲劳量表 API ============
exports.mfsiApi = {
    list(subjectId) {
        return trpcRequest('crf.mfsi.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcRequest('crf.mfsi.upsert', { subjectId, data });
    },
};
// ============ 食欲记录 API ============
exports.appetiteApi = {
    list(subjectId) {
        return trpcRequest('crf.appetite.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcRequest('crf.appetite.upsert', { subjectId, data });
    },
};
// ============ 炎症指标 API ============
exports.inflammationApi = {
    list(subjectId) {
        return trpcRequest('crf.inflammation.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcRequest('crf.inflammation.upsert', { subjectId, data });
    },
};
// ============ 随访记录 API ============
exports.followUpApi = {
    list(subjectId) {
        return trpcRequest('crf.followUp.list', { subjectId });
    },
    upsert(subjectId, followUpPoint, data) {
        return trpcRequest('crf.followUp.upsert', { subjectId, followUpPoint, data });
    },
};
// ============ 导出 API ============
exports.exportApi = {
    subjects(params) {
        const token = getToken();
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${API_BASE}.export.subjects`,
                method: 'POST',
                data: { input: params },
                header: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                responseType: 'arraybuffer',
                success(res) {
                    const base64 = wx.arrayBufferToBase64(res.data);
                    resolve(base64);
                },
                fail: reject,
            });
        });
    },
};
