# 高德地图API配置指南

## 当前状态分析

您的项目已经配置了高德地图API密钥，但缺少安全密钥配置。当前配置：
- ✅ API密钥已配置：`5c65d76d3600ef99bc76b95adb89c022`
- ❌ 安全密钥未配置：`your_amap_security_js_code_here`

## 高德地图API申请和配置步骤

### 1. 注册高德开放平台账号

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 点击右上角"注册/登录"
3. 使用手机号或邮箱注册账号
4. 完成实名认证（个人或企业）

### 2. 创建应用

1. 登录后进入控制台
2. 点击"应用管理" → "我的应用"
3. 点击"创建新应用"
4. 填写应用信息：
   - 应用名称：`上海城市跑`
   - 应用类型：`Web端`
   - 应用描述：`城市跑步路线规划应用`

### 3. 添加Key

1. 在应用详情页点击"添加Key"
2. 填写Key信息：
   - Key名称：`shanghai-run-web`
   - 服务平台：选择 `Web端(JS API)`
   - 白名单：
     - 开发环境：`localhost:*,127.0.0.1:*`
     - 生产环境：添加您的域名，如 `yourdomain.com`

### 4. 获取安全密钥

1. 在Key详情页找到"安全密钥"选项
2. 点击"获取安全密钥"
3. 复制生成的安全密钥

## 配置环境变量

### 开发环境配置

更新您的 `.env` 文件：

```env
# Supabase配置
VITE_SUPABASE_URL=https://briiusmbfulqxpeqhouy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaWl1c21iZnVscXhwZXFob3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzQ4MDgsImV4cCI6MjA3NjYxMDgwOH0.rnn3R7iE06qwwtu_901_6YONZ500bfmusr48N3FcZDQ

# 高德地图配置
VITE_AMAP_API_KEY=5c65d76d3600ef99bc76b95adb89c022
VITE_AMAP_SECURITY_JS_CODE=您的安全密钥

# 应用配置
VITE_APP_NAME=上海城市跑
VITE_APP_VERSION=1.0.0
```

### 生产环境配置

创建 `.env.production` 文件：

```env
# 高德地图配置（生产环境）
VITE_AMAP_API_KEY=您的生产环境API密钥
VITE_AMAP_SECURITY_JS_CODE=您的生产环境安全密钥

# 应用配置
VITE_APP_NAME=上海城市跑
VITE_APP_VERSION=1.0.0
```

## 安全配置说明

### 1. 域名白名单设置

**重要：** 必须在高德控制台设置正确的域名白名单：

- **开发环境：** `localhost:*`, `127.0.0.1:*`, `192.168.*.*:*`
- **生产环境：** 您的实际域名，如 `yourdomain.com`, `*.yourdomain.com`

### 2. 安全密钥配置

安全密钥用于增强API调用的安全性：

1. 在高德控制台启用"安全密钥"
2. 将安全密钥添加到环境变量
3. 确保密钥不被泄露到公开代码库

### 3. API调用限制

- **免费版限制：** 每日10万次调用
- **并发限制：** 每秒100次请求
- **建议：** 实现请求缓存和错误重试机制

## 常见问题解决

### 1. "INVALID_USER_KEY" 错误

**原因：** API密钥无效或已过期
**解决：**
- 检查API密钥是否正确
- 确认密钥状态是否正常
- 检查应用是否已审核通过

### 2. "INVALID_USER_DOMAIN" 错误

**原因：** 域名不在白名单中
**解决：**
- 在高德控制台添加当前域名到白名单
- 开发环境添加 `localhost:*`
- 确保域名格式正确

### 3. GPS定位失败

**原因：** 浏览器定位权限或HTTPS要求
**解决：**
- 确保网站使用HTTPS（生产环境）
- 用户授权浏览器定位权限
- 检查设备GPS功能是否开启

### 4. 地图加载失败

**原因：** 网络问题或API配置错误
**解决：**
- 检查网络连接
- 验证API密钥配置
- 查看浏览器控制台错误信息

## 测试验证

### 1. 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问路线页面
http://localhost:5173/routes

# 检查控制台是否有错误
```

### 2. 功能测试清单

- [ ] 地图正常加载显示
- [ ] GPS定位功能正常
- [ ] 路线规划功能正常
- [ ] 导航功能正常
- [ ] 无控制台错误

### 3. 性能测试

- [ ] 地图加载速度 < 3秒
- [ ] GPS定位响应 < 5秒
- [ ] 路线计算响应 < 2秒

## 部署注意事项

### 1. 环境变量管理

- 开发环境使用 `.env`
- 生产环境使用 `.env.production`
- 不要将 `.env` 文件提交到代码库

### 2. 域名配置

- 部署前更新高德控制台的域名白名单
- 确保生产域名已添加到白名单
- 测试域名和正式域名分别配置

### 3. 监控和日志

- 监控API调用量和错误率
- 设置调用量告警
- 记录GPS定位成功率

## 联系支持

如果遇到问题，可以：

1. 查看 [高德地图API文档](https://lbs.amap.com/api/javascript-api/summary)
2. 访问 [开发者论坛](https://lbs.amap.com/dev/forum)
3. 联系高德技术支持

---

**注意：** 请妥善保管您的API密钥和安全密钥，不要在公开代码库中暴露这些信息。