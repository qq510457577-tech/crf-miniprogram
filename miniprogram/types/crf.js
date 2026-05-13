"use strict";
// CRF 业务类型定义
// 对应后端数据库 19 张表
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLINICAL_STAGES = exports.TUMOR_TYPES = exports.EXIT_REASONS = exports.INTERVENTION_GROUPS = void 0;
exports.INTERVENTION_GROUPS = [
    { label: '八段锦训练', value: '八段锦训练' },
    { label: 'PRE训练', value: 'PRE训练' },
    { label: 'PRE+八段锦联合训练', value: 'PRE+八段锦联合训练' },
];
exports.EXIT_REASONS = [
    { label: '完成全部干预', value: '完成全部干预' },
    { label: '自愿退出', value: '自愿退出' },
    { label: '不良反应', value: '不良反应' },
    { label: '失访', value: '失访' },
    { label: '其他', value: '其他' },
];
exports.TUMOR_TYPES = [
    { label: '口咽癌', value: '口咽癌' },
    { label: '食管癌', value: '食管癌' },
    { label: '胃癌', value: '胃癌' },
    { label: '肝癌', value: '肝癌' },
    { label: '胆囊癌', value: '胆囊癌' },
    { label: '胰腺癌', value: '胰腺癌' },
    { label: '结直肠癌', value: '结直肠癌' },
    { label: '其他', value: '其他' },
];
exports.CLINICAL_STAGES = [
    { label: 'I期', value: 'I期' },
    { label: 'II期', value: 'II期' },
    { label: 'III期', value: 'III期' },
    { label: 'IV期', value: 'IV期' },
    { label: '未知', value: '未知' },
];
