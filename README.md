# 部署说明
# 1. 安装依赖：npm install
# 2. 配置环境变量：复制 .env.example 为 .env 并填写相应值
# 3. 开发模式：npm run dev
# 4. 构建项目：npm run build  
# 5. 部署到Cloudflare：npm run deploy


# curl -X POST https://your-worker.workers.dev/api/agents/codeReviewAgent/generate \
#  -H "Content-Type: application/json" \
# -d '{"messages": ["请审查这段代码：function add(a,b){return a+b}"]}'