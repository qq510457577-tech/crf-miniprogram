#!/usr/bin/env node
/**
 * 服务端部署脚本 - 使用 miniprogram-ci 上传小程序
 */
const fs = require('fs');
const path = require('path');
const ci = require('miniprogram-ci');

const projectPath = __dirname;
const appid = 'wx41a6a2d519afd5ef';
const privateKeyPath = path.join(projectPath, 'private.wx41a6a2d519afd5ef.key');

async function uploadCode() {
  console.log('📦 正在创建项目对象...');
  
  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  console.log('📤 正在上传小程序代码...');
  
  try {
    const result = await ci.upload({
      project,
      version: '1.0.0',
      desc: 'CRF数据采集平台 - 服务端上传',
      setting: {
        es6: true,
        es7: true,
        enhance: true,
        postcss: true,
        minified: true,
        autoAudits: false,
        urlCheck: false,
      },
      onProgressUpdate: (progress) => {
        console.log(`[${progress.type}] ${progress.message || JSON.stringify(progress)}`);
      },
    });
    
    console.log('\n✅ 上传成功！');
    console.log('版本: 1.0.0');
    return result;
  } catch (err) {
    console.error('\n❌ 上传失败:', err.message);
    if (err.response) {
      console.error('响应详情:', JSON.stringify(err.response, null, 2));
    }
    if (err.stack) {
      console.error('堆栈:', err.stack);
    }
    return null;
  }
}

uploadCode().catch(console.error);
