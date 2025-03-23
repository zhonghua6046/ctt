# CFTeleTrans (CTT) - Telegram消息转发分组对话机器人（基于Cloudflare）

这是一个基于Cloudflare Workers实现的Telegram消息转发分组对话机器人，代号 **CFTeleTrans (CTT)**，专注于将用户消息安全、高效地转发到后台群组，同时充分利用Cloudflare的免费额度（榨干CF大善人！）。该机器人支持用户验证、消息转发、频率限制、管理员管理等功能，适用于客服、社区管理等场景。

## 特点与亮点

1. **充分利用Cloudflare免费额度（榨干CF大善人！）**  
   - **CFTeleTrans (CTT)** 完全基于Cloudflare Workers部署，利用其免费额度（每天10万次请求，50次/分钟）实现高性能、低成本的机器人运行。
   - 使用Cloudflare KV存储用户状态和数据，免费额度（每天10万次读/写）足以支持中小规模用户群。
   - 零成本运行，适合个人开发者或小型团队，真正做到“榨干CF大善人”的免费资源！

2. **高效的用户验证机制**  
   - 支持按钮式验证码验证（简单数学题），防止机器人刷消息。
   - 验证状态持久化（1小时有效期），用户验证通过后无需重复验证，除非触发频率限制。
   - 删除聊天记录后重新开始，验证码会自动触发，确保用户体验流畅。

3. **消息频率限制（防刷保护）**  
   - 默认每分钟40条消息上限（可通过环境变量调整），超过限制的用户需重新验证。
   - 有效防止恶意刷消息，保护后台群组和cf免费额度。

4. **分组对话消息管理**  
   - 用户消息自动转发到后台群组的子论坛，子论坛以用户昵称命名，便于客服管理。
   - 置顶消息显示用户信息（昵称、用户名、UserID、发起时间）及通知内容
   - 每个用户独立一个分组，随时随地想聊就聊！

5. **管理员功能**  
   - 支持管理员命令：`/block`（拉黑用户）、`/unblock`（解除拉黑）、`/checkblock`（检查用户是否在黑名单）。
   - 管理员可通过后台群组直接回复用户消息，消息会转发到用户私聊。

6. **轻量级部署**  
   - 单文件部署（仅需一个`_worker.js`），代码简洁，易于维护。
   - 支持Cloudflare Workers和Cloudflare Pages部署，部署过程简单。

## 部署教程

### 准备工作
1. **创建Telegram Bot**：
   - 在Telegram中找到`@BotFather`，发送`/newbot`创建新机器人。
   - 按照提示设置机器人名称和用户名，获取Bot Token（例如`123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）。
2. **创建后台群组**：
   - 创建一个Telegram群组（按需设置是否公开），
   - 群组的“话题功能”打开。
   - 添加机器人为管理员，建议权限全给（消息管理，话题管理）
   - 获取群组的Chat ID（例如`-100123456789`），可以通过`@getidsbot`获取（拉它进群）。

### 部署到Cloudflare Workers

#### 步骤 1：创建Workers项目
1. 登录[Cloudflare仪表板](https://dash.cloudflare.com/)。
2. 导航到 **Workers和Pages > Workers和Pages**，点击 **创建**。
3. 点击 **Hello world**，输入一个名称（例如`cfteletrans`），再点击 **部署**
4. 点击 **编辑代码**，把原来的代码用本项目中的_worker.js代码替换后部署

#### 步骤 2：配置环境变量
1. 在Workers仪表板的 **Settings > Environment Variables** 中，添加以下变量：
- `BOT_TOKEN_ENV`：您的Telegram Bot Token（例如`123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）。
- `GROUP_ID_ENV`：后台群组的Chat ID（例如`-100123456789`）。
- `MAX_MESSAGES_PER_MINUTE_ENV`：消息频率限制（例如`40`）。
2. 点击 **部署**。

#### 步骤 3：设置Webhook
1. 访问您的Workers URL，例如`https://cfteletrans.your-username.workers.dev/registerWebhook`。
2. 如果返回`Webhook set successfully`，则Webhook设置成功。

#### 步骤 4：测试
1. 在Telegram中找到您的机器人，发送`/start`。
2. 确认收到“你好，欢迎使用私聊机器人！”并触发验证码。
3. 完成验证，确认收到合并消息，例如：
4. 发送消息，确认消息转发到后台群组的子论坛。

### 部署到Cloudflare Pages（可选）

如果您希望通过Cloudflare Pages部署（例如托管静态文件或文档），可以按照以下步骤操作：

#### 步骤 1：创建Pages项目
0. fork本项目
1. 登录[Cloudflare仪表板](https://dash.cloudflare.com/)。
2. 导航到 **Pages > Create a project**，选择 **Connect to Git**。
3. 连接您的GitHub仓库（需先将fork项目代码）。
4. 设置构建配置：(全部留空默认)
- **Framework preset**：选择`None`。
- **Build command**：留空。
- **Build output directory**：设置为`/`。
5. 点击 **Save and Deploy**。

#### 步骤 2：配置环境变量
1. 在Workers仪表板的 **Settings > Environment Variables** 中，添加以下变量：
- `BOT_TOKEN_ENV`：您的Telegram Bot Token（例如`123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）。
- `GROUP_ID_ENV`：后台群组的Chat ID（例如`-100123456789`）。
- `MAX_MESSAGES_PER_MINUTE_ENV`：消息频率限制（例如`40`）。
2. 点击 **Save and Deploy**。

#### 步骤 3：设置Webhook
1. 访问您的Workers URL，例如`https://cfteletrans.your-username.pages.dev/registerWebhook`。
2. 如果返回`Webhook set successfully`，则Webhook设置成功。

#### 步骤 4：测试
1. 在Telegram中找到您的机器人，发送`/start`。
2. 确认收到“你好，欢迎使用私聊机器人！”并触发验证码。
3. 完成验证，确认收到合并消息，例如：
4. 发送消息，确认消息转发到后台群组的子论坛。

## 参考文献

在开发过程中，以下资源提供了宝贵的参考和指导：

- [NodeSeek 帖子](https://www.nodeseek.com/post-237769-1)

## 致谢

特别感谢 [xAI](https://x.ai/) 提供的支持和灵感，帮助我完成了本项目的开发和优化。

## 贡献

欢迎提交 Issue 或 Pull Request！如果您有任何改进建议或新功能需求，请随时联系我。
