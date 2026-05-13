// CRF 业务类型定义
// 对应后端数据库 19 张表

export interface Subject {
  id: number;
  subjectUniqueId: string;
  studyNumber?: string;
  consentDate?: string;
  enrollmentDate?: string;
  interventionGroup?: '八段锦训练' | 'PRE训练' | 'PRE+八段锦联合训练';
  exitDate?: string;
  exitReason?: '完成全部干预' | '自愿退出' | '不良反应' | '失访' | '其他';
  exitReasonOther?: string;
  researcherSignature?: string;
  recordDate?: string;
  gender?: '男' | '女';
  age?: number;
  height?: string;
  baselineWeight?: string;
  baselineBmi?: string;
  contact?: string;
  tumorType?: '口咽癌' | '食管癌' | '胃癌' | '肝癌' | '胆囊癌' | '胰腺癌' | '结直肠癌' | '其他';
  tumorTypeOther?: string;
  clinicalStage?: 'I期' | 'II期' | 'III期' | 'IV期' | '未知';
  cachexiaDiagnosisDate?: string;
  sarcopeniaDiagnosisDate?: string;
  previousTreatment?: string[];
  previousTreatmentOther?: string;
  comorbidities?: string;
  calfCircumferenceLeft?: string;
  calfCircumferenceRight?: string;
  skeletalMuscleMass?: string;
  gripStrengthBaseline?: string;
  gaitSpeedBaseline?: string;
  fiveTimesSitToStand?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterventionRecord {
  id?: number;
  subjectId: number;
  week: number;
  data: {
    exerciseFrequency?: string;
    exerciseDuration?: string;
    exerciseType?: string;
    adherence?: string;
    adverseEvents?: string;
    fatigue?: string;
    appetite?: string;
    weight?: string;
    notes?: string;
  };
  createdAt?: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const INTERVENTION_GROUPS = [
  { label: '八段锦训练', value: '八段锦训练' },
  { label: 'PRE训练', value: 'PRE训练' },
  { label: 'PRE+八段锦联合训练', value: 'PRE+八段锦联合训练' },
] as const;

export const EXIT_REASONS = [
  { label: '完成全部干预', value: '完成全部干预' },
  { label: '自愿退出', value: '自愿退出' },
  { label: '不良反应', value: '不良反应' },
  { label: '失访', value: '失访' },
  { label: '其他', value: '其他' },
] as const;

export const TUMOR_TYPES = [
  { label: '口咽癌', value: '口咽癌' },
  { label: '食管癌', value: '食管癌' },
  { label: '胃癌', value: '胃癌' },
  { label: '肝癌', value: '肝癌' },
  { label: '胆囊癌', value: '胆囊癌' },
  { label: '胰腺癌', value: '胰腺癌' },
  { label: '结直肠癌', value: '结直肠癌' },
  { label: '其他', value: '其他' },
] as const;

export const CLINICAL_STAGES = [
  { label: 'I期', value: 'I期' },
  { label: 'II期', value: 'II期' },
  { label: 'III期', value: 'III期' },
  { label: 'IV期', value: 'IV期' },
  { label: '未知', value: '未知' },
] as const;
