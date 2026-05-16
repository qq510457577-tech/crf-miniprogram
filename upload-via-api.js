#!/usr/bin/env node
/**
 * 通过 GitHub API 上传文件
 * 绕过 git push 的网络限制
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN || '';
if (!TOKEN) {
  console.error('❌ 请设置环境变量 GITHUB_TOKEN');
  process.exit(1);
}
const OWNER = 'qq510457577-tech';
const REPO = 'crf-miniprogram';
const BRANCH = 'main';

// 需要上传的文件列表
const files = [
  'API_VERIFICATION.md',
  'E2E_TEST_REPORT.md',
  'E2E_TEST_REPORT_v3.md',
  'e2e-full-test-v2.js',
  'e2e-full-test-v3.js',
  'e2e-full-test.js',
  'e2e-test-fried.js',
  'full-e2e-test.js',
  'test-all-api.js',
  'test-api-direct.js',
  'test-api-simple.js'
];

// 提交信息
const commitMessage = 'test: 完成端到端测试，所有19项测试通过\n\n- 添加完整端到端测试脚本\n- 添加测试报告\n- 验证所有CRUD操作正常工作';

async function getFileSha(filePath) {
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`;
    const options = {
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'NodeJS',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          resolve(json.sha);
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function uploadFile(localPath, repoPath, sha) {
  const content = fs.readFileSync(localPath, 'base64');
  
  const body = JSON.stringify({
    message: commitMessage,
    content: content,
    branch: BRANCH,
    sha: sha,
    committer: {
      name: 'WorkBuddy',
      email: 'workbuddy@auto'
    }
  });
  
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}`;
    const options = {
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'NodeJS',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ 上传成功: ${repoPath}`);
          resolve(true);
        } else {
          console.error(`❌ 上传失败: ${repoPath} (${res.statusCode})`);
          console.error(data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error(`❌ 错误: ${repoPath}`, err.message);
      resolve(false);
    });
    
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('开始上传文件到 GitHub...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  文件不存在: ${file}`);
      failed++;
      continue;
    }
    
    // 获取文件的 SHA（如果已存在）
    const sha = await getFileSha(file);
    const action = sha ? '更新' : '创建';
    
    console.log(`${action}: ${file}`);
    const result = await uploadFile(file, file, sha);
    
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // 避免 API 速率限制
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n完成: ${success} 成功, ${failed} 失败`);
}

main().catch(console.error);
