#!/usr/bin/env node
/**
 * 构建脚本：编译 TypeScript 到 JavaScript（同目录覆盖）
 * 微信小程序需要 .js 文件，用 tsc 编译 .ts 源文件
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectDir = __dirname;
const miniprogramDir = path.join(projectDir, 'miniprogram');
const tscPath = path.join(miniprogramDir, 'node_modules', '.bin', 'tsc.cmd');
const tsconfigPath = path.join(projectDir, 'tsconfig.json');
const tempDir = path.join(projectDir, 'ts_build_tmp');

// 检查 tsc
const actualTsc = fs.existsSync(tscPath) ? tscPath : 'npx tsc';

console.log('开始编译 TypeScript...\n');

try {
  // 1. 编译到临时目录
  execSync(
    `"${actualTsc}" --project "${tsconfigPath}" --outDir "${tempDir}"`,
    { stdio: 'inherit', cwd: projectDir }
  );

  // 2. 把编译好的 .js 复制回 miniprogram 目录（覆盖旧的 .js）
  const copyRecursive = (src, dest) => {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      for (const file of fs.readdirSync(src)) {
        copyRecursive(path.join(src, file), path.join(dest, file));
      }
    } else if (src.endsWith('.js') || src.endsWith('.js.map') || src.endsWith('.d.ts')) {
      // 只复制编译产物
      fs.copyFileSync(src, dest);
    }
  };

  copyRecursive(tempDir, miniprogramDir);

  // 3. 删除临时目录
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log('\n✅ 编译完成！所有 .ts 已转为 .js');
} catch (err) {
  console.error('\n❌ 编译失败:', err.message);
  process.exit(1);
}
