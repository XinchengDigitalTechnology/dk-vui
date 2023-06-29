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
      external: ['vue'],
      output: {
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
