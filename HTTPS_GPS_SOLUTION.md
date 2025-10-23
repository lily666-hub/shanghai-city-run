# GPS连接问题解决方案

## 问题诊断结果

通过测试发现，GPS无法连接的根本原因是：
- **现代浏览器要求GPS地理定位API只能在HTTPS安全上下文中工作**
- 在HTTP环境下，GPS API会返回错误：`Failed to query location from network service`

## 解决方案

### 1. HTTPS配置已完成
- ✅ 已安装 `@vitejs/plugin-basic-ssl`
- ✅ 已配置Vite开发服务器使用HTTPS
- ✅ 服务器现在运行在 `https://localhost:5173/`

### 2. 处理自签名证书警告

当访问 `https://localhost:5173/` 时，浏览器会显示证书警告。这是正常的，因为我们使用的是自签名证书。

**解决步骤：**
1. 在浏览器中访问 `https://localhost:5173/`
2. 点击"高级"或"Advanced"
3. 点击"继续访问localhost（不安全）"或"Proceed to localhost (unsafe)"
4. 证书被接受后，GPS功能将正常工作

### 3. 验证GPS功能

访问以下页面测试GPS功能：
- 主应用：`https://localhost:5173/run`
- GPS测试页面：`https://localhost:5173/gps-test.html`

### 4. 预期结果

在HTTPS环境下，GPS功能应该：
- ✅ 正常请求位置权限
- ✅ 成功获取GPS坐标
- ✅ 不再显示"等待GPS连接..."状态

## 技术说明

- Chrome 50+ 版本要求GPS地理定位API必须在安全上下文（HTTPS）中使用
- `localhost` 被认为是"可能安全"的上下文，但仍需要HTTPS协议
- 自签名证书在开发环境中是安全的，只需要用户手动接受一次