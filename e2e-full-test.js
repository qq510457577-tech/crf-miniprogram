// CRF 完整端到端测试 - 创建、读取、更新、删除
const https = require('https');

const BASE_URL = 'zhongyibianzhengdafen.fun';
const BASE_PATH = '/CRF';
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1bmlvbklkIjoiYWRtaW4tMDAxIiwiY2xpZW50SWQiOiJjcmYtbG9jYWwtYXBwIiwiaWF0IjoxNzc4OTE3NTIzLCJleHAiOjE4MTA0NzUxMjN9.Otx5DnAxLpqDAma1b7QqWQvgCMom7knSM4xU6KdSbmc';

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

async function testSubjectCRUD() {
  console.log('\n=== 1. 创建受试者 ===');
  // 使用正确的枚举值: tumorType 只能是 口咽癌|食管癌|胃癌|肝癌|胆囊癌|胰腺癌|结直肠癌|其他
  const res = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.subject.create`,
    { json: { 
      subjectUniqueId: 'TEST-CRUD-001', 
      studyName: 'CRUD完整测试', 
      gender: '男', 
      age: 65, 
      interventionGroup: '八段锦训练', 
      tumorType: '食管癌', 
      clinicalStage: 'III期' 
    } }, TOKEN);
  
  console.log('创建结果:', JSON.stringify(res.data, null, 2));
  
  if (!res.data?.id) {
    console.log('❌ 受试者创建失败');
    return null;
  }
  
  const subjectId = res.data.id;
  console.log('✅ 受试者创建成功, ID:', subjectId);
  
  // 2. 读取受试者
  console.log('\n=== 2. 读取受试者 ===');
  const getRes = await httpRequest('GET', 
    `${BASE_PATH}/api/trpc/crf.subject.getById?input=${encodeURIComponent(JSON.stringify({id: subjectId}))}`,
    null, TOKEN);
  const subject = getRes.data?.result?.data?.json;
  console.log('受试者信息:', subject?.subjectUniqueId, '年龄:', subject?.age, '分组:', subject?.interventionGroup);
  
  // 3. 更新受试者
  console.log('\n=== 3. 更新受试者 ===');
  const updateRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.subject.update`,
    { json: { id: subjectId, data: { age: 66 } } }, TOKEN);
  console.log('更新结果:', JSON.stringify(updateRes.data, null, 2));
  
  // 4. 验证更新
  console.log('\n=== 4. 验证更新 ===');
  const verifyRes = await httpRequest('GET', 
    `${BASE_PATH}/api/trpc/crf.subject.getById?input=${encodeURIComponent(JSON.stringify({id: subjectId}))}`,
    null, TOKEN);
  const updatedSubject = verifyRes.data?.result?.data?.json;
  console.log('更新后年龄:', updatedSubject?.age, updatedSubject?.age === 66 ? '✅' : '❌');
  
  return subjectId;
}

async function testIntervention(token, subjectId) {
  console.log('\n=== 5. 创建干预记录 ===');
  const intRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.intervention.upsert`,
    { json: { subjectId, week: 1, data: { duration: 30, completed: true, notes: '第一次干预测试' } } }, token);
  console.log('干预记录创建:', JSON.stringify(intRes.data, null, 2));
  
  console.log('\n=== 6. 获取干预记录列表 ===');
  const intListRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.intervention.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const interventions = intListRes.data?.result?.data?.json;
  console.log('干预记录数量:', interventions?.length, interventions?.length > 0 ? '✅' : '❌');
  console.log('记录详情:', JSON.stringify(interventions, null, 2));
}

async function testWeight(token, subjectId) {
  console.log('\n=== 7. 创建体重记录 ===');
  const weightRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.weight.upsert`,
    { json: { subjectId, week: 1, data: { weight: 65.5 } } }, token);
  console.log('体重记录创建:', JSON.stringify(weightRes.data, null, 2));
  
  console.log('\n=== 8. 获取体重记录列表 ===');
  const weightListRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.weight.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const weights = weightListRes.data?.result?.data?.json;
  console.log('体重记录:', JSON.stringify(weights, null, 2));
}

async function testPGSGA(token, subjectId) {
  console.log('\n=== 9. 创建 PG-SGA 记录 ===');
  const pgsgaRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.pgsga.upsert`,
    { json: { subjectId, week: 1, data: { score: 8, weightLoss: 2 } } }, token);
  console.log('PG-SGA创建:', JSON.stringify(pgsgaRes.data, null, 2));
  
  console.log('\n=== 10. 获取 PG-SGA 记录 ===');
  const pgsgaListRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.pgsga.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const pgsga = pgsgaListRes.data?.result?.data?.json;
  console.log('PG-SGA记录:', JSON.stringify(pgsga, null, 2));
}

async function testMFSI(token, subjectId) {
  console.log('\n=== 11. 创建 MFSI 疲劳量表记录 ===');
  const mfsiRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.mfsi.upsert`,
    { json: { subjectId, week: 1, data: { fatigueScore: 45 } } }, token);
  console.log('MFSI创建:', JSON.stringify(mfsiRes.data, null, 2));
  
  console.log('\n=== 12. 获取 MFSI 记录 ===');
  const mfsiListRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.mfsi.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const mfsi = mfsiListRes.data?.result?.data?.json;
  console.log('MFSI记录:', JSON.stringify(mfsi, null, 2));
}

