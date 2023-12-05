<script setup>
import { routes } from '../router'
import { useRoute } from 'vue-router'
const route = useRoute()

const maps = {
  components: '组件',
  directives: '指令'
}
const menus = routes.reduce((acc, cur) => {
  let fullPath = cur.path
  const paths = fullPath.substring(1).split('/')
  const [parant, child] = paths
  const path = `/${parant}`
  if (path === '/') return acc
  if (path === '/index') {
    acc.unshift({ path, name: parant })
    return acc
  }
  if (child) {
    const index = acc.findIndex(d => d.path === path)
    if (index > -1) {
      acc[index].children.push({ path: fullPath, name: child })
    } else {
      acc.push({ path, name: maps[parant] || parant, children: [{ path: fullPath, name: child }] })
    }
  } else {
    acc.push({ path, name: parant })
  }
  return acc
}, [])
console.log('menus', menus)
</script>

<template>
  <div class="app-header">
    <div class="logo">dk-vui</div>
  </div>
  <div class="app-container">
    <el-scrollbar class="menu">
      <div class="menu-list">
        <template v-for="(da, idx) in menus">
          <div class="menu-group" v-if="da.children">
            <h3 class="menu-title">{{ da.name }}</h3>
            <div v-for="(d, i) in da.children" :key="i" class="menu-item" :class="d.path === route.path && 'is--active'">
              <router-link :to="d.path">
                <el-link :underline="false" :type="d.path === route.path ? 'primary' : 'default'">{{ d.name }}</el-link>
              </router-link>
            </div>
          </div>
          <div v-else class="menu-item">
            <router-link :to="da.path">
              <el-link :underline="false">{{ da.name }}</el-link>
            </router-link>
          </div>
        </template>
      </div>
    </el-scrollbar>
    <div class="body">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
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

  .menu {
    padding: 3rem 2rem;
    position: fixed;
    left: 0;
    top: 50px;
    bottom: 0;
    width: var(--menu-width);
    background-color: #fff;

    &-group {
      .menu-item {
        padding-left: 15px;
      }
    }

    &-title {
      margin: 0;
    }

    .el-link,
    &-title {
      display: block;
      padding: 10px;
    }
    .is--active{
      .el-link__inner{
        font-weight: bold;
      }
    }
  }
}

:root {
  --border-color: #ddd;
  --menu-width: 200px;
}

.body {
  height: 100%;
  margin-left: calc(var(--menu-width) + 10px);
  background-color: #fff;
  border-radius: 6px;
  padding-top: 50px;
}

.page {
  min-height: calc(100% - 30px);
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