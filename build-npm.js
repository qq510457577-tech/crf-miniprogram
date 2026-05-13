const ci = require('miniprogram-ci');

const project = new ci.Project({
  appid: 'wx51fce73370eaf709',
  type: 'miniProgram',
  projectPath: process.cwd() + '/miniprogram',
  privateKeyPath: null, // 本地构建不需要私钥
});

// 尝试构建 npm
async function buildNpm() {
  try {
    // 实际上 miniprogram-ci 主要用于上传，不能直接构建 npm
    // 我们需要手动构建
    console.log('请手动在微信开发者工具中执行：工具 -> 构建 npm');
    console.log('或者，我们可以尝试使用webpack等工具手动构建');
  } catch (error) {
    console.error('构建失败：', error);
  }
}

buildNpm();