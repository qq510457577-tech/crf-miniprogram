const ci = require('miniprogram-ci');
const path = require('path');

const project = new ci.Project({
  appid: 'wx41a6a2d519afd5ef',
  type: 'miniProgram',
  projectPath: path.resolve(__dirname, 'miniprogram'),
  privateKeyPath: path.resolve(__dirname, 'private.key'),
});

async function buildNpm() {
  try {
    console.log('构建 npm 包...');
    const result = await ci.buildNpm(project);
    console.log('✅ 构建成功:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
  }
}

buildNpm();
