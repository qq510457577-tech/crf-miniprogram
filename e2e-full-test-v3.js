/**
 * CRF 微信小程序 - 完整端到端测试 v3
 * 后端: https://zhongyibianzhengdafen.fun/CRF
 */
const https = require('https');

const BASE_URL = 'zhongyibianzhengdafen.fun';

async function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username: 'admin', password: 'orz@123456' });
    const options = {
      hostname: BASE_URL,
      path: '/CRF/api/auth/local/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.success && result.token) resolve(result.token);
        else reject(new Error('登录失败: ' + (result.error || JSON.stringify(result))));
      });
    });
    req.write(data);
    req.end();
  });
}

async function trpcQuery(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const input = encodeURIComponent(JSON.stringify(params));
    const url = `/CRF/api/trpc/${endpoint}?input=${input}`;
    const options = { hostname: BASE_URL, path: url, method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.error) reject(new Error(result.error.json?.message || result.error.message));
        else resolve(result.result?.data?.json);
      });
    });
    req.end();
  });
}

async function trpcMutation(endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ json: data });
    const options = {
      hostname: BASE_URL,
      path: `/CRF/api/trpc/${endpoint}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', c => responseData += c);
      res.on('end', () => {
        const result = JSON.parse(responseData);
        if (result.error) reject(new Error(result.error.json?.message || JSON.stringify(result.error)));
        else resolve(result.result?.data?.json);
      });
    });
    req.write(body);
    req.end();
  });
}

let token;
let testSubjectId = 0;
const results = [];

function log(name, passed, detail) {
  detail = detail || '';
  const status = passed ? 'PASS' : 'FAIL';
  results.push({ name: name, passed: passed, detail: detail });
  console.log(`  [${status}] ${name}${detail ? ' - ' + detail : ''}`);
}

async function run() {
  console.log('========================================');
  console.log('CRF 微信小程序 - 完整端到端测试 v3');
  console.log('后端: zhongyibianzhengdafen.fun/CRF');
  console.log('========================================\n');

  // 登录
  console.log('[1] 登录');
  try {
    token = await login();
    log('登录', true);
  } catch (e) {
    log('登录', false, e.message);
    return;
  }

  // 创建受试者
  console.log('\n[2] 受试者 CRUD');
  try {
    const ts = Date.now();
    const created = await trpcMutation('crf.subject.create', {
      subjectUniqueId: 'E2E-' + ts,
      studyName: '端到端完整测试',
      gender: '男',
      age: 68,
      interventionGroup: '八段锦训练',
      tumorType: '食管癌',
      clinicalStage: 'III期'
    });
    testSubjectId = created.id;
    log('创建受试者', true, 'ID=' + testSubjectId);
  } catch (e) {
    log('创建受试者', false, e.message);
  }

  if (testSubjectId > 0) {
    // 读取受试者
    try {
      const subject = await trpcQuery('crf.subject.getById', { id: testSubjectId });
      log('读取受试者', subject && subject.age === 68, '年龄=' + (subject ? subject.age : 'N/A'));
    } catch (e) {
      log('读取受试者', false, e.message);
    }

    // 更新受试者
    try {
      await trpcMutation('crf.subject.update', {
        id: testSubjectId,
        data: { age: 69 }
      });
      const updated = await trpcQuery('crf.subject.getById', { id: testSubjectId });
      log('更新受试者', updated.age === 69, '年龄=' + updated.age);
    } catch (e) {
      log('更新受试者', false, e.message);
    }
  }

  // 干预记录
  console.log('\n[3] 干预记录');
  if (testSubjectId > 0) {
    try {
      const result = await trpcMutation('crf.intervention.upsert', {
        subjectId: testSubjectId,
        week: 1,
        data: { baduanjinCompleted: '完成', preCompleted: '完成' }
      });
      log('创建干预记录', result && result.id > 0, 'ID=' + (result ? result.id : 'N/A'));

      const list = await trpcQuery('crf.intervention.list', { subjectId: testSubjectId });
      log('获取干预列表', list && list.length > 0, '共' + (list ? list.length : 0) + '条');
    } catch (e) {
      log('创建干预记录', false, e.message);
    }
  }

  // 体重记录
  console.log('\n[4] 体重记录');
  if (testSubjectId > 0) {
    try {
      const result = await trpcMutation('crf.weight.upsert', {
        subjectId: testSubjectId,
        week: 1,
        data: { weight: 65.5 }
      });
      log('创建体重记录', result && result.id > 0, 'ID=' + (result ? result.id : 'N/A'));

      const list = await trpcQuery('crf.weight.list', { subjectId: testSubjectId });
      log('获取体重列表', list && list.length > 0, '共' + (list ? list.length : 0) + '条');
    } catch (e) {
      log('创建体重记录', false, e.message);
    }
  }

  // 握力记录
  console.log('\n[5] 握力记录');
  if (testSubjectId > 0) {
    try {
      const result = await trpcMutation('crf.gripStrength.upsert', {
        subjectId: testSubjectId,
        week: 1,
        data: { trial1: 25.5, trial2: 26.0, maxValue: 26.0 }
      });
      log('创建握力记录', result && result.id > 0, 'ID=' + (result ? result.id : 'N/A'));

      const list = await trpcQuery('crf.gripStrength.list', { subjectId: testSubjectId });
      log('获取握力列表', list && list.length > 0, '共' + (list ? list.length : 0) + '条');
    } catch (e) {
      log('创建握力记录', false, e.message);
    }
  }

  // PG-SGA
  console.log('\n[6] PG-SGA营养评估');
  if (testSubjectId > 0) {
    try {
      const result = await trpcMutation('crf.pgsga.upsert', {
        subjectId: testSubjectId,
        week: 1,
        data: { totalScore: 8, nutritionGrade: '中度' }
      });
      log('创建PG-SGA', result && result.id > 0, 'ID=' + (result ? result.id : 'N/A'));

      const list = await trpcQuery('crf.pgsga.list', { subjectId: testSubjectId });
      log('获取PG-SGA列表', list && list.length > 0, '共' + (list ? list.length : 0) + '条');
    } catch (e) {
      log('创建PG-SGA', false, e.message);
    }
  }

  // MFSI疲劳量表
  console.log('\n[7] MFSI疲劳量表');
  if (testSubjectId > 0) {
    try {
      const result = await trpcMutation('crf.mfsi.upsert', {
        subjectId: testSubjectId,
        week: 1,
        data: { overallFatigue: 5, totalScore: 25 }
      });
      log('创建MFSI', result && result.id > 0, 'ID=' + (result ? result.id : 'N/A'));

      const list = await trpcQuery('crf.mfsi.list', { subjectId: testSubjectId });
      log('获取MFSI列表', list && list.length > 0, '共' + (list ? list.length : 0) + '条');
    } catch (e) {
      log('创建MFSI', false, e.message);
    }
  }

  // 食欲记录
  console.log('\n[8] 食欲记录');
  if (testSubjectId > 0) {
    try {
      const result = await trpcMutation('crf.appetite.upsert', {
        subjectId: testSubjectId,
        week: 1,
        data: { score: '4' }
      });
      log('创建食欲记录', result && result.id > 0, 'ID=' + (result ? result.id : 'N/A'));

      const list = await trpcQuery('crf.appetite.list', { subjectId: testSubjectId });
      log('获取食欲列表', list && list.length > 0, '共' + (list ? list.length : 0) + '条');
    } catch (e) {
      log('创建食欲记录', false, e.message);
    }
  }

  // 炎症指标
  console.log('\n[9] 炎症指标');
  if (testSubjectId > 0) {
    try {
      const result = await trpcMutation('crf.inflammation.upsert', {
        subjectId: testSubjectId,
        week: 1,
        data: { il6: 5.2, tnfa: 10.5 }
      });
      log('创建炎症指标', result && result.id > 0, 'ID=' + (result ? result.id : 'N/A'));

      const list = await trpcQuery('crf.inflammation.list', { subjectId: testSubjectId });
      log('获取炎症列表', list && list.length > 0, '共' + (list ? list.length : 0) + '条');
    } catch (e) {
      log('创建炎症指标', false, e.message);
    }
  }

  // 统计
  console.log('\n[10] 统计和导出');
  try {
    const stats = await trpcQuery('crf.subject.list', { pageSize: 100 });
    log('统计数据', stats && stats.data.length > 0, '共' + (stats ? stats.data.length : 0) + '条');
  } catch (e) {
    log('统计数据', false, e.message);
  }

  // 汇总
  console.log('\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');
  const passed = results.filter(function(r) { return r.passed; }).length;
  const total = results.length;
  console.log('通过: ' + passed + '/' + total);

  if (testSubjectId > 0) {
    console.log('\n测试受试者ID: ' + testSubjectId);
  }
}

run().catch(console.error);
