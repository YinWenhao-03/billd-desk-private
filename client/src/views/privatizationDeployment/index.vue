<template>
  <main class="deployment">
    <h1>私有化部署</h1>
    <p>服务在你自己的服务器运行。请按照仓库 README 生成配置，再启动 Docker Compose。</p>
    <ol><li>运行 setup.py，填写服务器公网 IP 或域名。</li><li>启动服务并放行 TURN 中继端口。</li>
    <li>客户端“设置 → 接口配置”填入自建服务地址。</li></ol>
    <p>网页主控无需安装桌面客户端；Windows 被控端需要安装本项目打包的客户端。</p>
    <p>开源客户端与官方新版 Pro 客户端的协议不同。</p>
    <p>感谢 Galaxy-s10 和 BilldDesk 开源贡献者。</p>
  </main>
</template>
<style scoped>.deployment { padding: 32px; line-height: 1.8; max-width: 760px; margin: auto; }</style>
