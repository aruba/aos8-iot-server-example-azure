<!-- 
Copyright 2022 Hewlett Packard Enterprise Development LP.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
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