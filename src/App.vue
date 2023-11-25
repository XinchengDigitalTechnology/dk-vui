<script setup>
import layout from './layout/index.vue'
</script>

<template>
  <layout />
</template>

<style>
html,
body,
#app {
  height: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}
</style>