const ci = require('miniprogram-ci');
const path = require('path');

// 项目配置
const projectPath = path.resolve(__dirname, 'miniprogram');
const appid = 'wx51fce73370eaf709';

// 创建项目实例
const project = new ci.Project({
  appid: appid,
  type: 'miniProgram',
  projectPath: projectPath,
  privateKeyPath: path.resolve(__dirname, 'private.key'), // 可选，如果有的话
});

// 构建 npm
async function buildNpm() {
  try {
    console.log('开始构建 npm...');
    const result = await ci.buildNpm(project, {
      // 默认情况下，会读取 miniprogram/package.json 的 dependencies
      // 并将对应的 npm 包构建到 miniprogram_npm/ 目录
    });
    console.log('✅ npm 构建成功！', result);
    return true;
  } catch (error) {
    console.error('❌ npm 构建失败：', error.message);
    // 如果没有私钥，buildNpm 可能仍然可以工作（因为它只是本地构建）
    // 让我们尝试不使用私钥
    return false;
  }
}

buildNpm().then(success => {
  if (!success) {
    console.log('尝试不使用私钥构建...');
    // 不使用私钥再试一次
    const projectWithoutKey = new ci.Project({
      appid: appid,
      type: 'miniProgram',
      projectPath: projectPath,
    });
    
    ci.buildNpm(projectWithoutKey).then(result => {
      console.log('✅ npm 构建成功（无私钥）！', result);
    }).catch(err => {
      console.error('❌ npm 构建失败（无私钥）：', err.message);
    });
  }
});