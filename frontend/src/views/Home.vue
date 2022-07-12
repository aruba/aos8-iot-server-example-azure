<!-- 
  Copyright 2022 Hewlett Packard Enterprise Development LP. 
-->

<template id="main">
  <div>
    <div style="margin-left: 30px; margin-top: 30px;">

    </div>

    <div style="display: flex; justify-content: center; align-items: center; margin-top: 100px">
      <div class="card has-background-dark has-text-white-bis" style="clear: both; margin-right: 45px">
        <header class="card-header">
          <div class="center2">
            <p class="card-header-title has-text-white-bis">Live Structured Data</p>
          </div>
        </header>

        <div class="card-content">
          <div class="content">
            View real-time data from IoT-Hub structured into a easy to digest and filterable table.
          </div>
        </div>

        <footer class="card-footer">
          <router-link :to="{ path: 'table' }">
            <div class="center"><button class="button orange">Live Data</button></div>
          </router-link>
        </footer>
      </div>

      <div class="card has-background-dark has-text-white-bis">
        <header class="card-header">
          <div class="center2">
            <p class="card-header-title has-text-white-bis">Device Profile List</p>
          </div>
        </header>
        <div class="card-content">
          <div class="content">
            View IoT Device Profiles, Visualize Statistics, and Interact With Devices Connected to IoT Hub
          </div>
        </div>
        <footer class="card-footer">
          <router-link :to="{ path: 'stats' }">
            <div class="center"><button class="button orange">Device List</button></div>
          </router-link>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
};
</script>

<style scoped>
#main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
.card {
  height: 250px;
  width: 600px;
}
.center {
  margin: 0;
  position: absolute;
  top: 85%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.center2 {
  margin-top: 30px;
  position: relative;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.orange {
  background-color: #FF8C00;
  color: white;
  border: none;
  font-size: 16px;
}
</style>