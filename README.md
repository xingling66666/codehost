# CloudCode 代码托管平台

基于 **Cloudflare Workers + KV** 的代码托管后端，为开发者提供"上传代码文件 → 生成专属 URL → 远程执行 / 云更新"的一站式能力。

## 功能特性

- **专属 URL**：每个文件分配一个专属数字 ID，访问 `https://你的域名/1` 即可获取代码内容，供脚本远程执行 / 云端拉取更新。
- **ID 不自动复用**：删除文件后，该 ID 被"占用保留"，不会自动分配给新文件。
- **手动释放 ID**：管理员可手动释放被删除文件的 ID，释放后该 ID 可被新文件复用。
- **根路径空白**：访问 `/` 返回空白页面，不影响访问体验。
- **精美管理后台**：`/admin` 入口，Material Design 3 风格，蓝紫渐变配色，无 emoji。
- **密码鉴权**：管理接口全部需要登录 token。

## 路由说明

| 路径 | 说明 |
|------|------|
| `GET /` | 空白页面 |
| `GET /{id}` | 返回对应 ID 的代码内容（远程执行 / 云更新用） |
| `GET /admin` | 管理后台页面（需登录） |
| `POST /admin/api/login` | 登录，body `{password}` |
| `POST /admin/api/upload` | 上传代码文件 |
| `GET /admin/api/files` | 列出所有文件 |
| `GET /admin/api/files/{id}` | 获取单个文件元数据 |
| `PUT /admin/api/files/{id}` | 更新文件 |
| `DELETE /admin/api/files/{id}` | 删除文件（不释放 ID） |
| `POST /admin/api/release/{id}` | 手动释放 ID（允许复用） |
| `GET /admin/api/stats` | 统计信息 |

## 目录结构

```
cloudhost/
├── worker.js         # Worker 后端逻辑
├── admin-page.js     # 管理后台页面（MD3 蓝紫渐变）
├── wrangler.toml     # Wrangler 配置
└── README.md         # 本文档
```

## 部署步骤

### 1. 前置条件

安装 [Wrangler](https://developers.cloudflare.com/workers/wrangler/) 并登录：
```bash
npm install -g wrangler
wrangler login
```

### 2. 创建 KV 命名空间

```bash
wrangler kv namespace create "KV"
```
将返回的 `id` 填入 `wrangler.toml` 的 `[[kv_namespaces]]` 的 `id` 字段。

### 3. 设置管理密码

```bash
wrangler secret put ADMIN_PASSWORD
```
输入你的管理密码（例如：`MySecurePassword123`）。

> 若未设置该 secret，将使用 `worker.js` 中的默认密码 `admin123`（仅限本地调试，生产请务必设置）。

### 4. 部署

```bash
wrangler deploy
```

部署完成后会得到一个 `*.workers.dev` 地址，例如 `https://cloudcode.你的用户名.workers.dev`。

### 5. （可选）绑定自定义域名

在 Cloudflare 控制台为该 Worker 添加自定义域名，或配置 `wrangler.toml` 的 `routes`。

## 使用流程

1. 访问 `https://你的域名/admin`，输入管理员密码登录。
2. 点击"上传代码文件"，选择或拖拽代码文件，填写备注，确认上传。
3. 系统自动分配专属 ID 并生成 URL，例如 `https://你的域名/1`。
4. 将该 URL 提供给开发者脚本，脚本访问该 URL 即可获取最新代码内容（云更新 / 远程执行）。

## 开发者调用示例

### 远程执行 / 云更新（Node.js 示例）
```js
// 云端拉取代码内容
const res = await fetch("https://你的域名/1");
const code = await res.text();
// 然后 eval / 保存 / 执行 code
```

### curl 获取代码
```bash
curl https://你的域名/1
```

### 管理 API 上传（脚本自动发布）
```bash
curl -X POST https://你的域名/admin/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"update.js","content":"console.log(\"hello\");"}'
```

## KV 存储结构

| Key | 内容 |
|-----|------|
| `counter` | 自增 ID 计数器 |
| `file:{id}` | 代码内容 |
| `meta:{id}` | 文件元数据（文件名、大小、备注、时间等） |
| `available` | 已释放可复用的 ID 列表 |
| `session:{token}` | 管理会话 |

## 安全说明

- 管理 API 全部需要 Bearer Token 鉴权。
- 请务必通过 `wrangler secret put ADMIN_PASSWORD` 设置强密码。
- 代码访问 `/` 与 `/{id}` 为公开只读，适合脚本拉取。
