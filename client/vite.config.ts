import path from 'path';

import vue from '@vitejs/plugin-vue';
import { BilldHtmlWebpackPlugin, logData } from 'billd-html-webpack-plugin';
import autoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import unpluginVueComponents from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';
import { createHtmlPlugin } from 'vite-plugin-html';

import pkg from './package.json';

const isWeb = process.env['VITE_APP_RELEASE_PROJECT_ISWEB'] === 'true';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const outputStaticUrl = () => {
    if (isWeb) {
      // Web 版自托管：根路径，由 nginx 托管
      return '/';
    } else {
      if (isProduction) {
        return './';
      } else {
        return './';
      }
    }
  };

  return {
    base: outputStaticUrl(),
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use 'billd-scss/src/index.scss' as *;@import "@/assets/css/constant.scss";`,
        },
      },
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
    },
    plugins: [
      vue(),
      createHtmlPlugin({
        inject: {
          data: {
            // @ts-ignore
            title: pkg.productName,
          },
        },
      }),
      ...(!isWeb ? [electron({
        main: {
          entry: 'electron-main/index.ts',
          vite: {
            build: {
              outDir: 'electron-dist',
              lib: {
                entry: 'electron-main/index.ts',
                formats: ['cjs'],
                fileName: () => '[name].cjs',
              },
            },
          },
        },
        preload: {
          input: 'electron-main/preload.ts',
          vite: { build: { outDir: 'electron-dist' } },
        },
      })] : []),
      // 注：Web 构建移除了 electron 插件、type-check 与 eslint，避免构建失败并加快速度
      autoImport({
        imports: [
          {
            'naive-ui': ['useMessage', 'useNotification'],
          },
        ],
      }),
      unpluginVueComponents({
        // eslint-disable-next-line
        resolvers: [NaiveUiResolver()],
      }),
      new BilldHtmlWebpackPlugin({ env: 'vite4' }).config,
    ],
    define: {
      'process.env': {
        BilldHtmlWebpackPlugin: logData(null),
        NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
        PUBLIC_PATH: outputStaticUrl(),
        VUE_APP_RELEASE_PROJECT_NAME: JSON.stringify(
          process.env.VUE_APP_RELEASE_PROJECT_NAME
        ),
        VUE_APP_RELEASE_PROJECT_ENV: JSON.stringify(
          process.env.VUE_APP_RELEASE_PROJECT_ENV
        ),
        VUE_APP_RELEASE_PROJECT_VERSION: JSON.stringify(pkg.version),
      },
    },

    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:4300',
          secure: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/'),
        },
      },
    },
  };
});
