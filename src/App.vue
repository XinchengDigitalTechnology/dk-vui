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
  background-color: var(--scrollbar-track-bg-color);
}

::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-bg-color);
  border-radius: 3px;
}
::-webkit-scrollbar-corner {
  background-color: transparent;
}
</style>