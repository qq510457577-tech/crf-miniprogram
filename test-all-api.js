// CRF API 完整测试脚本
const BASE_URL = 'https://zhongyibianzhengdafen.fun/CRF';
const LOGIN_URL = `${BASE_URL}/api/auth/local/login`;
const TRPC_URL = `${BASE_URL}/api/trpc`;

async function login() {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'orz@123456' })
  });
  const data = await res.json();
  if (!data.success || !data.token) {
    throw new Error('Login failed: ' + JSON.stringify(data));
  }
  console.log('✅ Login success:', data.user.name);
  return data.token;
}

async function trpcQuery(endpoint, params = {}) {
  const url = `${TRPC_URL}/${endpoint}?input=${encodeURIComponent(JSON.stringify(params))}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${globalThis.token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`API Error: ${data.error.json?.message || data.error.message}`);
  }
  // 提取 superjson json 字段
  const resultData = data.result?.data;
  return (resultData && resultData.json !== undefined) ? resultData.json : resultData;
}

async function runTests() {
  console.log('\n=== CRF API 完整测试 ===\n');

  // 1. 登录
  globalThis.token = await login();

  const tests = [
    { name: 'crf.subject.list', fn: () => trpcQuery('crf.subject.list', { page: 1, pageSize: 5 }) },
    { name: 'crf.intervention.list', fn: () => trpcQuery('crf.intervention.list', { subjectId: 1 }) },
    { name: 'crf.weight.list', fn: () => trpcQuery('crf.weight.list', { subjectId: 1 }) },
    { name: 'crf.bodyComposition.list', fn: () => trpcQuery('crf.bodyComposition.list', { subjectId: 1 }) },
    { name: 'crf.gripStrength.list', fn: () => trpcQuery('crf.gripStrength.list', { subjectId: 1 }) },
    { name: 'crf.pgsga.list', fn: () => trpcQuery('crf.pgsga.list', { subjectId: 1 }) },
    { name: 'crf.mfsi.list', fn: () => trpcQuery('crf.mfsi.list', { subjectId: 1 }) },
    { name: 'crf.appetite.list', fn: () => trpcQuery('crf.appetite.list', { subjectId: 1 }) },
    { name: 'crf.inflammation.list', fn: () => trpcQuery('crf.inflammation.list', { subjectId: 1 }) },
    { name: 'crf.followUp.list', fn: () => trpcQuery('crf.followUp.list', { subjectId: 1 }) },
    { name: 'export.allSubjects', fn: () => trpcQuery('export.allSubjects') },
    { name: 'stats.overview', fn: () => trpcQuery('stats.overview') },
  ];

  let passed = 0, failed = 0;
  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      const isArray = Array.isArray(result);
      const hasData = result && (isArray ? result.length >= 0 : (result.data !== undefined || Object.keys(result).length > 0));
      console.log(`✅ ${test.name}: ${isArray ? `[${result.length} items]` : JSON.stringify(result).slice(0, 80)}`);
      results.push({ name: test.name, status: '✅', detail: isArray ? `${result.length} items` : 'OK' });
      passed++;
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
      results.push({ name: test.name, status: '❌', detail: err.message });
      failed++;
    }
  }

  console.log(`\n=== 测试结果: ${passed} 通过, ${failed} 失败 ===\n`);

  // 验证数据结构
  console.log('=== 数据结构验证 ===');
  try {
    const subjectList = await trpcQuery('crf.subject.list', { page: 1, pageSize: 2 });
    console.log('subject.list 返回格式:');
    console.log('  - res.data:', Array.isArray(subjectList.data) ? `Array[${subjectList.data.length}]` : 'NOT ARRAY');
    console.log('  - res.total:', typeof subjectList.total);
    console.log('  - res.page:', typeof subjectList.page);
    console.log('  - res.pageSize:', typeof subjectList.pageSize);

    if (Array.isArray(subjectList.data)) {
      console.log('  ✅ 数据格式正确');
    } else {
      console.log('  ❌ 数据格式错误: 期望 data 是数组');
    }
  } catch (err) {
    console.log('  ❌ 验证失败:', err.message);
  }
}

runTests().catch(console.error);
