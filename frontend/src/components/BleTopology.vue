<template>
  <div style="background: whitesmoke; width: 100%">
    <div style="margin-top: 50px; margin-bottom: 25px; margin-left: 50px;">
      <h1 class="has-text-weight-bold subtitle">All BLE Devices</h1>
    </div>
    <div style="margin-left: 50px;">
      <table class="table is-bordered is-striped is-hoverable is-fullwidth" style="display: block; height: 500px; overflow: auto;">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Access Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bledev in bledevs" :key="bledev.device_identifier">
            <th>{{ bledev.device_identifier }}</th>
            <th>{{ bledev.access_points }}</th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'BleTopology',
  data() {
    return {
      bledevs: []
    };
  },
  methods: {
    handleEvent(dev) {
      console.log(dev);
      //this.$root.$emit('bleProfile', dev);
    },
    getBleData() {
      axios.get("http://127.0.0.1:3000/tabledata/bledevtable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.bledevs = res.data.data;
      });
    }
  },
  // functions and variables loaded on page load
  beforeMount() {
    this.getBleData();
  }
};
</script>