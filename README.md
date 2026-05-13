# CRF Platform 微信小程序

基于 TDesign 组件库的 CRF 数据采集平台微信小程序，连接后端 API：
`https://zhongyibianzhengdafen.fun:8000/CRF`

## 功能模块

- [x] 用户登录（用户名密码）
- [x] 首页概览（受试者统计、分组情况）
- [x] 受试者列表（搜索、筛选、分组）
- [x] 受试者详情（查看、编辑、删除）
- [x] 新增受试者
- [x] 干预记录（按周次录入）
- [x] 体重记录
- [x] 握力记录
- [x] PG-SGA 营养评估
- [x] 食欲评估
- [x] 数据统计（分组分布、肿瘤类型）
- [x] 数据导出
- [x] 个人中心

## 项目结构

```
miniprogram/
├── app.json              # 小程序配置（页面、TabBar、窗口）
├── app.ts                # 全局 App 实例（登录状态管理）
├── app.wxss              # 全局样式
├── package.json          # npm 依赖
├── project.config.json   # 微信开发者工具配置
├── types/
│   ├── crf.ts           # CRF 业务类型定义
│   └── global.d.ts       # 全局类型声明
├── services/
│   ├── api.ts            # tRPC API 调用层
│   └── auth.ts           # 认证服务（登录/登出）
└── pages/
    ├── login/            # 登录页
    ├── home/             # 首页（概览）
    ├── subject-list/      # 受试者列表
    ├── subject-detail/     # 受试者详情/编辑/新建
    ├── record-form/       # 记录表单
    ├── stats/            # 数据统计
    └── my/              # 个人中心
```

## 快速开始

### 1. 配置 AppID

编辑 `project.config.json`，将 `YOUR_APPID` 替换为你的微信小程序 AppID。

### 2. 安装依赖

在微信开发者工具中打开项目根目录，执行：
```bash
npm install
```

### 3. 构建 npm

在微信开发者工具中：`工具 → 构建 npm`

### 4. 打开项目

用微信开发者工具打开 `miniprogram/` 目录。

## 注意事项

1. **域名白名单**：确保 `zhongyibianzhengdafen.fun:8000` 已在微信公众平台配置为服务器域名。
2. **开发时**：关闭域名校验可在微信开发者工具中临时启用"不校验合法域名"。
3. **TabBar 图标**：需在 `miniprogram/assets/` 下放置对应图标文件。

## 技术栈

- **框架**：微信小程序原生 + TypeScript
- **组件库**：TDesign Miniprogram
- **后端通信**：tRPC over HTTPS
