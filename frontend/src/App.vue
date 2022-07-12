<!-- 
  Copyright 2022 Hewlett Packard Enterprise Development LP. 
-->

<template>
  <div id="app" class="has-background-grey">
    <Navbar></Navbar>
    <router-view/>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";

export default {
  components: {
    Navbar
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 1000px;
}
</style>
