"use strict";
// tRPC API 服务层
// 后端地址: https://zhongyibianzhengdafen.fun/CRF
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportApi = exports.followUpApi = exports.inflammationApi = exports.appetiteApi = exports.mfsiApi = exports.pgsgaApi = exports.gripStrengthApi = exports.bodyCompositionApi = exports.weightApi = exports.interventionApi = exports.subjectApi = void 0;
const API_BASE = 'https://zhongyibianzhengdafen.fun/CRF/api/trpc';
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
// tRPC 查询总是使用 GET，参数通过 URL 查询参数传递
function trpcQuery(endpoint, params) {
    const headers = getHeaders();
    let url = `${API_BASE}.${endpoint}`;
    if (params !== undefined) {
        url += `?input=${encodeURIComponent(JSON.stringify(params))}`;
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url,
            method: 'GET',
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
// tRPC 变更使用 POST
function trpcMutation(endpoint, data) {
    const headers = getHeaders();
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${API_BASE}.${endpoint}`,
            method: 'POST',
            data: data !== undefined ? { input: data } : undefined,
            header: headers,
            timeout: 30000,
            success(res) {
                const resData = res.data;
                if (resData.error) {
                    reject(new Error(resData.error.message || '请求失败'));
                }
                else {
                    resolve((resData.result && resData.result.data) || {});
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
    upsert(subjectId, data) {
        return trpcMutation('crf.weight.upsert', { subjectId, data });
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
    upsert(subjectId, data) {
        return trpcMutation('crf.bodyComposition.upsert', { subjectId, data });
    },
};
// ============ 握力记录 API ============
exports.gripStrengthApi = {
    list(subjectId) {
        return trpcQuery('crf.gripStrength.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcMutation('crf.gripStrength.upsert', { subjectId, data });
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
    upsert(subjectId, data) {
        return trpcMutation('crf.pgsga.upsert', { subjectId, data });
    },
};
// ============ MFSI 疲劳量表 API ============
exports.mfsiApi = {
    list(subjectId) {
        return trpcQuery('crf.mfsi.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcMutation('crf.mfsi.upsert', { subjectId, data });
    },
};
// ============ 食欲记录 API ============
exports.appetiteApi = {
    list(subjectId) {
        return trpcQuery('crf.appetite.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcMutation('crf.appetite.upsert', { subjectId, data });
    },
};
// ============ 炎症指标 API ============
exports.inflammationApi = {
    list(subjectId) {
        return trpcQuery('crf.inflammation.list', { subjectId });
    },
    upsert(subjectId, data) {
        return trpcMutation('crf.inflammation.upsert', { subjectId, data });
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
    subjects(params) {
        const token = getToken();
        return new Promise((resolve, reject) => {
            let url = `${API_BASE}.export.subjects`;
            if (params) {
                url += `?input=${encodeURIComponent(JSON.stringify(params))}`;
            }
            wx.request({
                url,
                method: 'GET',
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
