<template>
  <div class="about">
    <h1>{{ PRODUCT_NAME }}</h1><p>开源私有部署版</p>
    <p>感谢原作者 Galaxy-s10 和所有 GitHub 贡献者分享和维护 BilldDesk。</p>
    <p><a :href="PROJECT_GITHUB" target="_blank" rel="noopener noreferrer">原项目源码</a></p>
    <p>原项目 Copyright © 2023-2024 Galaxy-s10，遵循 MIT 许可证。</p>
  </div>
</template>
<script setup lang="ts">
import { PRODUCT_NAME, PROJECT_GITHUB } from '@/constant';
</script>
<style scoped>.about { padding: 40px 24px; text-align: center; line-height: 1.8; }</style>
