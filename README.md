# BilldDesk 私有部署版

基于 [Galaxy-s10/billd-desk](https://github.com/galaxy-s10/billd-desk) 和
[Galaxy-s10/billd-desk-server](https://github.com/galaxy-s10/billd-desk-server) 开源版的二次开发。
感谢原作者 Galaxy-s10 及所有贡献者。原许可证和版权声明保留于 `LICENSE.txt`。

## 本版改进

- 客户端与专用开源后端一起提供，Docker Compose 启动网页、信令、数据库、Redis 和 TURN。
- 手机网页端支持触摸滚动、上下滚动按钮、文字输入；Windows 端使用剪贴板粘贴处理中文。
- 保存设备名与连接信息；同步接口验证设备身份，服务端保存的远端密码用 AES-256-GCM 加密。
- Windows 客户端“文件”菜单可设置登录后自动启动。
- 连接详情显示实际接收帧率、视频码率、RTT、视频丢包和直连/中继路径，可导出最近 5 分钟 CSV。
- 不内置作者的服务器、个人网站、QQ、设备密码或生产密钥。TURN 凭据由服务器按设备身份签发，有效期一小时。

## 快速部署（Linux 服务器）

需要 Docker Engine + Compose v2、Python 3、可用的公网 IPv4。先下载本仓库并进入目录。

```sh
# YOUR_PUBLIC_IP 替换为你的服务器公网 IP，不要保留这个占位符。
python3 setup.py --host YOUR_PUBLIC_IP
docker compose up -d --build
docker compose ps
```

用域名时：`python3 setup.py --host desk.example.com --public-ip YOUR_PUBLIC_IP`。
脚本随机生成数据库密码、JWT 密钥、设备加密密钥及 TURN 密钥；不要上传生成的 `.env` 和
`deployment/generated/`，也不要把它们发给别人。已存在 `.env` 时脚本拒绝覆盖，避免已保存密码无法解密。

浏览器访问 `http://你的地址:8080`。安全组和防火墙须允许：

| 用途 | 端口 |
|---|---|
| 网页和信令 | TCP 8080（可用 `--port` 修改） |
| TURN | TCP/UDP 3478 |
| TURN 中继 | UDP 49160–49200 |

MySQL、Redis 和后端不暴露主机端口。TURN 使用 Linux 主机网络；Windows/Mac Docker 的网络行为不同，不作为公网部署目标。
服务端不转码画面；视频由被控电脑编码，浏览器解码，优先直连、必要时 TURN 转发。

**公网长期使用需配置 HTTPS**：HTTP 示例便于首次验证，不提供传输保密性。将 HTTPS 反向代理指向网页端口，
并把 `.env` 的 `PUBLIC_ORIGIN` 改为完整 HTTPS 源后 `docker compose up -d`。
不要将敏感页面或密码输入通过未加密 HTTP 传输。

## Windows 被控客户端

使用本项目构建的 Windows 客户端，不能用官方新版 Pro（例如 v0.600.0）替代。
首次启动后进入“设置 → 接口配置”：

- 信令：你的网页源，例如 `https://desk.example.com`。
- API：同一地址加 `/api`。
- TURN：留空自动获取；无需在客户端填写共享密钥。

点击确定后自动重载，注册并显示设备代码和密码；网页主控填写被控设备代码与密码即可连接。
“文件 → 登录 Windows 后自动启动”为当前登录用户的启动项，不支持登录前的 Windows 服务模式。

仓库 Actions 的 **Build Windows client** 可以手动运行，下载生成的安装包；也可本地打包：

```sh
cd client
pnpm install --no-frozen-lockfile
pnpm package:win
```

Node 22、pnpm 8.15.9；Windows 原生控制依赖需要在 Windows 打包。安装包未购买代码签名证书。
桌面开发：`pnpm dev`；仅网页构建：`pnpm build:web`。地址可通过 `client/.env.example` 所示变量配置，
网页默认同源，无需改源码。客户端安装包不会预置任何私人服务器。

## 性能测试

连接详情里的“实测接收帧率”根据每秒解码帧数增量计算；“轨道帧率”只是轨道属性。
RTT 是网络往返时间，不等于鼠标操作到画面反馈的端到端延时；丢包统计为采样区间的视频 RTP 丢包比例。
未取得数据时显示 `--`，不会伪造为零。
持续滚动或播放动态画面一分钟，点击“导出性能数据”；CSV 不包含网址、IP、设备代码或密码。

1080P/60 帧/2000 kbps 是默认设置目标，不保证实测 60 帧。此前部署已验证连接、手机滚动、中文输入，
同时有用户反馈约 20 帧和卡顿；尚未获得有效连续性能采样，未声称游戏级流畅或稳定 120 帧。

## 数据与限制

这是开源实验项目，仍需维护。设备自身密码沿用上游数据库格式；加密描述只适用于已保存的远端密码。
客户端本地缓存会保存设备密码；请保护操作系统账号并仅在自己的浏览器使用。
不要直接沿用他人的 `.env`，也不要把个人测试截图、日志、数据库备份、已打包的私人配置程序提交到仓库。
本仓库只提供源码和通用部署配置，没有云服务器或对外共享的免费中继。

后端构建用 TypeScript 转译器检查语法并输出 CommonJS，不代表通过上游全量类型检查。
原作者协议、桌面控制和依赖部分保留；新功能和部署集成属于本版改动。
