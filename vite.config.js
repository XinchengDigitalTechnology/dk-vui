import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoImport from 'unplugin-auto-import/vite'
import vuesetupExtend from 'vite-plugin-vue-setup-extend'

console.log('autoImport', autoImport)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuesetupExtend(),
    autoImport({
      imports: ['vue'],
      dts: false
    })],
  build: {
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    },
    lib: {
      entry: './packages/index.js',
      name: 'dk-vui'
    }
  },
  css: {
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: (atRule) => {
              if (atRule.name === 'charset') {
                atRule.remove();
              }
            }
          }
        },
      ]
    }
  }
})
