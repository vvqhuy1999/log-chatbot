
<script setup>
// App.vue chỉ cần router-view để render các component
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
}

/* Remove any default styling */
html {
  overflow: hidden;
}
</style>
