/**
 * CRF 微信小程序 - 端到端测试（修复版）
 * 后端: https://zhongyibianzhengdafen.fun/CRF
 */
const https = require('https');

const BASE_URL = 'zhongyibianzhengdafen.fun';
const BASE_PATH = '/CRF/api/trpc';

// 获取token
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
        if (result.success) resolve(result.token);
        else reject(new Error('登录失败'));
      });
    });
    req.write(data);
    req.end();
  });
}

// tRPC GET请求
async function trpcQuery(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const input = encodeURIComponent(JSON.stringify(params));
    const url = `${BASE_PATH}/${endpoint}?input=${input}`;
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

// tRPC POST请求
async function trpcMutation(endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ json: data });
    const options = {
      hostname: BASE_URL,
      path: `${BASE_PATH}/${endpoint}`,
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

async function run() {
  console.log('========================================');
  console.log('CRF 微信小程序 - 端到端测试（修复版）');
  console.log('后端: zhongyibianzhengdafen.fun/CRF');
  console.log('========================================\n');

  // 登录
  console.log('【1】登录...');
  try {
    token = await login();
    console.log('  ✅ 登录成功');
  } catch (e) {
    console.log(`  ❌ 登录失败: ${e.message}`);
    return;
  }

  // 测试1: 获取受试者列表
  console.log('\n【2】获取受试者列表...');
  try {
    const list = await trpcQuery('crf.subject.list', {});
    console.log(`  ✅ 获取成功: 共 ${list.data.length} 条记录`);
    if (list.data.length > 0) {
      console.log(`  示例数据: ID=${list.data[0].id}, 编号=${list.data[0].subjectUniqueId}`);
    }
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试2: 获取单条记录
  console.log('\n【3】获取受试者详情 (ID=22)...');
  try {
    const subject = await trpcQuery('crf.subject.getById', { id: 22 });
    if (subject) {
      console.log(`  ✅ 获取成功`);
      console.log(`  编号: ${subject.subjectUniqueId}`);
      console.log(`  年龄: ${subject.age}`);
      console.log(`  分组: ${subject.interventionGroup}`);
    } else {
      console.log('  ⚠️ 记录不存在');
    }
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试3: 尝试创建新受试者
  console.log('\n【4】创建新受试者...');
  try {
    const ts = Date.now();
    const newSubject = await trpcMutation('crf.subject.create', {
      subjectUniqueId: `TEST-${ts}`,
      age: 60,
      gender: '男',
      interventionGroup: 'PRE训练',
      tumorType: '胃癌',
      clinicalStage: 'II期'
    });
    console.log(`  ✅ 创建成功: ID=${newSubject.id}`);
  } catch (e) {
    console.log(`  ❌ 创建失败: ${e.message}`);
    console.log('  ⚠️ 可能需要重启后端服务器');
  }

  // 测试4: 获取干预记录
  console.log('\n【5】获取干预记录列表...');
  try {
    const records = await trpcQuery('crf.intervention.list', { subjectId: 22 });
    console.log(`  ✅ 获取成功: 共 ${records.length} 条记录`);
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试5: 获取体重记录
  console.log('\n【6】获取体重记录列表...');
  try {
    const records = await trpcQuery('crf.weight.list', { subjectId: 22 });
    console.log(`  ✅ 获取成功: 共 ${records.length} 条记录`);
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试6: 获取握力记录
  console.log('\n【7】获取握力记录列表...');
  try {
    const records = await trpcQuery('crf.gripStrength.list', { subjectId: 22 });
    console.log(`  ✅ 获取成功: 共 ${records.length} 条记录`);
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试7: 获取PG-SGA记录
  console.log('\n【8】获取PG-SGA记录列表...');
  try {
    const records = await trpcQuery('crf.pgsga.list', { subjectId: 22 });
    console.log(`  ✅ 获取成功: 共 ${records.length} 条记录`);
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试8: 获取炎症指标记录
  console.log('\n【9】获取炎症指标记录列表...');
  try {
    const records = await trpcQuery('crf.inflammation.list', { subjectId: 22 });
    console.log(`  ✅ 获取成功: 共 ${records.length} 条记录`);
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试9: 获取食欲记录
  console.log('\n【10】获取食欲记录列表...');
  try {
    const records = await trpcQuery('crf.appetite.list', { subjectId: 22 });
    console.log(`  ✅ 获取成功: 共 ${records.length} 条记录`);
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  // 测试10: 获取MFSI记录
  console.log('\n【11】获取MFSI疲劳量表记录...');
  try {
    const records = await trpcQuery('crf.mfsi.list', { subjectId: 22 });
    console.log(`  ✅ 获取成功: 共 ${records.length} 条记录`);
  } catch (e) {
    console.log(`  ❌ 获取失败: ${e.message}`);
  }

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

run().catch(console.error);
