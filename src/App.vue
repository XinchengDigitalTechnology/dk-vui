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
#app{
  background-color: #fff;
}
html.dark #app{
  background-color: transparent;
}

* {
  box-sizing: border-box;
}

</style>