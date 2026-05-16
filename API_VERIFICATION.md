# CRF 微信小程序 - API 验证报告

**测试时间**: 2026-05-16 15:35
**后端地址**: https://zhongyibianzhengdafen.fun/CRF

---

## 1. 登录 API

| 项目 | 值 |
|------|-----|
| 登录地址 | `/api/auth/local/login` |
| 方法 | POST |
| 请求体 | `{ username, password }` |
| 响应格式 | `{ success, token, user }` |
| 状态 | ✅ 正常 |

---

## 2. API 端点测试结果 (12/12 通过)

| # | 端点 | 方法 | 状态 | 响应 |
|---|------|------|------|------|
| 1 | `crf.subject.list` | GET | ✅ | `{ data: [...], total: 19, page, pageSize }` |
| 2 | `crf.intervention.list` | GET | ✅ | `[{ id, subjectId, ... }]` |
| 3 | `crf.weight.list` | GET | ✅ | `[]` (空) |
| 4 | `crf.bodyComposition.list` | GET | ✅ | `[]` (空) |
| 5 | `crf.gripStrength.list` | GET | ✅ | `[]` (空) |
| 6 | `crf.pgsga.list` | GET | ✅ | `[]` (空) |
| 7 | `crf.mfsi.list` | GET | ✅ | `[]` (空) |
| 8 | `crf.appetite.list` | GET | ✅ | `[]` (空) |
| 9 | `crf.inflammation.list` | GET | ✅ | `[]` (空) |
| 10 | `crf.followUp.list` | GET | ✅ | `[]` (空) |
| 11 | `export.allSubjects` | GET | ✅ | `{ subjects: [...] }` |
| 12 | `stats.overview` | GET | ✅ | `{ total, grouped, enrolled, avgAge, male, female }` |

---

## 3. tRPC 响应格式

```
原始响应: { result: { data: { json: { data: [...], total: N } } } }
提取后:   { data: [...], total: N, page: 1, pageSize: 20 }
```

**前端正确访问方式**:
```javascript
const res = await api.list();
const subjects = res.data;    // 数组
const total = res.total;      // 总数
```

---

## 4. 已修复的问题

| 文件 | 问题 | 修复 | 状态 |
|------|------|------|------|
| `home.js` | `res.data.list` 错误 | 改为 `res.data` | ✅ |
| `home.js` | `res.data.total` 错误 | 改为 `res.total` | ✅ |
| `subject-list.js` | `res.data.list` 错误 | 改为 `res.data` | ✅ |
| `subject-list.js` | `res.data.total` 错误 | 改为 `res.total` | ✅ |
| `stats.js` | `res.data.list` 错误 | 改为 `res.data` | ✅ |
| `app.js` | 与 app.ts 重复定义 | 清空文件 | ✅ |

---

## 5. 待验证事项

- [ ] 微信开发者工具中重新编译项目
- [ ] 登录页面 → 输入 admin / orz@123456
- [ ] 首页 → 验证受试者列表加载
- [ ] 统计页 → 验证统计数据展示
- [ ] 添加受试者 → 验证表单提交

---

## 6. 已知问题

1. **中文乱码**: 后端 API 返回的中文字段（如 studyName）存在编码问题
   - 原因: superjson + 数据库编码不一致
   - 影响: 显示乱码，但不影响数据存储
   - 状态: 后端需修复

2. **GitHub Push 失败**: 由于网络问题，无法直接 push 到 GitHub
   - 解决方案: 本地修改已完成，需手动 sync 或配置 VPN
