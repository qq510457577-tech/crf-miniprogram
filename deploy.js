#!/usr/bin/env node
/**
 * 使用 miniprogram-ci 预览和上传小程序
 */
const fs = require('fs');
const path = require('path');
const { preview, upload, Project } = require('miniprogram-ci');

const projectPath = 'C:/Users/Administrator/WorkBuddy/2026-05-13-task-1/crf-miniprogram';
const appid = 'wx41a6a2d519afd5ef';
const privateKeyPath = 'C:/Users/Administrator/WorkBuddy/2026-05-13-task-1/private.wx41a6a2d519afd5ef.key';

// 创建项目对象
const project = fs.existsSync(privateKeyPath) ? new Project({
  appid,
  type: 'miniProgram',
  projectPath,
  privateKeyPath,
  ignores: ['node_modules/**/*'],
}) : null;

async function runPreview() {
  console.log('开始预览...\n');
  
  try {
    const previewResult = await preview({
      project,
      packageOptions: {
        ignoreNpmFiles: true,
      },
      proxyIp: undefined,
      appid,
      setting: {
        es6: true,
        es7: true,
        enhance: true,
        postcss: true,
        minified: true,
        autoAudits: false,
        urlCheck: false,
      },
      qrOptions: {
        // 生成二维码图片
        generateQRCode: true,
        qrCodeOutputDest: path.join(projectPath, 'preview-qr.png'),
      },
      onProgressUpdate: (progress) => {
        console.log(`[${progress.type}] ${progress.message}`);
      },
    });
    
    console.log('\n✅ 预览成功！');
    console.log('二维码已保存到:', path.join(projectPath, 'preview-qr.png'));
    return previewResult;
  } catch (err) {
    console.error('\n❌ 预览失败:', err.message);
    if (err.response) {
      console.error('响应详情:', err.response.data);
    }
    return null;
  }
}

async function runUpload() {
  console.log('\n开始上传...\n');
  
  try {
    // 检查私钥文件是否存在
    if (!fs.existsSync(privateKeyPath)) {
      console.log('⚠️  私钥文件不存在，跳过上传');
      console.log('如需上传，请先在微信公众平台下载私钥');
      return null;
    }
    
    const uploadResult = await upload({
      project,
      packageOptions: {
        ignoreNpmFiles: true,
      },
      version: '1.0.0',
      desc: 'CRF数据采集平台 - 端到端测试完成后上传',
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
        console.log(`[${progress.type}] ${progress.message}`);
      },
    });
    
    console.log('\n✅ 上传成功！');
    console.log('版本: 1.0.0');
    return uploadResult;
  } catch (err) {
    console.error('\n❌ 上传失败:', err.message);
    if (err.response) {
      console.error('响应详情:', err.response.data);
    }
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--upload')) {
    await runUpload();
  } else if (args.includes('--all')) {
    await runPreview();
    await runUpload();
  } else {
    await runPreview();
  }
}

main().catch(console.error);
