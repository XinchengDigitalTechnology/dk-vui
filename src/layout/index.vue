<script setup>
import { routes } from '../router'
import { useRoute } from 'vue-router'
const route = useRoute()
// const menus = routes.reduce((acc, cur) => {
//   let path = cur.path
//   const paths = path.split('/')
//   const [parant, child] = paths
//   if(child) {
//     acc.find(d => d.name === parant)
//   }
//   let name = paths.findLast(d => d)
//   const menu = {path, name}
//   if(paths.length > 2) {
//     if(!menu.children) {
//       menu.children = []
//     }
//     menu.children.push({path, name})
//   }
// }, [])
</script>

<template>
  <div class="app-header">
    <div class="logo">dk-vui</div>
  </div>
  <div class="app-container">
    <div class="menu">
      <el-scrollbar>
        <el-menu :default-active="route.path" router>
          <el-menu-item v-for="(d, i) in routes.filter(d => d.path !== '/index')" :key="i" :index="d.path">
            <template #title>{{ d.path === '/' ? '首页' : d.path.split('/').findLast(d => d) }}</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="body">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<style lang="scss">
.app-header {
  position: fixed;
  left: 0;
  top: 0;
  right: 7px;
  display: flex;
  justify-content: center;
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-menu-border-color);
  background: rgba($color: #fff, $alpha: .9);
  z-index: 100;

  .logo {
    font-size: 24px;
    font-weight: bold;
  }
}

.app-container {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;

  .el-scrollbar__view,
  .el-menu {
    height: 100%;
  }
}

:root {
  --border-color: #ddd;
  --menu-width: 100px;
}

.menu {
  position: fixed;
  left: 0;
  top: 50px;
  bottom: 0;
  width: var(--menu-width);
  background-color: #fff;
}

.body {
  height: 100%;
  margin-left: calc(var(--menu-width) + 10px);
  background-color: #fff;
  border-radius: 6px;
  padding-top: 50px;
}

.page {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 30px;

  table {
    border-collapse: collapse;
    width: 100%;
    background-color: var(--bg-color);
    font-size: 14px;
    line-height: 1.5em;

    th {
      border-bottom: 1px solid var(--border-color);
      padding: 0.6em 1em;
      text-align: left;
      max-width: 250px;
      white-space: pre-wrap;
    }

    td {
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      padding: 0.6em 1em;
      text-align: left;
      max-width: 250px;
      white-space: pre-wrap;
    }
  }
}
</style>