async function testAppetite(token, subjectId) {
  console.log('\n=== 13. 创建食欲记录 ===');
  const appetiteRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.appetite.upsert`,
    { json: { subjectId, week: 1, data: { score: 7 } } }, token);
  console.log('食欲记录创建:', JSON.stringify(appetiteRes.data, null, 2));
  
  console.log('\n=== 14. 获取食欲记录 ===');
  const appetiteListRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.appetite.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const appetite = appetiteListRes.data?.result?.data?.json;
  console.log('食欲记录:', JSON.stringify(appetite, null, 2));
}

async function testInflammation(token, subjectId) {
  console.log('\n=== 15. 创建炎症指标记录 ===');
  const infRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.inflammation.upsert`,
    { json: { subjectId, week: 1, data: { crp: 5.2, albumin: 38.5 } } }, token);
  console.log('炎症指标创建:', JSON.stringify(infRes.data, null, 2));
  
  console.log('\n=== 16. 获取炎症指标记录 ===');
  const infListRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.inflammation.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const inflammation = infListRes.data?.result?.data?.json;
  console.log('炎症指标记录:', JSON.stringify(inflammation, null, 2));
}

async function testGripStrength(token, subjectId) {
  console.log('\n=== 17. 创建握力记录 ===');
  const gripRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.gripStrength.upsert`,
    { json: { subjectId, week: 1, data: { leftHand: 25.5, rightHand: 26.0 } } }, token);
  console.log('握力记录创建:', JSON.stringify(gripRes.data, null, 2));
  
  console.log('\n=== 18. 获取握力记录 ===');
  const gripListRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.gripStrength.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
    null, token);
  const grip = gripListRes.data?.result?.data?.json;
  console.log('握力记录:', JSON.stringify(grip, null, 2));
}

async function testStats(token) {
  console.log('\n=== 19. 测试统计数据 ===');
  const statsRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/stats.overview?input=${encodeURIComponent('{}')}`,
    null, token);
  const stats = statsRes.data?.result?.data?.json;
  console.log('统计数据:', JSON.stringify(stats, null, 2));
}

async function testExport(token) {
  console.log('\n=== 20. 测试数据导出 ===');
  const exportRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/export.allSubjects?input=${encodeURIComponent('{}')}`,
    null, token);
  const exportData = exportRes.data?.result?.data?.json;
  console.log('导出数据条数:', exportData?.subjects?.length, exportData?.subjects?.length > 0 ? '✅' : '❌');
}

async function testListAllSubjects(token) {
  console.log('\n=== 21. 列出所有受试者 ===');
  const listRes = await httpRequest('GET',
    `${BASE_PATH}/api/trpc/crf.subject.list?input=${encodeURIComponent(JSON.stringify({page:1,pageSize:100}))}`,
    null, token);
  const result = listRes.data?.result?.data?.json;
  console.log('受试者总数:', result?.total, '返回条数:', result?.data?.length);
  
  // 查找我们刚创建的测试数据
  const testSubject = result?.data?.find(s => s.subjectUniqueId === 'TEST-CRUD-001');
  if (testSubject) {
    console.log('✅ 找到刚创建的测试数据:', testSubject.id, testSubject.age);
  } else {
    console.log('❌ 未找到刚创建的测试数据');
  }
}

async function run() {
  console.log('========================================');
  console.log('CRF 微信小程序 - 完整端到端测试');
  console.log('后端:', BASE_URL + BASE_PATH);
  console.log('========================================');
  
  try {
    // 测试受试者 CRUD
    const subjectId = await testSubjectCRUD();
    
    if (subjectId) {
      // 测试各项记录
      await testIntervention(TOKEN, subjectId);
      await testWeight(TOKEN, subjectId);
      await testPGSGA(TOKEN, subjectId);
      await testMFSI(TOKEN, subjectId);
      await testAppetite(TOKEN, subjectId);
      await testInflammation(TOKEN, subjectId);
      await testGripStrength(TOKEN, subjectId);
    }
    
    // 测试统计和导出
    await testStats(TOKEN);
    await testExport(TOKEN);
    
    // 验证数据
    await testListAllSubjects(TOKEN);
    
    console.log('\n========================================');
    console.log('✅ 完整端到端测试完成！');
    console.log('========================================');
    
  } catch (err) {
    console.error('\n❌ 测试失败:', err);
  }
}

run();
