// CRF 完整端到端测试 v2 - 创建、读取、更新、删除
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

function extractResult(res) {
  // 提取 superjson 包装的结果
  return res?.data?.result?.data?.json ?? res?.data?.result?.data ?? res?.data;
}

async function run() {
  console.log('========================================');
  console.log('CRF 微信小程序 - 完整端到端测试 v2');
  console.log('后端:', BASE_URL + BASE_PATH);
  console.log('========================================\n');
  
  const results = [];
  let subjectId = null;
  
  try {
    // === 1. 创建受试者 ===
    console.log('【1】创建受试者');
    const createRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.subject.create`,
      { json: { 
        subjectUniqueId: 'E2E-TEST-001', 
        studyName: '端到端完整测试', 
        gender: '男', 
        age: 68, 
        interventionGroup: '八段锦训练', 
        tumorType: '食管癌', 
        clinicalStage: 'III期' 
      } }, TOKEN);
    const createData = extractResult(createRes);
    subjectId = createData?.id;
    console.log('  结果: ID=' + subjectId + (subjectId ? ' ✅' : ' ❌'));
    console.log('  原始响应:', JSON.stringify(createRes.data).slice(0, 200));
    results.push({ test: '创建受试者', status: subjectId ? '✅' : '❌', detail: 'ID=' + subjectId });
    
    if (!subjectId) {
      console.log('\n❌ 无法继续测试，受试者创建失败');
      return results;
    }
    
    // === 2. 读取受试者 ===
    console.log('\n【2】读取受试者');
    const getRes = await httpRequest('GET', 
      `${BASE_PATH}/api/trpc/crf.subject.getById?input=${encodeURIComponent(JSON.stringify({id: subjectId}))}`,
      null, TOKEN);
    const subject = extractResult(getRes);
    console.log('  编号:', subject?.subjectUniqueId, '  年龄:', subject?.age, '  分组:', subject?.interventionGroup);
    console.log('  结果:', subject?.subjectUniqueId === 'E2E-TEST-001' ? '✅' : '❌');
    results.push({ test: '读取受试者', status: subject?.subjectUniqueId === 'E2E-TEST-001' ? '✅' : '❌' });
    
    // === 3. 更新受试者 ===
    console.log('\n【3】更新受试者');
    const updateRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.subject.update`,
      { json: { id: subjectId, data: { age: 69 } } }, TOKEN);
    const updateData = extractResult(updateRes);
    console.log('  更新成功:', updateData?.success ? '✅' : '❌');
    results.push({ test: '更新受试者', status: updateData?.success ? '✅' : '❌' });
    
    // === 4. 验证更新 ===
    console.log('\n【4】验证更新');
    const verifyRes = await httpRequest('GET', 
      `${BASE_PATH}/api/trpc/crf.subject.getById?input=${encodeURIComponent(JSON.stringify({id: subjectId}))}`,
      null, TOKEN);
    const updatedSubject = extractResult(verifyRes);
    console.log('  更新后年龄:', updatedSubject?.age, updatedSubject?.age === 69 ? '✅' : '❌');
    results.push({ test: '验证更新', status: updatedSubject?.age === 69 ? '✅' : '❌' });
    
    // === 5. 创建干预记录 ===
    console.log('\n【5】创建干预记录');
    const intRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.intervention.upsert`,
      { json: { subjectId, week: 1, data: { duration: 30, completed: true, notes: '干预测试' } } }, TOKEN);
    const intData = extractResult(intRes);
    console.log('  干预ID:', intData?.id, intData?.id ? '✅' : '❌');
    results.push({ test: '创建干预记录', status: intData?.id ? '✅' : '❌', detail: 'ID=' + intData?.id });
    
    // === 6. 获取干预记录列表 ===
    console.log('\n【6】获取干预记录列表');
    const intListRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.intervention.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
      null, TOKEN);
    const interventions = extractResult(intListRes);
    console.log('  记录数:', interventions?.length, interventions?.length > 0 ? '✅' : '❌');
    console.log('  详情:', JSON.stringify(interventions).slice(0, 200));
    results.push({ test: '获取干预记录', status: interventions?.length > 0 ? '✅' : '❌', detail: 'count=' + interventions?.length });
    
    // === 7. 创建体重记录 ===
    console.log('\n【7】创建体重记录');
    const weightRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.weight.upsert`,
      { json: { subjectId, week: 1, data: { weight: 65.5 } } }, TOKEN);
    const weightData = extractResult(weightRes);
    console.log('  体重ID:', weightData?.id, weightData?.id ? '✅' : '❌');
    results.push({ test: '创建体重记录', status: weightData?.id ? '✅' : '❌' });
    
    // === 8. 获取体重记录列表 ===
    console.log('\n【8】获取体重记录列表');
    const weightListRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.weight.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
      null, TOKEN);
    const weights = extractResult(weightListRes);
    console.log('  记录:', JSON.stringify(weights));
    results.push({ test: '获取体重记录', status: weights?.length > 0 ? '✅' : '❌' });
    
    // === 9. 创建 PG-SGA ===
    console.log('\n【9】创建 PG-SGA 记录');
    const pgsgaRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.pgsga.upsert`,
      { json: { subjectId, week: 1, data: { score: 8, weightLoss: 2 } } }, TOKEN);
    const pgsgaData = extractResult(pgsgaRes);
    console.log('  结果:', JSON.stringify(pgsgaData));
    results.push({ test: '创建PG-SGA', status: pgsgaData?.id ? '✅' : '❌' });
    
    // === 10. 获取 PG-SGA ===
    console.log('\n【10】获取 PG-SGA 列表');
    const pgsgaListRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.pgsga.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
      null, TOKEN);
    const pgsga = extractResult(pgsgaListRes);
    console.log('  记录:', JSON.stringify(pgsga));
    results.push({ test: '获取PG-SGA', status: pgsga?.length > 0 ? '✅' : '❌' });
    
    // === 11. 创建 MFSI ===
    console.log('\n【11】创建 MFSI 疲劳量表');
    const mfsiRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.mfsi.upsert`,
      { json: { subjectId, week: 1, data: { fatigueScore: 45 } } }, TOKEN);
    const mfsiData = extractResult(mfsiRes);
    console.log('  结果:', JSON.stringify(mfsiData));
    results.push({ test: '创建MFSI', status: mfsiData?.id ? '✅' : '❌' });
    
    // === 12. 获取 MFSI ===
    console.log('\n【12】获取 MFSI 列表');
    const mfsiListRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.mfsi.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
      null, TOKEN);
    const mfsi = extractResult(mfsiListRes);
    console.log('  记录:', JSON.stringify(mfsi));
    results.push({ test: '获取MFSI', status: mfsi?.length > 0 ? '✅' : '❌' });
    
    // === 13. 创建食欲记录 ===
    console.log('\n【13】创建食欲记录');
    const appetiteRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.appetite.upsert`,
      { json: { subjectId, week: 1, data: { score: 7 } } }, TOKEN);
    const appetiteData = extractResult(appetiteRes);
    console.log('  结果:', JSON.stringify(appetiteData));
    results.push({ test: '创建食欲记录', status: appetiteData?.id ? '✅' : '❌' });
    
    // === 14. 获取食欲记录 ===
    console.log('\n【14】获取食欲列表');
    const appetiteListRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.appetite.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
      null, TOKEN);
    const appetite = extractResult(appetiteListRes);
    console.log('  记录:', JSON.stringify(appetite));
    results.push({ test: '获取食欲记录', status: appetite?.length > 0 ? '✅' : '❌' });
    
    // === 15. 创建炎症指标 ===
    console.log('\n【15】创建炎症指标');
    const infRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.inflammation.upsert`,
      { json: { subjectId, week: 1, data: { crp: 5.2, albumin: 38.5 } } }, TOKEN);
    const infData = extractResult(infRes);
    console.log('  结果:', JSON.stringify(infData));
    results.push({ test: '创建炎症指标', status: infData?.id ? '✅' : '❌' });
    
    // === 16. 获取炎症指标 ===
    console.log('\n【16】获取炎症指标列表');
    const infListRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.inflammation.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
      null, TOKEN);
    const inflammation = extractResult(infListRes);
    console.log('  记录:', JSON.stringify(inflammation));
    results.push({ test: '获取炎症指标', status: inflammation?.length > 0 ? '✅' : '❌' });
    
    // === 17. 创建握力记录 ===
    console.log('\n【17】创建握力记录');
    const gripRes = await httpRequest('POST', `${BASE_PATH}/api/trpc/crf.gripStrength.upsert`,
      { json: { subjectId, week: 1, data: { leftHand: 25.5, rightHand: 26.0 } } }, TOKEN);
    const gripData = extractResult(gripRes);
    console.log('  结果:', JSON.stringify(gripData));
    results.push({ test: '创建握力记录', status: gripData?.id ? '✅' : '❌' });
    
    // === 18. 获取握力记录 ===
    console.log('\n【18】获取握力列表');
    const gripListRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.gripStrength.list?input=${encodeURIComponent(JSON.stringify({subjectId}))}`,
      null, TOKEN);
    const grip = extractResult(gripListRes);
    console.log('  记录:', JSON.stringify(grip));
    results.push({ test: '获取握力记录', status: grip?.length > 0 ? '✅' : '❌' });
    
    // === 19. 测试统计 ===
    console.log('\n【19】测试统计数据');
    const statsRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/stats.overview?input=${encodeURIComponent('{}')}`,
      null, TOKEN);
    const stats = extractResult(statsRes);
    console.log('  总数:', stats?.total, '  分组数:', stats?.grouped);
    results.push({ test: '统计数据', status: stats?.total > 0 ? '✅' : '❌', detail: JSON.stringify(stats) });
    
    // === 20. 测试导出 ===
    console.log('\n【20】测试数据导出');
    const exportRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/export.allSubjects?input=${encodeURIComponent('{}')}`,
      null, TOKEN);
    const exportData = extractResult(exportRes);
    console.log('  导出条数:', exportData?.subjects?.length, exportData?.subjects?.length > 0 ? '✅' : '❌');
    results.push({ test: '数据导出', status: exportData?.subjects?.length > 0 ? '✅' : '❌' });
    
    // === 21. 列出所有受试者验证 ===
    console.log('\n【21】列出所有受试者验证');
    const listRes = await httpRequest('GET',
      `${BASE_PATH}/api/trpc/crf.subject.list?input=${encodeURIComponent(JSON.stringify({page:1,pageSize:100}))}`,
      null, TOKEN);
    const listData = extractResult(listRes);
    const testSubject = listData?.data?.find(s => s.subjectUniqueId === 'E2E-TEST-001');
    console.log('  总数:', listData?.total);
    console.log('  找到测试数据:', testSubject ? '✅ ID=' + testSubject.id : '❌');
    results.push({ test: '验证数据', status: testSubject ? '✅' : '❌' });
    
    // === 总结 ===
    console.log('\n========================================');
    console.log('测试结果汇总');
    console.log('========================================');
    
    const passed = results.filter(r => r.status === '✅').length;
    const failed = results.filter(r => r.status !== '✅').length;
    
    results.forEach(r => {
      console.log(`  ${r.status} ${r.test}${r.detail ? ': ' + r.detail : ''}`);
    });
    
    console.log('\n========================================');
    console.log(`总计: ${results.length} 项测试`);
    console.log(`通过: ${passed} ✅`);
    console.log(`失败: ${failed} ❌`);
    console.log('========================================');
    
    return results;
    
  } catch (err) {
    console.error('\n❌ 测试异常:', err);
    return results;
  }
}

run();
