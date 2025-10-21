# Vercel 自动部署脚本
Write-Host "🚀 开始部署上海城市跑到 Vercel..." -ForegroundColor Green

# 检查 dist 文件夹
if (!(Test-Path "dist")) {
    Write-Host "❌ dist 文件夹不存在，请先运行 npm run build" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 检测到 dist 文件夹" -ForegroundColor Green

# 进入 dist 目录进行部署
Set-Location dist

Write-Host "📦 开始部署到 Vercel..." -ForegroundColor Yellow

# 使用 vercel 部署，自动回答问题
$env:VERCEL_ORG_ID = ""
$env:VERCEL_PROJECT_ID = ""

# 创建 vercel.json 配置
$vercelConfig = @"
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
"@

$vercelConfig | Out-File -FilePath "vercel.json" -Encoding UTF8

Write-Host "📝 已创建 vercel.json 配置文件" -ForegroundColor Green

# 执行部署
Write-Host "🔄 正在部署..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host "请查看上方输出获取访问链接" -ForegroundColor Cyan

# 返回项目根目录
Set-Location ..