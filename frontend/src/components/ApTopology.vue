<template>
  <div style="background: whitesmoke; width: 100%">
    <div style="margin-top: 50px; margin-bottom: 25px; margin-left: 50px;">
      <h1 class="has-text-weight-bold subtitle">All Access Points</h1>
    </div>
    <div style="margin-left: 50px;">
      <table class="table is-bordered is-striped is-hoverable is-fullwidth" style="display: block; height: 500px; overflow: auto;">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Last Health Status</th>
            <th>USB Devices</th>
            <th>Radio Devices</th>
            <th>BLE Devices</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ap in aps" :key="ap.device_id">
            <th>{{ ap.device_id }}</th>
            <th>{{ ap.last_health_status }}</th>
            <th>{{ ap.usb_devices }}</th>
            <th>{{ ap.radio_devices  }}</th>
            <th>{{ ap.ble_devices }}</th>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'ApTopology',
  data() {
    return {
      aps: []
    };
  },
  methods: {
    handleEvent(dev) {
      console.log(dev);
      //this.$root.$emit('bleProfile', dev);
    },
    getApData() {
      axios.get("http://127.0.0.1:3000/tabledata/aptable", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then((res) => {
        this.aps = res.data.data;
      });
    }
  },
  // functions and variables loaded on page load
  beforeMount() {
    this.getApData();
  }
};
</script>