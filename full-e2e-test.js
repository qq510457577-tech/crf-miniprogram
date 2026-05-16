// CRF API 完整测试 - 端到端验证
const https = require('https');

const BASE_URL = 'zhongyibianzhengdafen.fun';
const BASE_PATH = '/CRF';
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1bmlvbklkIjoiYWRtaW4tMDAxIiwiY2xpZW50SWQiOiJjcmYtbG9jYWwtYXBwIiwiaWF0IjoxNzc4OTE3NDMzLCJleHAiOjE4MTA0NzUwMzN9.5IfXZLwCPRUTR3JFxyLgf0YaVuTxpv3uwspysbZi_aw';

function httpRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(bodyStr && { 'Content-Length': Buffer.byteLength(bodyStr) })
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function login() {
  console.log('\n=== 1. 登录 ===');
  const res = await httpRequest('POST', `${BASE_PATH}/api/auth/local/login`, 
    { username: 'admin', password: 'orz@123456' });
  console.log('登录结果:', JSON.stringify(res.data, null, 2));
  if (res.data.token) {
    return res.data.token;
  }
  throw new Error('登录失败');
}

async function createSubject(token) {
  console.log('\n=== 2. 创建受试者 ===');
  // 验证枚举值
  const subjectData = {
    subjectUniqueId: 'TEST-CRUD-001',
    studyName: 'CRUD完整测试',
    gender: '男',
    age: 65,
    interventionGroup: '八段锦训练',
    tumorType: '肺癌',
    clinicalStage: 'III期'
  };
  
  const res = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.subject.create`,
    { json: subjectData }, token);
  console.log('创建结果:', JSON.stringify(res.data, null, 2));
  return res.data;
}

async function listSubjects(token) {
  console.log('\n=== 3. 列出受试者 ===');
  const res = await httpRequest('GET', 
    `${BASE_PATH}/api/trpc/crf.subject.list?input=${encodeURIComponent(JSON.stringify({page:1,pageSize:50}))}`,
    null, token);
  
  const resultData = res.data?.result?.data?.json;
  console.log('列表结果:', JSON.stringify(resultData, null, 2));
  return resultData;
}

async function getSubjectById(token, id) {
  console.log('\n=== 4. 获取受试者详情 ===');
  const res = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.subject.getById?input=${encodeURIComponent(JSON.stringify({id}))}`,
    null, token);
  const resultData = res.data?.result?.data?.json;
  console.log('详情:', JSON.stringify(resultData, null, 2));
  return resultData;
}

async function updateSubject(token, id) {
  console.log('\n=== 5. 更新受试者 ===');
  const res = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.subject.update`,
    { json: { id, data: { age: 66 } } }, token);
  console.log('更新结果:', JSON.stringify(res.data, null, 2));
  return res.data;
}

async function createIntervention(token, subjectId) {
  console.log('\n=== 6. 创建干预记录 ===');
  const res = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.intervention.upsert`,
    { json: { subjectId, week: 1, data: { duration: 30, completed: true, notes: '第一次干预' } } }, token);
  console.log('干预记录创建结果:', JSON.stringify(res.data, null, 2));
  return res.data;
}

async function getInterventions(token, subjectId) {
  console.log('\n=== 7. 获取干预记录 ===');
  const res = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.intervention.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const resultData = res.data?.result?.data?.json;
  console.log('干预记录列表:', JSON.stringify(resultData, null, 2));
  return resultData;
}

async function createWeight(token, subjectId) {
  console.log('\n=== 8. 创建体重记录 ===');
  const res = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.weight.upsert`,
    { json: { subjectId, week: 1, data: { weight: 65.5 } } }, token);
  console.log('体重记录创建结果:', JSON.stringify(res.data, null, 2));
  return res.data;
}

async function getWeight(token, subjectId) {
  console.log('\n=== 9. 获取体重记录 ===');
  const res = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.weight.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const resultData = res.data?.result?.data?.json;
  console.log('体重记录列表:', JSON.stringify(resultData, null, 2));
  return resultData;
}

async function testStats(token) {
  console.log('\n=== 10. 测试统计接口 ===');
  const res = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/stats.overview?input=${encodeURIComponent('{}')}`,
    null, token);
  const resultData = res.data?.result?.data?.json;
  console.log('统计数据:', JSON.stringify(resultData, null, 2));
  return resultData;
}

async function testExport(token) {
  console.log('\n=== 11. 测试导出接口 ===');
  const res = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/export.allSubjects?input=${encodeURIComponent('{}')}`,
    null, token);
  const resultData = res.data?.result?.data?.json;
  console.log('导出数据条数:', resultData?.subjects?.length || 0);
  return resultData;
}

async function run() {
  console.log('========================================');
  console.log('CRF 微信小程序 - 端到端功能测试');
  console.log('========================================');
  
  try {
    // 1. 登录
    const token = await login();
    
    // 2-5. 受试者 CRUD
    const createResult = await createSubject(token);
    if (createResult?.id) {
      const subjectId = createResult.id;
      console.log('\n✅ 受试者创建成功, ID:', subjectId);
      
      // 读取
      await getSubjectById(token, subjectId);
      
      // 更新
      await updateSubject(token, subjectId);
      
      // 验证更新
      await getSubjectById(token, subjectId);
      
      // 6-9. 干预和体重记录
      await createIntervention(token, subjectId);
      await getInterventions(token, subjectId);
      await createWeight(token, subjectId);
      await getWeight(token, subjectId);
    } else {
      console.log('❌ 受试者创建失败');
    }
    
    // 10-11. 统计和导出
    await testStats(token);
    await testExport(token);
    
    // 12. 列出所有受试者验证
    await listSubjects(token);
    
    console.log('\n========================================');
    console.log('测试完成！');
    console.log('========================================');
    
  } catch (err) {
    console.error('测试失败:', err);
  }
}

run();
